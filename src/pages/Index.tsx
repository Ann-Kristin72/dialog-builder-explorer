import { useState } from "react";
import { FeatureCard } from "@/components/FeatureCard";
import { ChatInterface } from "@/components/ChatInterface";
import { KnowledgeManager } from "@/components/KnowledgeManager";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Smartphone, Shield, ArrowLeft, MessageCircle, BookOpen } from "lucide-react";
import teknoTassenAvatar from "@/assets/teknotassen-avatar.jpg";

const Index = () => {
  const [activeTab, setActiveTab] = useState<"home" | "chat" | "knowledge">("home");
  const [apiKey, setApiKey] = useState("");

  if (activeTab === "chat") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("home")}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Tilbake til hovedside
            </Button>
          </div>
          <ChatInterface 
            apiKey={apiKey}
            onApiKeyChange={(key) => setApiKey(key)}
          />
        </div>
      </div>
    );
  }

  if (activeTab === "knowledge") {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="container mx-auto py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("home")}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Tilbake til hovedside
            </Button>
          </div>
          <KnowledgeManager />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Avatar */}
          <div className="mb-8">
            <div className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-avatar">
              <img 
                src={teknoTassenAvatar} 
                alt="TeknoTassen - Din vennlige velferdsteknologi ekspert"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Møt TeknoTassen 🤓
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Din vennlige ekspert på velferdsteknologi for kommunal omsorg
          </p>

          {/* Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <Badge variant="outline" className="bg-tech-blue/10 text-tech-blue border-tech-blue/30 px-4 py-2">
              💡 Null stress - enklere enn du tror!
            </Badge>
            <Badge variant="outline" className="bg-tech-green/10 text-tech-green border-tech-green/30 px-4 py-2">
              ☕ Spesialist på HEPRO Respons & Varda Care
            </Badge>
          </div>

        {/* Description */}
        <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mx-auto mb-12">
          Hei der! 👋 Jeg er din sprudlende nerdete venn som gjør velferdsteknologi til en lek! 
          Fra digitale nattilsyn til pasientvarsling - jeg forklarer alt på en trygg, morsom og praktisk måte. 
          Dette fikser vi sammen, og det er mye enklere enn du tror! Tenk på meg som din personlige 
          kaffetrakteren for teknologikunnskap ☕
        </p>
      </div>

      {/* Chat Interface Section - Positioned right after introduction */}
      <div className="max-w-4xl mx-auto mb-16">
        <ChatInterface 
          apiKey={apiKey}
          onApiKeyChange={(key) => setApiKey(key)}
        />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon={<Settings size={32} />}
            title="Digitale nattilsyn & HEPRO Respons"
            description="Null stress! Jeg forklarer Nattugla, HEPRO Respons Admin, samtykke og personvern så enkelt at det er som å sette på kaffetrakteren. Vi tar alt fra superbrukeransvar til alarmhistorikk - dette fikser vi sammen! 🌙"
            accentColor="blue"
          />
          
          <FeatureCard
            icon={<Smartphone size={32} />}
            title="Varda Care & sensorteknologi"
            description="Fra ballistokardiografi til varslingsinnstillinger - jeg gjør det komplekse enkelt! Varda Care-sensormatten, Digitalt tilsyn-appen og all administrasjon blir så logisk som morgenkaffeen din. Enklere enn du tror! 📱"
            accentColor="green"
          />
          
          <FeatureCard
            icon={<Shield size={32} />}
            title="Samtykkekompetanse & GDPR"
            description="GDPR, DPIA, ROS-analyser og lovverk høres skummelt ut? Null stress! Jeg veileder deg gjennom alt på en trygg, jordnær måte med humor og varme. Som en trygg kopp kaffe på en travel dag! ☕"
            accentColor="orange"
          />
        </div>

        {/* SkillAid Section */}
        <div className="bg-gradient-card rounded-3xl p-12 shadow-card mb-16">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-foreground">
              SkillAid - mitt favorittverktøy! 🎯
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              SkillAid er førstevalget for opplæring før, under og etter implementering av ny teknologi! 
              Som en god espresso til teknologiimplementering - jeg anbefaler det varmt ved hver anledning. 
              Kombinert med min hjelp får dere den perfekte oppskriften på suksess! ☕
            </p>

            <h3 className="text-xl font-semibold mb-8 text-foreground">
              Mine spesialområder (enklere enn du tror!):
            </h3>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-tech-blue/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-tech-blue rounded-full"></div>
                </div>
                <p className="font-medium text-foreground">HEPRO Respons & Nattugla</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-tech-green/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-tech-green rounded-full"></div>
                </div>
                <p className="font-medium text-foreground">Varda Care & sensorteknologi</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-tech-orange/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-tech-orange rounded-full"></div>
                </div>
                <p className="font-medium text-foreground">GDPR & samtykkekompetanse</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 bg-tech-blue/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-tech-blue rounded-full"></div>
                </div>
                <p className="font-medium text-foreground">Kommunal velferdsteknologi</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="medical" 
              size="hero" 
              className="rounded-2xl gap-2"
              onClick={() => setActiveTab("chat")}
            >
              <MessageCircle className="h-5 w-5" />
              Start chat med TeknoTassen!
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="rounded-2xl gap-2"
              onClick={() => setActiveTab("knowledge")}
            >
              <BookOpen className="h-5 w-5" />
              Administrer kunnskap
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Null stress - jeg svarer på alt om velferdsteknologi! ☕
          </p>
        </div>
        </div>
      </main>
    </div>
  );
};

export default Index;