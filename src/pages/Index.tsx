import React, { useState } from 'react';
import { DocumentUpload } from '../components/DocumentUpload';
import { FeatureCard } from '../components/FeatureCard';
import { ChatInterface } from '../components/ChatInterface';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useAuth } from '../contexts/AuthContext';
import { 
  MessageSquare, 
  Upload, 
  Brain, 
  Shield, 
  Zap, 
  Database,
  Globe,
  Lock,
  Users,
  BookOpen,
  Search,
  FileText,
  Play,
  Mic,
  Volume2,
  Loader2
} from 'lucide-react';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUpload, setShowUpload] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-fill title from filename
      const fileName = file.name.replace(/\.[^/.]+$/, "");
      setDocumentTitle(fileName);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentTitle.trim()) {
      return;
    }

    setIsUploading(true);

    try {
      const text = await selectedFile.text();
      
      // For demo purposes, we'll store in localStorage
      const documentData = {
        title: documentTitle,
        description: documentDescription,
        content: text,
        created_at: new Date().toISOString(),
      };

      // Store in localStorage for demo
      const existingDocs = JSON.parse(localStorage.getItem('uploadedDocuments') || '[]');
      existingDocs.push(documentData);
      localStorage.setItem('uploadedDocuments', JSON.stringify(existingDocs));

      // Reset form
      setSelectedFile(null);
      setDocumentTitle('');
      setDocumentDescription('');
      const fileInput = document.getElementById('opplæring-file-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      // Show success message
      alert(`Dokument "${documentTitle}" er lastet opp! TeknoTassen kan nå svare basert på innholdet.`);
    } catch (error) {
      console.error('Error reading file:', error);
      alert('Feil ved opplasting av fil. Prøv igjen!');
    } finally {
      setIsUploading(false);
    }
  };

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'RAG-Powered AI',
      description: 'Retrieval-Augmented Generation med pgvector og LangChain for nøyaktige svar basert på oppdatert kunnskap.',
      accentColor: 'tech-blue' as const
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Vector Database',
      description: 'PostgreSQL med pgvector for effektiv lagring og søk i tekst-embeddings.',
      accentColor: 'tech-green' as const
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Azure Security',
      description: 'Managed Identity, Key Vault og RBAC for sikker tilgang til ressurser.',
      accentColor: 'tech-blue' as const
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Multi-Tenant',
      description: 'Støtte for flere organisasjoner med isolerte kunnskapsbaser.',
      accentColor: 'tech-orange' as const
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Semantic Search',
      description: 'Intelligent tekstsøk basert på betydning, ikke bare nøkkelord.',
      accentColor: 'tech-blue' as const
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Markdown Support',
      description: 'Støtte for strukturert innhold med Nano/Unit hierarki og frontmatter.',
      accentColor: 'tech-blue' as const
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: 'Text-to-Speech',
      description: 'ElevenLabs TTS for naturlig, følelsesmessig tale med bred språkstøtte.',
      accentColor: 'tech-orange' as const
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: 'Speech-to-Text',
      description: 'ElevenLabs Scribe for høy nøyaktighet (96.7%) med språk- og talerstøtte.',
      accentColor: 'tech-green' as const
    }
  ];

  const technologies = [
    { name: 'React + TypeScript', version: '18.x', status: 'active' },
    { name: 'Vite', version: '5.x', status: 'active' },
    { name: 'Tailwind CSS', version: '3.x', status: 'active' },
    { name: 'shadcn/ui', version: 'latest', status: 'active' },
    { name: 'Express.js', version: '4.x', status: 'active' },
    { name: 'PostgreSQL + pgvector', version: '15+', status: 'active' },
    { name: 'LangChain', version: '0.1.x', status: 'active' },
    { name: 'Azure Web App', version: 'Linux Container', status: 'active' },
    { name: 'ElevenLabs TTS/STT', version: 'API v1', status: 'planned' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-tech-green/10 text-tech-green border-tech-green/20';
      case 'deploying': return 'bg-tech-orange/10 text-tech-orange border-tech-orange/20';
      case 'planned': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return '✅';
      case 'deploying': return '🚀';
      case 'planned': return '📋';
      default: return '❓';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary via-background to-accent">


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="velferdsteknologi" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Velferdsteknologi</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab - Personlig for innloggede brukere */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="space-y-6">
              {/* TeknoTassen velkomst for innloggede brukere */}
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-32 h-32 rounded-full overflow-hidden shadow-avatar border-4 border-white">
                    <img 
                      src="/teknotassen-avatar.jpg" 
                      alt="TeknoTassen"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-card-foreground">
                    Velkommen tilbake, {user?.givenName || 'venn'}! 🎉
                  </h2>
                </div>
              </div>

              {/* Chat Interface for AI Agent */}
              <div className="mb-8">
                <Card className="border-tech-blue/20 shadow-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-tech-blue">
                      <MessageSquare className="w-5 h-5" />
                      <span>Chat med TeknoTassen AI</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChatInterface />
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="hover:shadow-md transition-shadow cursor-pointer border-tech-blue/20 hover:border-tech-blue/40">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-tech-blue/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-tech-blue text-2xl">🏥</span>
                    </div>
                    <h3 className="font-semibold text-card-foreground mb-2">HEPRO Respons</h3>
                    <p className="text-sm text-muted-foreground">Implementering og bruk</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-tech-green/20 hover:border-tech-green/40">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-tech-green/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-tech-green text-2xl">🌙</span>
                    </div>
                    <h3 className="font-semibold text-card-foreground mb-2">Digital Nattilsyn</h3>
                    <p className="text-sm text-muted-foreground">Digitale løsninger</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-tech-orange/20 hover:border-tech-orange/40">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-tech-orange/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-tech-orange text-2xl">💙</span>
                    </div>
                    <h3 className="font-semibold text-card-foreground mb-2">Varda Care</h3>
                    <p className="text-sm text-muted-foreground">Opplæring og bruk</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer border-primary/20 hover:border-primary/40">
                  <CardContent className="p-4 text-center">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-primary text-2xl">📚</span>
                    </div>
                    <h3 className="font-semibold text-card-foreground mb-2">Aula</h3>
                    <p className="text-sm text-muted-foreground">Læringsplattform</p>
                  </CardContent>
                </Card>
              </div>

              {/* Personal Guidance Section */}
              <Card className="bg-gradient-to-r from-tech-blue/5 to-tech-green/5 border-tech-blue/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-tech-blue">
                    <Brain className="w-5 h-5" />
                    <span>Personlig Veiledning</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    {user ? `Som din AI-assistent kan jeg hjelpe deg, ${user.givenName}, med:` : 'Som din AI-assistent kan jeg hjelpe deg med:'}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-tech-blue">📋 DPIA & ROS Analyse</h4>
                      <p className="text-sm text-muted-foreground">
                        Veiledning gjennom Data Protection Impact Assessment og Risk & Opportunity Screening
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-tech-green">👥 Pasientbehov & Opplæring</h4>
                      <p className="text-sm text-muted-foreground">
                        Kartlegging av pasientbehov og riktig opplæring til ansatte på riktig tid
                      </p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button 
                      onClick={() => setActiveTab('velferdsteknologi')}
                      className="bg-tech-blue hover:bg-tech-blue/90 text-white"
                    >
                      {user ? `Start Veiledning for ${user.givenName} →` : 'Start Veiledning →'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Velferdsteknologi Tab - Ny tab for spesifikk veiledning */}
          <TabsContent value="velferdsteknologi" className="space-y-6">
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-card-foreground">
                  Velferdsteknologi Veiledning 🚀
                </h2>
                <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                  La meg veilede deg gjennom hele prosessen med implementering av velferdsteknologi.
                  Vi starter med de viktigste stegene og bygger videre derfra.
                </p>
              </div>

              {/* Step-by-step guidance */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-tech-blue/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-tech-blue">
                      <span className="text-2xl">📋</span>
                      <span>DPIA & ROS Analyse</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Data Protection Impact Assessment og Risk & Opportunity Screening er grunnleggende for sikker implementering.
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Identifiser personopplysninger som behandles</li>
                      <li>• Vurder risikoer og muligheter</li>
                      <li>• Dokumenter beslutninger og tiltak</li>
                    </ul>
                    <Button className="w-full mt-3 bg-tech-blue hover:bg-tech-blue/90 text-white">
                      Start DPIA →
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-tech-green/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-tech-green">
                      <span className="text-2xl">👥</span>
                      <span>Pasientbehov & Opplæring</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Kartlegg pasientbehov og planlegg riktig opplæring til ansatte på riktig tid.
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Analyser eksisterende arbeidsflyt</li>
                      <li>• Identifiser opplæringsbehov</li>
                      <li>• Planlegg implementeringsfase</li>
                    </ul>
                    <Button className="w-full mt-3 bg-tech-green hover:bg-tech-green/90 text-white">
                      Start Kartlegging →
                    </Button>
                    
                    {/* File Upload for AI Analysis - Under Opplæring */}
                    <div className="mt-4 pt-4 border-t border-tech-green/20" style={{border: '2px solid red'}}>
                      <h5 className="font-medium text-tech-green mb-3 flex items-center">
                        <span className="text-lg mr-2">📁</span>
                        AI-dokumentanalyse
                      </h5>
                      <p className="text-xs text-muted-foreground mb-3">
                        Last opp filer for at TeknoTassen skal kunne lese og svare basert på innholdet
                      </p>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                          <Input 
                            placeholder="Dokumenttittel (f.eks. HEPRO Guide)"
                            className="text-xs border-tech-green/20 focus:border-tech-green"
                            value={documentTitle}
                            onChange={(e) => setDocumentTitle(e.target.value)}
                          />
                          <Input 
                            placeholder="Beskrivelse (valgfritt)"
                            className="text-xs border-tech-green/20 focus:border-tech-green"
                            value={documentDescription}
                            onChange={(e) => setDocumentDescription(e.target.value)}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="border border-dashed border-tech-green/30 rounded-lg p-3 text-center hover:border-tech-green/50 transition-colors">
                            <Upload className="w-5 h-5 text-tech-green mx-auto mb-1" />
                            <p className="text-xs text-muted-foreground mb-1">
                              {selectedFile ? `Valgt: ${selectedFile.name}` : 'Klikk for å velge fil'}
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              Støtter: .txt, .md, .pdf, .docx
                            </p>
                            <Input 
                              type="file" 
                              accept=".txt,.md,.pdf,.docx"
                              className="hidden"
                              id="opplæring-file-upload"
                              onChange={handleFileSelect}
                            />
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-xs border-tech-green/30 text-tech-green hover:bg-tech-green/10"
                              onClick={() => document.getElementById('opplæring-file-upload')?.click()}
                            >
                              Velg fil
                            </Button>
                          </div>
                        </div>

                        <Button 
                          className="w-full bg-tech-green hover:bg-tech-green/90 text-white text-xs"
                          onClick={handleUpload}
                          disabled={!selectedFile || !documentTitle.trim() || isUploading}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Laster opp...
                            </>
                          ) : (
                            <>
                              <Upload className="w-3 h-3 mr-1" />
                              Last opp til AI
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Implementation roadmap */}
              <Card className="bg-gradient-to-r from-primary/5 to-tech-blue/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-primary">
                    <Brain className="w-5 h-5" />
                    <span>Implementeringsplan</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-tech-blue/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-tech-blue text-2xl">1️⃣</span>
                      </div>
                      <h4 className="font-semibold text-card-foreground">Planlegging</h4>
                      <p className="text-sm text-muted-foreground">DPIA, ROS, behovsanalyse</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-tech-green/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-tech-green text-2xl">2️⃣</span>
                      </div>
                      <h4 className="font-semibold text-card-foreground">Implementering</h4>
                      <p className="text-sm text-muted-foreground">Fasevis utrulling</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-tech-orange/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-tech-orange text-2xl">3️⃣</span>
                      </div>
                      <h4 className="font-semibold text-card-foreground">Opplæring</h4>
                      <p className="text-sm text-muted-foreground">Ansatte og brukere</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Interactive Planning Tools - Lovable.dev Integration */}
              <Card className="bg-gradient-to-r from-tech-blue/5 to-tech-green/5 border-tech-blue/20 mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-tech-blue">
                    <Brain className="w-5 h-5" />
                    <span>Interaktive Planleggingsverktøy</span>
                  </CardTitle>
                  <CardDescription>
                    Bruk AI-assisterte verktøy for å planlegge DPIA, ROS og behovsanalyse
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* DPIA Planning Tool */}
                  <div className="border border-tech-blue/20 rounded-lg p-4 bg-tech-blue/5">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-tech-blue/20 rounded-full flex items-center justify-center">
                        <span className="text-tech-blue text-lg">📋</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-card-foreground">DPIA Planleggingsverktøy</h4>
                        <p className="text-sm text-muted-foreground">Data Protection Impact Assessment</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-card-foreground">Organisasjonstype</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="helse">Helsevesen</SelectItem>
                            <SelectItem value="omsorg">Omsorg</SelectItem>
                            <SelectItem value="kommune">Kommune</SelectItem>
                            <SelectItem value="privat">Privat sektor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-card-foreground">Datakategori</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="helse">Helsedata</SelectItem>
                            <SelectItem value="person">Personopplysninger</SelectItem>
                            <SelectItem value="sensitive">Sensitive data</SelectItem>
                            <SelectItem value="anonym">Anonymiserte data</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full bg-tech-blue hover:bg-tech-blue/90 text-white">
                      Start DPIA Planlegging →
                    </Button>
                  </div>

                  {/* ROS Analysis Tool */}
                  <div className="border border-tech-green/20 rounded-lg p-4 bg-tech-green/5">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-tech-green/20 rounded-full flex items-center justify-center">
                        <span className="text-tech-green text-lg">🔍</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-card-foreground">ROS Analyseverktøy</h4>
                        <p className="text-sm text-muted-foreground">Risk & Opportunity Screening</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-card-foreground">Risikonivå</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg nivå" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lav">Lav risiko</SelectItem>
                            <SelectItem value="medium">Medium risiko</SelectItem>
                            <SelectItem value="høy">Høy risiko</SelectItem>
                            <SelectItem value="kritisk">Kritisk risiko</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-card-foreground">Beregningsmetode</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg metode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="kvalitativ">Kvalitativ</SelectItem>
                            <SelectItem value="kvantitativ">Kvantitativ</SelectItem>
                            <SelectItem value="hybrid">Hybrid tilnærming</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full bg-tech-green hover:bg-tech-green/90 text-white">
                      Start ROS Analyse →
                    </Button>
                  </div>

                  {/* Needs Analysis Tool */}
                  <div className="border border-tech-orange/20 rounded-lg p-4 bg-tech-orange/5">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-tech-orange/20 rounded-full flex items-center justify-center">
                        <span className="text-tech-orange text-lg">🎯</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-card-foreground">Behovsanalyseverktøy</h4>
                        <p className="text-sm text-muted-foreground">Kartlegg pasient- og ansattbehov</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-card-foreground">Fokusområde</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg område" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pasient">Pasientbehov</SelectItem>
                            <SelectItem value="ansatt">Ansattbehov</SelectItem>
                            <SelectItem value="organisasjon">Organisasjonsbehov</SelectItem>
                            <SelectItem value="teknisk">Tekniske behov</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-card-foreground">Metode</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Velg metode" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="intervju">Intervjuer</SelectItem>
                            <SelectItem value="spørreundersøkelse">Spørreundersøkelse</SelectItem>
                            <SelectItem value="observasjon">Observasjon</SelectItem>
                            <SelectItem value="workshop">Workshop</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button className="w-full bg-tech-orange hover:bg-tech-orange/90 text-white">
                      Start Behovsanalyse →
                    </Button>
                  </div>

                  {/* Progress Tracking */}
                  <div className="bg-gradient-to-r from-primary/5 to-tech-blue/5 border border-primary/20 rounded-lg p-4">
                    <h5 className="font-semibold text-card-foreground mb-3">Planleggingsstatus</h5>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-tech-blue/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-tech-blue text-lg">📊</span>
                        </div>
                        <p className="text-sm font-medium text-card-foreground">DPIA</p>
                        <p className="text-xs text-muted-foreground">Ikke startet</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-tech-green/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-tech-blue text-lg">📈</span>
                        </div>
                        <p className="text-sm font-medium text-card-foreground">ROS</p>
                        <p className="text-xs text-muted-foreground">Ikke startet</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-tech-orange/20 rounded-full flex items-center justify-center mx-auto mb-2">
                          <span className="text-tech-blue text-lg">🎯</span>
                        </div>
                        <p className="text-sm font-medium text-card-foreground">Behovsanalyse</p>
                        <p className="text-xs text-muted-foreground">Ikke startet</p>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </div>
          </TabsContent>


        </Tabs>
      </main>

      {/* Document Upload Modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Last opp kurs</h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowUpload(false)}
              >
                ✕
              </Button>
            </div>
            <DocumentUpload 
              onDocumentUploaded={() => {
                setShowUpload(false);
                // Could trigger a refresh or show success message
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
