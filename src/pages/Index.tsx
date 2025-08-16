import React, { useState } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { DocumentUpload } from '../components/DocumentUpload';
import { FeatureCard } from '../components/FeatureCard';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
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
  const [activeTab, setActiveTab] = useState('chat');
  const [showUpload, setShowUpload] = useState(false);

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      title: 'RAG-Powered AI',
      description: 'Retrieval-Augmented Generation med pgvector og LangChain for nøyaktige svar basert på oppdatert kunnskap.',
      accentColor: 'blue' as const
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: 'Vector Database',
      description: 'PostgreSQL med pgvector for effektiv lagring og søk i tekst-embeddings.',
      accentColor: 'green' as const
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Azure Security',
      description: 'Managed Identity, Key Vault og RBAC for sikker tilgang til ressurser.',
      accentColor: 'blue' as const
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: 'Multi-Tenant',
      description: 'Støtte for flere organisasjoner med isolerte kunnskapsbaser.',
      accentColor: 'orange' as const
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: 'Semantic Search',
      description: 'Intelligent tekstsøk basert på betydning, ikke bare nøkkelord.',
      accentColor: 'blue' as const
    },
    {
      icon: <FileText className="w-6 h-6" />,
      title: 'Markdown Support',
      description: 'Støtte for strukturert innhold med Nano/Unit hierarki og frontmatter.',
      accentColor: 'blue' as const
    },
    {
      icon: <Play className="w-6 h-6" />,
      title: 'Text-to-Speech',
      description: 'ElevenLabs TTS for naturlig, følelsesmessig tale med bred språkstøtte.',
      accentColor: 'orange' as const
    },
    {
      icon: <Mic className="w-6 h-6" />,
      title: 'Speech-to-Text',
      description: 'ElevenLabs Scribe for høy nøyaktighet (96.7%) med språk- og talerstøtte.',
      accentColor: 'green' as const
    }
  ];

  const technologies = [
    { name: 'React + TypeScript', version: '18.x', status: 'active' },
    { name: 'Vite', version: '5.x', status: 'active' },
    { name: 'Tailwind CSS', version: '3.x', status: 'active' },
    { name: 'shadcn/ui', version: 'latest', status: 'active' },
    { name: 'Express.js', version: '4.x', status: 'deploying' },
    { name: 'PostgreSQL + pgvector', version: '15+', status: 'deploying' },
    { name: 'LangChain', version: '0.1.x', status: 'deploying' },
    { name: 'Azure Web App', version: 'Linux Container', status: 'deploying' },
    { name: 'ElevenLabs TTS/STT', version: 'API v1', status: 'planned' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'deploying': return 'bg-yellow-100 text-yellow-800';
      case 'planned': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">TeknoTassen Explorer</h1>
                <p className="text-sm text-gray-600">AI-Powered Knowledge Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Azure Deployment
              </Badge>
              <Button 
                onClick={() => setShowUpload(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Upload className="w-4 h-4 mr-2" />
                Last opp kurs
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageSquare className="w-4 h-4" />
              <span>Chat</span>
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

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Chat med TeknoTassen AI
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Stil spørsmål om teknisk kunnskap og få nøyaktige svar basert på oppdatert dokumentasjon.
                TeknoTassen bruker RAG-teknologi for å gi deg de beste svarene.
              </p>
            </div>
            
            <ChatInterface onUpload={() => setShowUpload(true)} />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold text-gray-900">
                Avanserte AI-Funksjoner
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
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
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-900">
                  <Database className="w-5 h-5" />
                  <span>Systemarkitektur</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-800">Frontend</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• React + TypeScript</li>
                      <li>• Tailwind CSS + shadcn/ui</li>
                      <li>• Vite build system</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-purple-800">Backend</h4>
                    <ul className="space-y-1 text-purple-700">
                      <li>• Express.js API</li>
                      <li>• LangChain + OpenAI</li>
                      <li>• Azure Web App</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-green-800">Database</h4>
                    <ul className="space-y-1 text-green-700">
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
              <h2 className="text-3xl font-bold text-gray-900">
                Teknologistakk
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
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

            {/* Deployment Status */}
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-900">
                  <Zap className="w-5 h-5" />
                  <span>Deployment Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-yellow-800">
                    Azure Web App deployment i gang via GitHub Actions
                  </span>
                </div>
                <div className="text-sm text-yellow-700 space-y-1">
                  <p>• Docker image bygges og pushes til ACR</p>
                  <p>• Web App oppdateres med ny container</p>
                  <p>• Health checks og database tilkobling verifiseres</p>
                </div>
                <div className="pt-2">
                  <Button variant="outline" size="sm" className="text-yellow-700 border-yellow-300">
                    Se deployment logs
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
