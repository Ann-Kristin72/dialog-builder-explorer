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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hei! Jeg er TeknoTassen, din AI-assistent for teknisk kunnskap. Hvordan kan jeg hjelpe deg i dag?',
      role: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedTechnology, setSelectedTechnology] = useState<string>('all');

  const technologies = [
    { id: 'all', name: 'Alle teknologier', color: 'bg-blue-100 text-blue-800' },
    { id: 'react', name: 'React', color: 'bg-cyan-100 text-cyan-800' },
    { id: 'node', name: 'Node.js', color: 'bg-green-100 text-green-800' },
    { id: 'azure', name: 'Azure', color: 'bg-blue-100 text-blue-800' },
    { id: 'postgres', name: 'PostgreSQL', color: 'bg-purple-100 text-purple-800' },
    { id: 'ai', name: 'AI/ML', color: 'bg-orange-100 text-orange-800' },
  ];

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
      
      // Fallback response for demo
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Beklager, jeg kan ikke koble til backend-systemet akkurat nå. Dette er en demo-versjon. I produksjon ville jeg ha koblet til RAG-systemet med pgvector og LangChain.',
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
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">TeknoTassen AI</h1>
            <p className="text-sm text-gray-600">Teknisk kunnskapsassistent</p>
          </div>
        </div>
        
        {onUpload && (
          <Button onClick={onUpload} variant="outline" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Last opp kurs</span>
          </Button>
        )}
      </div>

      {/* Technology Filter */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <Badge
              key={tech.id}
              variant={selectedTechnology === tech.id ? 'default' : 'secondary'}
              className={`cursor-pointer hover:opacity-80 ${tech.color}`}
              onClick={() => setSelectedTechnology(tech.id)}
            >
              {tech.name}
            </Badge>
          ))}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage 
                  src={message.role === 'assistant' ? '/src/assets/teknotassen-avatar.jpg' : '/src/assets/vera-avatar.jpg'} 
                  alt={message.role === 'assistant' ? 'TeknoTassen' : 'Bruker'}
                />
                <AvatarFallback>
                  {message.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">
                    {message.role === 'assistant' ? 'TeknoTassen' : 'Du'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                <Card className="bg-white">
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
                    <p className="text-xs text-gray-500 font-medium">Kilder:</p>
                    {message.sources.map((source, index) => (
                      <div key={index} className="text-xs bg-gray-50 p-2 rounded">
                        <p className="font-medium">{source.title}</p>
                        {source.url && (
                          <a href={source.url} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                            Se kilde
                          </a>
                        )}
                        <p className="text-gray-600 mt-1">{source.content.substring(0, 100)}...</p>
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
                <AvatarImage src="/src/assets/teknotassen-avatar.jpg" alt="TeknoTassen" />
                <AvatarFallback><Bot className="w-4 h-4" /></AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">TeknoTassen</span>
                </div>
                <Card className="bg-white">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm text-gray-600">Skriver...</span>
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
      <div className="p-4 border-t bg-white">
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
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          TeknoTassen bruker RAG-teknologi for å gi deg nøyaktige svar basert på oppdatert kunnskap
        </div>
      </div>
    </div>
  );
};
