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
      content: `${getGreeting()}! Jeg er TeknoTassen, din AI-assistent for velferdsteknologi. Hva kan jeg hjelpe deg med?`,
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
            formatted += `🖼️ **${altText}**<br />📷 ${imageUrl}\n\n`;
          }
        } else if (line.match(/^https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i)) {
          // Handle direct image URLs - add image and keep going
          const imageUrl = line.trim();
          formatted += `🖼️ **Bilde**<br />📷 ${imageUrl}\n\n`;
        } else if (line.match(/^https?:\/\/[^\s]+/)) {
          // Handle other URLs
          formatted += `🔗 ${line}\n`;
        } else {
          // Regular text content
          formatted += `${line}\n`;
        }
      }
    }
    
    return formatted.trim();
  };

  // Extract relevant content from document based on user query
  const extractRelevantContent = (content: string, query: string): string => {
    const lines = content.split('\n');
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 2);
    
    let relevantLines: string[] = [];
    let inRelevantSection = false;
    
    for (const line of lines) {
      const lineLower = line.toLowerCase();
      
      // Check if this line is relevant to the query
      let isRelevant = false;
      for (const word of queryWords) {
        if (lineLower.includes(word)) {
          isRelevant = true;
          break;
        }
      }
      
      // If we find a relevant line, start collecting
      if (isRelevant) {
        inRelevantSection = true;
      }
      
      // If we're in a relevant section, collect lines
      if (inRelevantSection) {
        // Stop if we hit a new major section (starts with #)
        if (line.startsWith('#') && line.length < 100) {
          break;
        }
        
        // Add relevant lines (skip empty lines and metadata)
        if (line.trim() && !line.startsWith('{') && !line.startsWith('}') && !line.includes('"contentCategory"')) {
          relevantLines.push(line);
        }
      }
    }
    
    // If we found relevant content, format it nicely
    if (relevantLines.length > 0) {
      // Take first 10 relevant lines to avoid too long responses
      const selectedLines = relevantLines.slice(0, 10);
      return selectedLines.join('\n');
    }
    
    // Fallback: return first few lines of content
    return lines.slice(0, 5).join('\n');
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
      
      // Simplified and logical response selection
      const userQuery = inputValue.toLowerCase();
      console.log('User query:', userQuery);
      
      let bestResponse = '';
      let responseSource = '';
      
      // PRIORITY 1: Check uploaded documents first (most relevant)
      const uploadedDocs = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]');
      if (uploadedDocs.length > 0) {
        console.log('Searching in uploaded documents:', uploadedDocs.length, 'documents');
        
        let bestDocScore = 0;
        let bestDocSection = null;
        let bestDoc = null;
        
        for (const doc of uploadedDocs) {
          console.log('Searching in document:', doc.title);
          
          // Simple text search in document content
          const queryWords = userQuery.toLowerCase().split(' ').filter(word => word.length > 2);
          const docContent = doc.content.toLowerCase();
          const docTitle = doc.title.toLowerCase();
          
          let score = 0;
          
          // Score based on title relevance
          for (const word of queryWords) {
            if (docTitle.includes(word)) score += 5;
          }
          
          // Score based on content relevance
          for (const word of queryWords) {
            if (docContent.includes(word)) score += 2;
          }
          
          // Bonus for exact phrase matches
          if (docContent.includes(userQuery.toLowerCase())) score += 10;
          
          // Bonus for document type relevance
          if (userQuery.includes('hepro') && docTitle.includes('hepro')) score += 3;
          if (userQuery.includes('varda') && docTitle.includes('varda')) score += 3;
          if (userQuery.includes('nattugla') && docTitle.includes('nattugla')) score += 3;
          
          console.log(`Document "${doc.title}" score: ${score}`);
          
          if (score > bestDocScore) {
            bestDocScore = score;
            bestDoc = doc;
          }
        }
        
        // Use document response if we have a good match
        if (bestDoc && bestDocScore >= 3) {
          console.log('Using document response with score:', bestDocScore);
          
          // Extract relevant content from the document
          const relevantContent = extractRelevantContent(bestDoc.content, userQuery);
          
          bestResponse = `**Fra opplastet dokument "${bestDoc.title}":** 📚\n\n${relevantContent}`;
          responseSource = 'document';
        }
      }
      
      // PRIORITY 2: If no document response, provide helpful guidance
      if (!bestResponse) {
        console.log('No document response found, providing guidance');
        bestResponse = `Jeg fant ikke spesifikk informasjon om "${inputValue}" i mine opplastede dokumenter. 

**Prøv å:**
• Stille spørsmålet på en annen måte
• Bruke andre ord eller termer
• Spørre om noe mer generelt

**Du har ${uploadedDocs.length} opplastede dokumenter** - jeg kan hjelpe deg med informasjon fra disse!`;
        responseSource = 'guidance';
      }
      
      // PRIORITY 3: Fallback response if nothing else matches
      if (!bestResponse) {
        if (uploadedDocs.length > 0) {
          bestResponse = `Jeg forstår spørsmålet ditt, men fant ikke spesifikk informasjon i mine ${uploadedDocs.length} opplastede dokumenter. 

**Prøv å:**
• Stille spørsmålet på en annen måte
• Bruke andre ord eller termer
• Spørre om noe mer generelt

**Du har disse dokumentene:**
${uploadedDocs.map(doc => `• ${doc.title}`).join('\n')}

Jeg kan hjelpe deg med informasjon fra disse!`;
        } else {
          bestResponse = `Jeg forstår spørsmålet ditt, men har ingen opplastede dokumenter ennå. 

**Last opp relevante dokumenter** under Velferdsteknologi-tabben så kan jeg hjelpe deg!`;
        }
        responseSource = 'fallback';
      }
      
      console.log('Response source:', responseSource);
      console.log('Final response length:', bestResponse.length);
      
      // Debug: Check if response contains image patterns
      if (bestResponse.includes('🖼️') || bestResponse.includes('📷')) {
        console.log('Image patterns found in response:', {
          hasImageIcon: bestResponse.includes('🖼️'),
          hasCameraIcon: bestResponse.includes('📷'),
          responsePreview: bestResponse.substring(0, 200)
        });
      }

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
              🤖 TeknoTassen AI - Demo Mode
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
