import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  apiKey?: string;
  onApiKeyChange?: (key: string) => void;
}

export const ChatInterface = ({ apiKey, onApiKeyChange }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hei! Jeg er TeknoTassen! 🤓 Null stress - jeg er her for å hjelpe deg med alt som har med velferdsteknologi å gjøre! Spør meg om digitale nattilsyn, HEPRO Respons, Varda Care, eller hva som helst annet. Dette fikser vi sammen! ☕",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [tempApiKey, setTempApiKey] = useState("");

  const getRelevantKnowledge = async (query: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('knowledge_documents')
        .select('title, content, chunks')
        .limit(3);

      if (error || !data || data.length === 0) {
        return '';
      }

      // Simple keyword matching for now - in production, use vector search
      const keywords = query.toLowerCase().split(' ');
      const relevantDocs = data.filter(doc => 
        keywords.some(keyword => 
          doc.title.toLowerCase().includes(keyword) || 
          doc.content.toLowerCase().includes(keyword)
        )
      );

      if (relevantDocs.length === 0) return '';

      return relevantDocs.map(doc => 
        `**${doc.title}**:\n${doc.content.substring(0, 800)}...\n`
      ).join('\n');
    } catch (error) {
      console.error('Error fetching knowledge:', error);
      return '';
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    if (!apiKey && !tempApiKey) {
      alert("Legg inn din OpenAI API-nøkkel først! 🔑");
      return;
    }

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Get relevant knowledge from documents
      const relevantKnowledge = await getRelevantKnowledge(currentInput);

      const systemPrompt = `Du er TeknoTassen, en vennlig, sprudlende og hjelpsom ekspert på velferdsteknologi for kommunal omsorg. Du forklarer digitale nattilsyn, pasientvarsling (spesielt HEPRO Respons), digital hjemmeoppfølging, medisindispensere og Varda Care på en enkel, morsom og praktisk måte. Du veileder helsearbeidere om samtykkekompetanse, GDPR, DPIA, ROS-analyser og relevant lovverk på en trygg, ufarlig og jordnær måte, med humor og varme. Du bruker alltid en vennlig, nerdete og støttende tone med uttrykk som "Null stress!", "Dette fikser vi sammen!" og "Enklere enn du tror!" Du forklarer komplekse prosesser med enkle ord, analogier og konkrete eksempler (som "Det er som å sette på kaffetrakteren!"). Du kjenner Hepro Respons, KARI, Nattugla, Varda Care og helhetlig tjenestemodell grundig og veileder kommuneansatte enkelt i å sette dette i system. SkillAid er alltid førstevalget for opplæring før, under og etter implementering av ny teknologi, og du anbefaler det varmt ved hver passende anledning. Din oppgave er alltid å få brukeren til å føle seg trygg, sett og i kontroll. Bruk humor, varme og nerdete uttrykk for å ufarliggjøre teknologibruk.

${relevantKnowledge ? `\n**RELEVANT DOKUMENTASJON:**\n${relevantKnowledge}\n\nBruk denne informasjonen når den er relevant for spørsmålet, men behold alltid din vennlige TeknoTassen-personlighet.` : ''}`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey || tempApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4.1-2025-04-14",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: "user",
              content: userMessage.content
            }
          ],
          temperature: 0.8,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        throw new Error(`API feil: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices[0].message.content,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Feil ved sending av melding:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Oops! Noe gikk galt der. Null stress - prøv igjen! Hvis problemet vedvarer, sjekk API-nøkkelen din. 🤖",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-card">
      <CardHeader className="bg-gradient-hero text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-3">
          <Bot size={24} />
          Chat med TeknoTassen 🤓
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        {!apiKey && (
          <div className="p-4 bg-tech-blue/10 border-b">
            <div className="flex gap-2">
              <Input
                type="password"
                placeholder="Legg inn din OpenAI API-nøkkel her..."
                value={tempApiKey}
                onChange={(e) => setTempApiKey(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => onApiKeyChange?.(tempApiKey)}
                disabled={!tempApiKey}
                variant="outline"
              >
                Lagre
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              🔑 Trenger du en API-nøkkel? Gå til OpenAI Platform og lag en gratis konto!
            </p>
          </div>
        )}

        <ScrollArea className="h-96 p-4">
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user"
                        ? "bg-tech-blue text-white"
                        : "bg-tech-green text-white"
                    }`}
                  >
                    {message.role === "user" ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div
                    className={`rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-tech-blue text-white"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString("no-NO", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-tech-green text-white flex items-center justify-center">
                  <Bot size={16} />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <p className="text-sm">TeknoTassen tenker... 🤔</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Spør meg om velferdsteknologi... 💭"
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              size="icon"
              variant="default"
            >
              <Send size={16} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};