import React, { useState } from 'react';
import { DocumentUpload } from '../components/DocumentUpload';
import { FeatureCard } from '../components/FeatureCard';
import { ChatInterface } from '../components/ChatInterface';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
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
  Volume2
} from 'lucide-react';

const Index: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showUpload, setShowUpload] = useState(false);
  const { user } = useAuth();

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
      {/* Header */}
      <header className="bg-card shadow-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden shadow-avatar">
                <img 
                  src="/teknotassen-avatar.jpg" 
                  alt="TeknoTassen"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">
                  {user ? `TeknoTassen Explorer - ${user.givenName}` : 'TeknoTassen Explorer'}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {user ? `Velkommen tilbake, ${user.givenName}!` : 'Velkommen til din AI-assistent for velferdsteknologi'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-tech-green/10 text-tech-green border-tech-green/20">
                Demo Mode
              </Badge>
              <Button 
                onClick={() => window.location.href = '/login'}
                className="bg-gradient-to-r from-primary to-tech-blue hover:from-primary/90 hover:to-tech-blue/90 text-primary-foreground shadow-soft"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Logg inn
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="velferdsteknologi" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Velferdsteknologi</span>
            </TabsTrigger>
            <TabsTrigger value="features" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Funksjoner</span>
            </TabsTrigger>
            <TabsTrigger value="tech" className="flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>Teknologi</span>
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
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-card-foreground">
                Avanserte AI-Funksjoner
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                TeknoTassen Explorer kombinerer moderne AI-teknologi med robust infrastruktur
                for å gi deg en kraftfull kunnskapsplattform.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <FeatureCard
                  key={index}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  accentColor={feature.accentColor}
                />
              ))}
            </div>

            {/* Architecture Overview */}
            <Card className="bg-gradient-to-r from-primary/5 to-tech-blue/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-primary">
                  <Database className="w-5 h-5" />
                  <span>Systemarkitektur</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-tech-blue">Frontend</h4>
                    <ul className="space-y-1 text-tech-blue/80">
                      <li>• React + TypeScript</li>
                      <li>• Tailwind CSS + shadcn/ui</li>
                      <li>• Vite build system</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-primary">Backend</h4>
                    <ul className="space-y-1 text-primary/80">
                      <li>• Express.js API</li>
                      <li>• LangChain + OpenAI</li>
                      <li>• Azure Web App</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-tech-green">Database</h4>
                    <ul className="space-y-1 text-tech-green/80">
                      <li>• PostgreSQL + pgvector</li>
                      <li>• Azure Database</li>
                      <li>• Managed Identity</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Technology Tab */}
          <TabsContent value="tech" className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-card-foreground">
                Teknologistakk
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Oversikt over alle teknologier som brukes i TeknoTassen Explorer,
                fra frontend til backend og infrastruktur.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {technologies.map((tech, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{tech.name}</h3>
                        <p className="text-sm text-gray-600">v{tech.version}</p>
                      </div>
                      <Badge className={getStatusColor(tech.status)}>
                        {getStatusIcon(tech.status)} {tech.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Velkommen Status */}
            <Card className="bg-gradient-to-r from-primary/5 to-tech-blue/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-primary">
                  <MessageSquare className="w-5 h-5" />
                  <span>Velkommen til TeknoTassen!</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-tech-green rounded-full animate-pulse"></div>
                  <span className="text-sm text-tech-green">
                    Frontend kjører på Vercel, backend på Azure
                  </span>
                </div>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Moderne React-applikasjon med TypeScript</p>
                  <p>• AI-assistent med RAG-teknologi</p>
                  <p>• Sikker autentisering og datahåndtering</p>
                </div>
                <div className="pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-primary border-primary/30"
                    onClick={() => window.location.href = '/login'}
                  >
                    Kom i gang
                  </Button>
                </div>
              </CardContent>
            </Card>
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
