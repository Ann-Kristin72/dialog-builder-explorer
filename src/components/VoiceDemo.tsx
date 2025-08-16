import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';

interface Voice {
  id: string;
  name: string;
  language: string;
  description: string;
  category: string;
  sampleUrl: string;
}

interface ServiceStatus {
  configured: boolean;
  provider: string;
  features: {
    tts: boolean;
    stt: boolean;
    voices: boolean;
  };
  models: {
    tts: string;
    stt: string;
  };
  languages: string[];
  pricing: {
    tts: string;
    stt: string;
  };
}

const VoiceDemo: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [text, setText] = useState('');
  const [transcription, setTranscription] = useState('');
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const { toast } = useToast();

  // Check service status on component mount
  React.useEffect(() => {
    checkServiceStatus();
    fetchVoices();
  }, []);

  const checkServiceStatus = async () => {
    try {
      const response = await fetch('/api/tts-stt/status');
      const data = await response.json();
      if (data.success) {
        setServiceStatus(data.status);
      }
    } catch (error) {
      console.error('Failed to check service status:', error);
    }
  };

  const fetchVoices = async () => {
    try {
      const response = await fetch('/api/tts-stt/voices');
      const data = await response.json();
      if (data.success) {
        setVoices(data.voices);
        if (data.voices.length > 0) {
          setSelectedVoice(data.voices[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch voices:', error);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "🎤 Opptak startet",
        description: "Snakk nå for å teste tale-til-tekst",
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "❌ Opptak feilet",
        description: "Kunne ikke starte opptak. Sjekk mikrofon-tillatelser.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      toast({
        title: "⏹️ Opptak stoppet",
        description: "Transkriberer lyd...",
      });
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/tts-stt/stt', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setTranscription(data.transcription);
        toast({
          title: "✅ Transkripsjon fullført",
          description: `Språk: ${data.language}, Nøyaktighet: ${Math.round(data.confidence * 100)}%`,
        });
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      toast({
        title: "❌ Transkripsjon feilet",
        description: error instanceof Error ? error.message : "Ukjent feil",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateSpeech = async () => {
    if (!text.trim()) {
      toast({
        title: "❌ Ingen tekst",
        description: "Skriv inn tekst først",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/tts-stt/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: JSON.stringify({
          text,
          voiceId: selectedVoice,
          options: {
            voice_settings: {
              stability: 0.7,
              similarity_boost: 0.8,
              style: 0.2,
            }
          }
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          setIsPlaying(true);
          
          audioRef.current.onended = () => {
            setIsPlaying(false);
          };
        }
        
        toast({
          title: "🔊 Tale generert",
          description: "Spiller av lyd...",
        });
      } else {
        throw new Error('TTS request failed');
      }
    } catch (error) {
      console.error('TTS failed:', error);
      toast({
        title: "❌ Tale-generering feilet",
        description: "Kunne ikke generere tale",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const testNorwegianTTS = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/tts-stt/test-norwegian');
      
      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
          setIsPlaying(true);
          
          audioRef.current.onended = () => {
            setIsPlaying(false);
          };
        }
        
        toast({
          title: "🇳🇴 Norsk test",
          description: "Spiller av norsk TeknoTassen-eksempel",
        });
      } else {
        throw new Error('Test TTS failed');
      }
    } catch (error) {
      console.error('Test TTS failed:', error);
      toast({
        title: "❌ Test feilet",
        description: "Kunne ikke spille av test-lyd",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!serviceStatus?.configured) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>🎤 TTS/STT Demo</CardTitle>
          <CardDescription>
            Tekst-til-tale og tale-til-tekst funksjonalitet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              ElevenLabs API-nøkkel er ikke konfigurert
            </p>
            <p className="text-sm text-muted-foreground">
              Legg til ELEVENLABS_API_KEY i backend .env-filen for å teste TTS/STT
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Tjenestestatus</CardTitle>
          <CardDescription>
            ElevenLabs TTS/STT konfigurasjon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {serviceStatus?.provider}
              </div>
              <div className="text-sm text-muted-foreground">Leverandør</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {serviceStatus?.models.tts}
              </div>
              <div className="text-sm text-muted-foreground">TTS Modell</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {serviceStatus?.models.stt}
              </div>
              <div className="text-sm text-muted-foreground">STT Modell</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {serviceStatus?.pricing.tts}
              </div>
              <div className="text-sm text-muted-foreground">TTS Pris</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text-to-Speech */}
      <Card>
        <CardHeader>
          <CardTitle>🔊 Tekst-til-tale (TTS)</CardTitle>
          <CardDescription>
            Konverter tekst til tale med ElevenLabs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="voice-select">Velg stemme</Label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue placeholder="Velg en stemme" />
              </SelectTrigger>
              <SelectContent>
                {voices.map((voice) => (
                  <SelectItem key={voice.id} value={voice.id}>
                    {voice.name} ({voice.language})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="text-input">Tekst å konvertere</Label>
            <Textarea
              id="text-input"
              placeholder="Skriv inn tekst som skal konverteres til tale..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={generateSpeech} 
              disabled={isLoading || !text.trim()}
              className="flex-1"
            >
              {isLoading ? "Genererer..." : "🔊 Generer tale"}
            </Button>
            <Button 
              onClick={testNorwegianTTS} 
              disabled={isLoading}
              variant="outline"
            >
              🇳🇴 Test norsk
            </Button>
          </div>
          
          <audio ref={audioRef} className="w-full" />
        </CardContent>
      </Card>

      {/* Speech-to-Text */}
      <Card>
        <CardHeader>
          <CardTitle>🎤 Tale-til-tekst (STT)</CardTitle>
          <CardDescription>
            Konverter tale til tekst med ElevenLabs Scribe
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Opptak</Label>
            <div className="flex gap-2">
              <Button 
                onClick={startRecording} 
                disabled={isRecording || isLoading}
                variant={isRecording ? "destructive" : "default"}
                className="flex-1"
              >
                {isRecording ? "⏹️ Stopp opptak" : "🎤 Start opptak"}
              </Button>
              {isRecording && (
                <Button onClick={stopRecording} variant="outline">
                  ⏹️ Stopp
                </Button>
              )}
            </div>
          </div>
          
          {transcription && (
            <div className="space-y-2">
              <Label>Transkripsjon</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">{transcription}</p>
              </div>
            </div>
          )}
          
          <div className="text-sm text-muted-foreground">
            💡 Tips: Snakk tydelig og hold mikrofonen nær munnen for best resultat
          </div>
        </CardContent>
      </Card>

      {/* Voice Chat Demo */}
      <Card>
        <CardHeader>
          <CardTitle>💬 Tale-chat Demo</CardTitle>
          <CardDescription>
            Test tale-input og tale-output i en chat-kontekst
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4">
              Kommer snart: Integrert tale-chat med TeknoTassen RAG
            </p>
            <Button disabled variant="outline">
              🚧 Under utvikling
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoiceDemo;
