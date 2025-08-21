import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { Loader2, Send, Bot, User, FileText, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  sources?: Array<{
    title: string;
    url?: string;
    content: string;
  }>;
}

interface ChatInterfaceProps {
  onUpload?: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onUpload }) => {
  // Dynamisk hilsen basert på tid på døgnet
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'God morgen';
    if (hour < 17) return 'God ettermiddag';
    return 'God kveld';
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: `${getGreeting()}! Hva kan jeg hjelpe deg med?`,
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedTechnology, setSelectedTechnology] = useState<string>('all');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const simulateTyping = async (content: string) => {
    setIsTyping(true);
    const words = content.split(' ');
    let currentMessage = '';
    
    for (let i = 0; i < words.length; i++) {
      currentMessage += words[i] + ' ';
      setMessages(prev => prev.map(msg => 
        msg.id === 'typing' 
          ? { ...msg, content: currentMessage }
          : msg
      ));
      await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
    }
    setIsTyping(false);
  };

  // Parse Markdown content into structured sections
  const parseMarkdownSections = (content: string) => {
    const lines = content.split('\n');
    const sections: Array<{level: number, title: string, content: string}> = [];
    let currentSection: {level: number, title: string, content: string} | null = null;
    let currentContent: string[] = [];
    
    for (const line of lines) {
      // Check for headers (# ## ### ####)
      const headerMatch = line.match(/^(#{1,4})\s+(.+)$/);
      
      if (headerMatch) {
        // Save previous section if exists
        if (currentSection) {
          currentSection.content = currentContent.join('\n').trim();
          sections.push(currentSection);
        }
        
        // Start new section
        const level = headerMatch[1].length;
        const title = headerMatch[2].trim();
        currentSection = { level, title, content: '' };
        currentContent = [];
      } else if (currentSection) {
        // Add content to current section
        currentContent.push(line);
      }
    }
    
    // Add last section
    if (currentSection) {
      currentSection.content = currentContent.join('\n').trim();
      sections.push(currentSection);
    }
    
    return sections;
  };
  
  // Format Markdown section for display with image support
  const formatMarkdownSection = (section: {level: number, title: string, content: string}) => {
    const headerPrefix = '#'.repeat(section.level);
    let formatted = `${headerPrefix} ${section.title}\n\n`;
    
    // Add content with proper formatting
    const contentLines = section.content.split('\n');
    for (const line of contentLines) {
      if (line.trim()) {
        // Handle lists and other Markdown elements
        if (line.match(/^[-*+]\s/)) {
          formatted += `• ${line.substring(line.indexOf(' ') + 1)}\n`;
        } else if (line.match(/^\d+\.\s/)) {
          formatted += `${line}\n`;
        } else if (line.match(/^!\[([^\]]*)\]\(([^)]+)\)/)) {
          // Handle Markdown images: ![alt text](url)
          const imageMatch = line.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
          if (imageMatch) {
            const altText = imageMatch[1] || 'Bilde';
            const imageUrl = imageMatch[2];
            formatted += `🖼️ **${altText}**\n`;
            formatted += `📷 ${imageUrl}\n\n`;
          }
        } else if (line.match(/^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i)) {
          // Handle direct image URLs
          formatted += `🖼️ **Bilde**\n`;
          formatted += `📷 ${line}\n\n`;
        } else if (line.match(/^https?:\/\/[^\s]+/)) {
          // Handle other URLs
          formatted += `🔗 ${line}\n`;
        } else {
          formatted += `${line}\n`;
        }
      }
    }
    
    return formatted.trim();
  };

  // Load persistent documents on component mount
  React.useEffect(() => {
    const savedDocs = localStorage.getItem('uploadedDocuments');
    if (savedDocs) {
      console.log('Loaded persistent documents:', JSON.parse(savedDocs).length);
    }
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // API call to backend
      const backendUrl = import.meta.env.VITE_API_URL || 'https://web-teknotassen-erf2emgebjh7cydy.norwayeast-01.azurewebsites.net';
      const response = await fetch(`${backendUrl}/api/courses/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputValue,
          technology: selectedTechnology !== 'all' ? selectedTechnology : undefined,
          courseId: undefined,
          tenantId: undefined,
          roles: undefined,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.answer || 'Jeg forstår spørsmålet ditt, men trenger mer kontekst for å gi et godt svar.',
          role: 'assistant',
          timestamp: new Date(),
          sources: data.sources,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('API call failed');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Smart demo responses for TeknoTassen with MD content integration
      const demoResponses = [
        {
          keywords: ['dpia', 'personvern', 'gdpr', 'data protection'],
          response: 'For DPIA (Data Protection Impact Assessment) anbefaler jeg at du starter med å identifisere hvilke personopplysninger som behandles. Bruk planleggingsverktøyet under Velferdsteknologi-tabben for å strukturere prosessen. 📋'
        },
        {
          keywords: ['ros', 'risiko', 'opportunity', 'screening'],
          response: 'ROS (Risk & Opportunity Screening) er viktig for å vurdere både risikoer og muligheter. Start med å definere risikonivået og velg beregningsmetode. Verktøyet finner du under planleggingsseksjonen. 🔍'
        },
        {
          keywords: ['behovsanalyse', 'pasient', 'ansatt', 'opplæring'],
          response: 'Behovsanalyse er grunnleggende! Fokus på både pasient- og ansattbehov. Bruk verktøyet for å velge fokusområde og metode. Dette er nøkkelen til vellykket implementering. 🎯'
        },
        {
          keywords: ['velferdsteknologi', 'implementering', 'start'],
          response: 'Velkommen til velferdsteknologi! Start med planleggingsfasen (DPIA, ROS, behovsanalyse) under Velferdsteknologi-tabben. Jeg kan veilede deg gjennom hele prosessen. 🚀'
        },
        {
          keywords: ['hepro', 'hepro respons'],
          response: 'HEPRO Respons er et avansert pasientvarslingssystem! 🏥\n\n**Hovedfunksjoner:**\n• Pasientovervåking med kontinuerlig overvåking av vitale tegn\n• Automatiske varsler ved avvik\n• Real-time dataoppdateringer\n\n**Implementering (3 steg):**\n1️⃣ **Systemoppsett**: Installer server, konfigurer database, sett opp Azure AD\n2️⃣ **Brukeropprettelse**: Opprett brukere i Azure AD, tildel roller\n3️⃣ **Pasientregistrering**: Registrer pasienter, konfigurer overvåking\n\n**Beste praksis**: Test grundig, opprett prosedyrer, opplær brukere, regelmessig backup.\n\nVil du at jeg skal veilede deg gjennom et spesifikt steg? 📋'
        },
        {
          keywords: ['digital tilsyn', 'digitalt tilsyn', 'nattilsyn', 'kamera'],
          response: 'Digitalt tilsyn er en enkel og ressursbesparende måte å sjekke hvordan innbygger har det! 🌙\n\n**Hva er det?**\nÅ se til innbyggere via kamera på avstand, uten å være fysisk til stede.\n\n**Viktige funksjoner:**\n• **Anonymisering**: Fargelagt versjon uten identifiserbare detaljer\n• **Toveis kommunikasjon**: Snakk med og lytt til innbyggeren\n• **Sensorer**: Varsler ved mistenkelig aktivitet og avvik\n\n**Lovlig bruk (3 kriterier):**\n1️⃣ Skriftlig samtykke fra innbygger\n2️⃣ Nødvendig for å hindre/begrense skade\n3️⃣ I innbyggers interesse, minst inngripende\n\n**Din rolle**: Du kan utføre digitale tilsyn eller følge opp med fysisk tilsyn.\n\nVil du lære mer om implementering eller lovlig bruk? 🔍'
        },
        {
          keywords: ['varda care', 'varda'],
          response: 'Varda Care fokuserer på opplæring og bruk av velferdsteknologi! 💙\n\n**Hovedområder:**\n• Opplæring av ansatte i bruk av teknologi\n• Implementering av brukervennlige løsninger\n• Kontinuerlig støtte og veiledning\n\n**Start med planleggingsverktøyene** under Velferdsteknologi-tabben for å strukturere implementeringen. 🎯'
        },
        {
          keywords: ['aula', 'læringsplattform'],
          response: 'Aula er din læringsplattform for velferdsteknologi! 📚\n\n**Funksjoner:**\n• Strukturerte læringsmoduler\n• Interaktive oppgaver og tester\n• Sporing av progresjon\n• Tilgang til alle kurs og ressurser\n\n**Start med:**\n1️⃣ Logg inn på Aula\n2️⃣ Velg relevant kurs (f.eks. Digital Tilsyn eller HEPRO)\n3️⃣ Gjennomfør modulene steg for steg\n\nVil du at jeg skal veilede deg gjennom et spesifikt kurs? 🚀'
        }
      ];

      // Find best matching response with enhanced matching
      const userQuery = inputValue.toLowerCase();
      console.log('User query:', userQuery);
      
      let bestResponse = 'Hei! Jeg er TeknoTassen, din AI-assistent for velferdsteknologi. Jeg kan hjelpe deg med DPIA, ROS, behovsanalyse, HEPRO Respons, Digital Tilsyn og mye mer! Hva lurer du på? 🤖✨';
      
      // Enhanced matching for more specific queries
      if (userQuery.includes('hepro') && (userQuery.includes('implementering') || userQuery.includes('oppsett') || userQuery.includes('start'))) {
        bestResponse = '**HEPRO Respons Implementering - Steg for steg:** 🚀\n\n**Steg 1: Systemoppsett**\n1. Installer HEPRO Respons server\n2. Konfigurer database-tilkobling (PostgreSQL)\n3. Sett opp Azure AD-integrasjon\n4. Test grunnleggende funksjonalitet\n\n**Steg 2: Brukeropprettelse**\n1. Opprett brukere i Azure AD\n2. Tildel roller i HEPRO Respons (Admin, Bruker, Observer)\n3. Konfigurer varslingspreferanser\n4. Test innlogging og tilgang\n\n**Steg 3: Pasientregistrering**\n1. Registrer pasienter i systemet\n2. Konfigurer overvåkningsparametere\n3. Test varslingssystemet\n4. Opprett varslingsprosedyrer\n\n**Vil du at jeg skal veilede deg gjennom et spesifikt steg?** 📋';
      } else if (userQuery.includes('digital') && (userQuery.includes('tilsyn') || userQuery.includes('nattilsyn')) && (userQuery.includes('lovlig') || userQuery.includes('rettigheter'))) {
        bestResponse = '**Digitalt Tilsyn - Lovlig bruk og rettigheter:** ⚖️\n\n**3 kritiske kriterier som MÅ være oppfylt:**\n\n1️⃣ **Skriftlig samtykke** fra innbygger\n   - Må være spesifikt for digitalt tilsyn\n   - Kan trekkes tilbake når som helst\n\n2️⃣ **Nødvendighet** for å hindre/begrense skade\n   - Må være et reelt behov\n   - Kan ikke brukes "bare for sikkerhets skyld"\n\n3️⃣ **I innbyggers interesse** og minst inngripende\n   - Må være til beste for innbyggeren\n   - Ingen andre alternativer som er mindre inngripende\n\n**Viktig**: Se §4-6a i pasient- og brukerrettighetsloven.\n\n**Vil du lære mer om implementering eller beste praksis?** 🔍';
      } else if (userQuery.includes('varda') && (userQuery.includes('opplæring') || userQuery.includes('implementering'))) {
        bestResponse = '**Varda Care - Opplæring og Implementering:** 💙\n\n**Fase 1: Forberedelse**\n• Identifiser opplæringsbehov hos ansatte\n• Velg riktig teknologi for organisasjonen\n• Planlegg opplæringsprogram\n\n**Fase 2: Implementering**\n• Start med en pilotgruppe\n• Opprett brukervennlige prosedyrer\n• Gjennomfør opplæring i små grupper\n\n**Fase 3: Oppfølging**\n• Kontinuerlig støtte og veiledning\n• Regelmessig evaluering av bruk\n• Justering av prosedyrer etter behov\n\n**Start med planleggingsverktøyene** under Velferdsteknologi-tabben! 🎯';
      } else {
        // Check uploaded documents first with improved search
        const uploadedDocs = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]');
        let documentResponse = '';
        let bestOverallScore = 0;
        let bestOverallSection = null;
        let bestOverallDoc = null;
        
        if (uploadedDocs.length > 0) {
          console.log('Searching in uploaded documents:', uploadedDocs.length, 'documents');
          
          // Improved search with better scoring and context
          for (const doc of uploadedDocs) {
            const docContent = doc.content;
            const queryWords = userQuery.toLowerCase().split(' ').filter(word => word.length > 2);
            
            // Parse Markdown structure to find relevant sections
            const sections = parseMarkdownSections(docContent);
            
            // Score each section with improved algorithm
            for (const section of sections) {
              let score = 0;
              const sectionText = section.content.toLowerCase();
              const sectionTitle = section.title.toLowerCase();
              
              // Boost score for title matches
              for (const word of queryWords) {
                if (sectionTitle.includes(word)) {
                  score += 3; // Title matches are more important
                }
                if (sectionText.includes(word)) {
                  score += 1;
                }
              }
              
              // Bonus for exact phrase matches
              if (sectionText.includes(userQuery.toLowerCase())) {
                score += 5;
              }
              
              // Bonus for longer, more detailed sections
              if (section.content.length > 100) {
                score += 1;
              }
              
              // Update best overall match
              if (score > bestOverallScore) {
                bestOverallScore = score;
                bestOverallSection = section;
                bestOverallDoc = doc;
              }
            }
          }
          
          // Only use document response if we have a good match
          if (bestOverallSection && bestOverallScore >= 2) {
            const formattedSection = formatMarkdownSection(bestOverallSection);
            documentResponse = `**Fra opplastet dokument "${bestOverallDoc.title}":** 📚\n\n${formattedSection}\n\n*Dette er basert på dokumentet du lastet opp. Relevans: ${bestOverallScore} poeng.*`;
            console.log('Using document response with score:', bestOverallScore);
          } else {
            console.log('No good document match found. Best score:', bestOverallScore);
          }
        }
        
        if (documentResponse) {
          bestResponse = documentResponse;
          console.log('Using document response from:', documentResponse.substring(0, 50) + '...');
        } else {
          // Standard keyword matching with improved fallback
          let foundDemoResponse = false;
          for (const demoResponse of demoResponses) {
            if (demoResponse.keywords.some(keyword => userQuery.includes(keyword))) {
              bestResponse = demoResponse.response;
              console.log('Using demo response for keyword match');
              foundDemoResponse = true;
              break;
            }
          }
          
          // If no demo response found, provide helpful guidance
          if (!foundDemoResponse) {
            const uploadedDocs = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]');
            if (uploadedDocs.length > 0) {
              bestResponse = `Jeg forstår spørsmålet ditt, men fant ikke spesifikk informasjon i mine opplastede dokumenter. Jeg har ${uploadedDocs.length} dokument(er) tilgjengelig. Prøv å:\n\n• Stille spørsmålet på en annen måte\n• Bruke andre ord eller termer\n• Spørre om noe mer generelt\n\nEller last opp flere relevante dokumenter så kan jeg hjelpe deg bedre! 📚`;
            } else {
              bestResponse = `Jeg forstår spørsmålet ditt, men har ingen opplastede dokumenter å søke i ennå. Last opp relevante dokumenter (f.eks. HEPRO Respons guide, Digital Tilsyn prosedyre) så kan jeg gi deg presise svar basert på faktisk innhold! 📁\n\nDu kan laste opp dokumenter under Velferdsteknologi-tabben.`;
            }
          }
        }
      }
      
      console.log('Final best response:', bestResponse.substring(0, 100) + '...');

      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: bestResponse,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessage = (content: string) => {
    // Enhanced markdown-like formatting with image support
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/🖼️ \*\*(.*?)\*\*<br \/>📷 (https?:\/\/[^<]+)/g, '<div class="my-3"><strong>$1</strong><br/><img src="$2" alt="$1" class="max-w-full h-auto rounded-lg shadow-md border border-gray-200" onerror="this.style.display=\'none\'" /></div>')
      .replace(/📷 (https?:\/\/[^<]+)/g, '<div class="my-3"><img src="$1" alt="Bilde" class="max-w-full h-auto rounded-lg shadow-md border border-gray-200" onerror="this.style.display=\'none\'" /></div>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-card">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden shadow-avatar">
            <img 
              src="/teknotassen-avatar.jpg" 
              alt="TeknoTassen"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-card-foreground">TeknoTassen AI</h1>
            <p className="text-sm text-muted-foreground">Teknisk kunnskapsassistent</p>
            <Badge variant="secondary" className="bg-tech-green/10 text-tech-green border-tech-green/20 text-xs mt-1">
              🔧 Demo Mode - Smart Responses
            </Badge>
            <Badge variant="outline" className="text-xs ml-2">
              📚 {JSON.parse(localStorage.getItem('uploadedDocuments') || '[]').length} dokument(er)
            </Badge>
          </div>
        </div>
        
        {onUpload && (
          <Button onClick={onUpload} variant="outline" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Last opp kurs</span>
          </Button>
        )}
      </div>



      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage 
                  src={message.role === 'assistant' ? '/teknotassen-avatar.jpg' : '/vera-avatar.jpg'} 
                  alt={message.role === 'assistant' ? 'TeknoTassen' : 'Bruker'}
                />
                <AvatarFallback>
                  {message.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm text-card-foreground">
                    {message.role === 'assistant' ? 'TeknoTassen' : 'Du'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                <Card className="bg-card">
                  <CardContent className="p-3">
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                    />
                  </CardContent>
                </Card>

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 space-y-1">
                                            <p className="text-xs text-muted-foreground font-medium">Kilder:</p>
                        {message.sources.map((source, index) => (
                          <div key={index} className="text-xs bg-muted p-2 rounded">
                            <p className="font-medium">{source.title}</p>
                            {source.url && (
                              <a href={source.url} className="text-tech-blue hover:underline" target="_blank" rel="noopener noreferrer">
                                Se kilde
                              </a>
                            )}
                            <p className="text-muted-foreground mt-1">{source.content.substring(0, 100)}...</p>
                          </div>
                        ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src="/teknotassen-avatar.jpg" alt="TeknoTassen" />
                <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm text-card-foreground">TeknoTassen</span>
                </div>
                <Card className="bg-card">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">Skriver...</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t bg-card">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Skriv ditt spørsmål her..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={!inputValue.trim() || isLoading}
            className="px-6"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="mt-2 text-xs text-muted-foreground text-center">
          TeknoTassen bruker RAG-teknologi for å gi deg nøyaktige svar basert på oppdatert kunnskap
        </div>
      </div>
    </div>
  );
};
