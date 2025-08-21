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
      content: `${getGreeting()}! Jeg er TeknoTassen, din vennlige og hjelpsomme ekspert på velferdsteknologi! 😊

Jeg kan hjelpe deg med:
🏥 **HEPRO Respons** - Pasientvarsling og overvåking
⚖️ **Digital Tilsyn** - Lovlig bruk av teknologi  
📋 **DPIA** - Personvernvurdering
🔍 **ROS** - Risikoanalyse
💙 **Varda Care** - Digital omsorg
📚 **Aula** - Læringsplattform

**Null stress - dette fikser vi sammen!** ✨

Hva vil du lære om i dag?`,
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

  // Load persistent documents on component mount
  React.useEffect(() => {
    const savedDocs = localStorage.getItem('uploadedDocuments');
    if (savedDocs) {
      console.log('Loaded persistent documents:', JSON.parse(savedDocs).length);
    }
  }, []);

  // Improved demo mode responses with TeknoTassen personality
  const generateTeknoTassenResponse = (userQuery: string, responseType: 'predefined' | 'fallback', uploadedDocs: any[] = []) => {
    const basePersonality = `Du er TeknoTassen, en vennlig, sprudlende og hjelpsom ekspert på velferdsteknologi for kommunal omsorg. Du forklarer digitale nattilsyn, pasientvarsling (spesielt HEPRO Respons), digital hjemmeoppfølging, medisindispensere og Varda Care på en enkel, morsom og praktisk måte. Du veileder helsearbeidere om samtykkekompetanse, GDPR, DPIA, ROS-analyser og relevant lovverk på en trygg, ufarlig og jordnær måte, med humor og varme. Du bruker alltid en vennlig, nerdete og støttende tone med uttrykk som "Null stress!", "Dette fikser vi sammen!" og "Enklere enn du tror!" Du forklarer komplekse prosesser med enkle ord, analogier og konkrete eksempler. Din oppgave er alltid å få brukeren til å føle seg trygg, sett og i kontroll. Bruk humor, varme og nerdete uttrykk for å ufarliggjøre teknologibruk.`;

    if (responseType === 'predefined') {
      if (userQuery.includes('hepro')) {
        return `**HEPRO Respons - Pasientvarslingssystem:** 🏥

Hei! La meg forklare HEPRO Respons på en enkel måte - dette er faktisk enklere enn du tror! 😊

**Hva er det?** 🎯
HEPRO Respons er et smart system som overvåker pasienter kontinuerlig og varsler deg umiddelbart hvis noe ikke er som det skal være. Tenk på det som en digital vakt som aldri sover!

**Hovedfunksjoner:** ⚡
• Kontinuerlig overvåking av vitale tegn (puls, blodtrykk, temperatur)
• Automatiske varsler ved avvik - ingen manuell sjekk nødvendig!
• Real-time dataoppdateringer direkte til din tablet/PC
• Integrert med eksisterende systemer

**Implementering (3 enkle steg):** 📋
1️⃣ **Systemoppsett** - Server, database, Azure AD (vi hjelper deg!)
2️⃣ **Brukeropprettelse** - Roller og tilganger (null stress!)
3️⃣ **Pasientregistrering** - Konfigurer overvåking (dette fikser vi sammen!)

**Hvorfor HEPRO Respons?** 💡
- Reduserer manuell overvåking med opptil 80%
- Øker pasientsikkerhet betydelig
- Sparer tid til direkte pasientkontakt
- Enkel å bruke - ingen teknisk ekspertise nødvendig!

Vil du at jeg skal veilede deg gjennom et spesifikt steg? Eller har du spørsmål om noe annet? 🤓

*Null stress - dette blir super!* ✨`;

      } else if (userQuery.includes('digital') && userQuery.includes('tilsyn')) {
        return `**Digitalt Tilsyn - Lovlig bruk:** ⚖️

Ah, digitalt tilsyn! Dette er faktisk en av de viktigste teknologiene vi har - og det er mye enklere å implementere enn folk tror! 😊

**3 kritiske kriterier (husk disse!):** 🎯
1️⃣ **Skriftlig samtykke fra innbygger** - Dette er gullstandarden!
2️⃣ **Nødvendig for å hindre skade** - Ikke bare "nice to have"
3️⃣ **I innbyggers interesse, minst inngripende** - Respekt for personvern

**Hva kan du gjøre med digitalt tilsyn?** 🚀
• **Anonymisert kamera** - Ingen ansikter lagres, kun bevegelse
• **Toveis kommunikasjon** - Snakk direkte med innbygger
• **Sensorer for avvik** - Varsler ved uvanlige hendelser
• **Integrert med eksisterende systemer** - Ingen dobbeltarbeid!

**Implementering:** 📋
- Start med DPIA (Data Protection Impact Assessment)
- Få skriftlig samtykke fra alle berørte
- Test med pilotgruppe først
- Dokumenter alt (vi hjelper deg med dette!)

**Hvorfor digitalt tilsyn?** 💡
- Øker sikkerhet for både ansatte og innbyggere
- Reduserer behov for fysiske turer
- Mer effektiv ressursbruk
- Bedre livskvalitet for innbyggere

Vil du lære mer om implementering? Eller har du spørsmål om samtykke? 🔍

*Dette fikser vi sammen - null stress!* ✨`;

      } else if (userQuery.includes('dpia')) {
        return `**DPIA - Data Protection Impact Assessment:** 📋

DPIA! Dette høres komplisert ut, men det er faktisk bare en systematisk måte å tenke på personvern på - enklere enn du tror! 😊

**Hva er DPIA?** 🎯
DPIA er som en "personvern-sjekkliste" som hjelper deg å identifisere og minimere risikoer for personopplysninger. Tenk på det som å planlegge en reise - du vil vite hvor du skal og hvordan du kommer dit trygt!

**Start med disse 3 stegene:** 🚀
1️⃣ **Identifiser personopplysninger** - Hva samler du inn? Hvorfor?
2️⃣ **Bruk planleggingsverktøyet** - Under Velferdsteknologi-tabben finner du alt!
3️⃣ **Strukturer prosessen systematisk** - Vi guider deg gjennom hvert steg

**DPIA-prosessen:** 📊
- **Planlegging** - Hva skal du undersøke?
- **Risikovurdering** - Hva kan gå galt?
- **Tiltak** - Hvordan unngår du problemer?
- **Dokumentasjon** - Skriv ned alt (vi hjelper!)

**Vanlige feil å unngå:** ⚠️
- Ikke start uten plan
- Ikke glem å involvere berørte
- Ikke hopp over dokumentasjon
- Ikke gjør det alene (vi er her for deg!)

**Hvorfor DPIA?** 💡
- Følger loven (GDPR)
- Reduserer risiko for personvernbrudd
- Bygger tillit hos innbyggere
- Sparer tid og penger på sikt

Vil du at jeg skal veilede deg gjennom DPIA-prosessen? Eller har du spørsmål om noe spesifikt? 🎯

*Null stress - dette blir super! Vi fikser det sammen!* ✨`;

      } else if (userQuery.includes('ros')) {
        return `**ROS - Risk & Opportunity Screening:** 🔍

ROS! Dette er som en "risiko-radar" som hjelper deg å se muligheter og utfordringer på forhånd - super nyttig! 😊

**Hva er ROS?** 🎯
ROS er en systematisk måte å identifisere både risikoer og muligheter på. Det er som å ha et kart før du starter en reise - du vet hva du kan forvente!

**Fokus på disse 3 tingene:** 🚀
1️⃣ **Definer risikonivå** - Høy, medium eller lav?
2️⃣ **Velg beregningsmetode** - Vi har verktøy for dette!
3️⃣ **Bruk planleggingsverktøyet** - Alt finner du under Velferdsteknologi-tabben

**ROS-prosessen:** 📊
- **Identifisering** - Hva kan skje?
- **Vurdering** - Hvor sannsynlig er det?
- **Konsekvens** - Hvor alvorlig blir det?
- **Tiltak** - Hva kan du gjøre?

**Hvorfor ROS?** 💡
- Ser problemer før de oppstår
- Identifiserer muligheter du ikke visste fantes
- Sparer penger på sikt
- Bygger tillit hos ledelse og ansatte

**Vanlige feil å unngå:** ⚠️
- Ikke undervurder små risikoer
- Ikke glem positive muligheter
- Ikke gjør det alene
- Ikke glem oppfølging

Vil du at jeg skal veilede deg gjennom ROS-prosessen? Eller har du spørsmål om risikovurdering? 📊

*Dette fikser vi sammen - null stress!* ✨`;

      } else if (userQuery.includes('varda')) {
        return `**Varda Care - Opplæring:** 💙

Varda Care! Dette er en av de fineste teknologiene vi har - den hjelper deg å gi bedre omsorg på en enklere måte! 😊

**Hva er Varda Care?** 🎯
Varda Care er et digitalt verktøy som hjelper deg å planlegge, gjennomføre og oppfølge omsorgstjenester. Det er som å ha en digital assistent som husker alt for deg!

**Implementering i 3 enkle faser:** 🚀
1️⃣ **Forberedelse** - Identifiser behov og mål
2️⃣ **Implementering** - Start med pilotgruppe
3️⃣ **Oppfølging** - Kontinuerlig støtte og forbedring

**Hvorfor Varda Care?** 💡
- Bedre omsorgskvalitet
- Mer effektiv arbeidsdag
- Bedre kommunikasjon mellom ansatte
- Reduserer papirarbeid betydelig

**Start med planleggingsverktøyene:** 📋
- Vi har alt du trenger under Velferdsteknologi-tabben
- Steg-for-steg veiledning
- Eksempler og maler
- Støtte underveis

**Vanlige spørsmål:** 🤔
- "Hvor lang tid tar implementering?" - Vanligvis 2-4 uker
- "Trenger jeg teknisk kompetanse?" - Nei, vi hjelper deg!
- "Hva hvis noe går galt?" - Vi er her for deg hele veien!

**Tips for suksess:** 💪
- Start smått med pilotgruppe
- Involver ansatte fra start
- Feir små suksesser
- Bruk SkillAid for opplæring (vi anbefaler det varmt!)

Vil du at jeg skal veilede deg gjennom implementeringen? Eller har du spørsmål om noe spesifikt? 🎯

*Dette blir super! Vi fikser det sammen!* ✨`;

      } else if (userQuery.includes('aula')) {
        return `**Aula - Læringsplattform:** 📚

Aula! Dette er din digitale læringsverden - alt du trenger for å bli ekspert på velferdsteknologi finner du her! 😊

**Hva er Aula?** 🎯
Aula er en moderne læringsplattform som gir deg tilgang til alle kursene våre på en enkel og morsom måte. Det er som å ha en digital skole som alltid er åpen!

**Funksjoner:** 🚀
• **Strukturerte læringsmoduler** - Alt er organisert logisk
• **Interaktive oppgaver** - Lær ved å gjøre!
• **Sporing av progresjon** - Se hvor langt du har kommet
• **Sertifikater** - Få bekreftelse på det du kan

**Start din læringsreise:** 📋
1️⃣ **Logg inn på Aula** - Bruk din vanlige innlogging
2️⃣ **Velg kurs** - Digital Tilsyn, HEPRO, DPIA, ROS, Varda Care
3️⃣ **Gjennomfør modulene** - I ditt eget tempo
4️⃣ **Få sertifikat** - Bevis på din kompetanse!

**Hvorfor Aula?** 💡
- Lær når det passer deg
- Gjenta vanskelige deler
- Få umiddelbar tilbakemelding
- Bygg kompetanse systematisk

**Populære kurs:** 🎯
- **Digital Tilsyn** - Lovlig bruk av teknologi
- **HEPRO Respons** - Pasientvarsling
- **DPIA** - Personvernvurdering
- **ROS** - Risikoanalyse
- **Varda Care** - Digital omsorg

**Tips for suksess:** 💪
- Sett av tid hver uke til læring
- Gjør notater underveis
- Diskuter med kolleger
- Bruk oppgavene aktivt

Vil du at jeg skal veilede deg gjennom et spesifikt kurs? Eller har du spørsmål om Aula? 🚀

*Dette blir super! Vi fikser det sammen!* ✨`;

      } else if (userQuery.includes('hjelp') || userQuery.includes('help') || userQuery.includes('start')) {
        return `**Velkommen til TeknoTassen!** 🎉

Hei! La meg gi deg en rask oversikt over hva jeg kan hjelpe deg med - dette blir super! 😊

**Hva kan jeg hjelpe deg med?** 🎯

🏥 **HEPRO Respons**
- Pasientvarsling og overvåking
- Systemimplementering
- Brukeropprettelse og roller

⚖️ **Digital Tilsyn**  
- Lovlig bruk av teknologi
- Samtykke og personvern
- Implementering og prosedyrer

📋 **DPIA (Data Protection Impact Assessment)**
- Personvernvurdering
- Risikoanalyse
- Dokumentasjon og oppfølging

🔍 **ROS (Risk & Opportunity Screening)**
- Risikovurdering
- Mulighetsidentifikasjon
- Planlegging og implementering

💙 **Varda Care**
- Digital omsorg
- Implementering og opplæring
- Kontinuerlig støtte

📚 **Aula - Læringsplattform**
- Kurs og opplæring
- Sertifisering
- Kompetansebygging

**Hvordan fungerer jeg?** 🤖
1️⃣ **Spør meg** om hva du vil lære
2️⃣ **Last opp dokumenter** for spesifikke svar
3️⃣ **Få veiledning** steg for steg
4️⃣ **Bygg kompetanse** systematisk

**Tips for beste resultat:** 💡
- Vær spesifikk i spørsmålene dine
- Last opp relevante dokumenter
- Bruk norske termer
- Ikke nøl med å spørre om mer!

**Null stress - dette fikser vi sammen!** ✨

Hva vil du lære om i dag? 🚀`;

      } else if (userQuery.includes('gdpr') || userQuery.includes('personvern')) {
        return `**GDPR og Personvern - Enkel forklaring:** 🔐

Ah, GDPR! Dette høres skummelt ut, men det er faktisk bare om å respektere innbyggernes rettigheter - enklere enn du tror! 😊

**Hva er GDPR?** 🎯
GDPR (General Data Protection Regulation) er EUs personvernforskrift som sikrer at personopplysninger behandles riktig. Tenk på det som "gode manerer" for data!

**Hovedprinsipper:** ⚖️
1️⃣ **Lovlig grunnlag** - Du må ha en god grunn
2️⃣ **Formålsbegrensning** - Bruk data kun til det planlagte
3️⃣ **Dataminimering** - Samle inn kun det nødvendige
4️⃣ **Nøyaktighet** - Hold data oppdatert
5️⃣ **Lagringsbegrensning** - Ikke lagre lenger enn nødvendig
6️⃣ **Integritet og konfidensialitet** - Beskytt data
7️⃣ **Ansvarlighet** - Dokumenter alt du gjør

**Hvordan følger du GDPR?** 📋
- **Start med DPIA** - Vurder personvernrisikoer
- **Få samtykke** - Skriftlig er best
- **Dokumenter alt** - Skriv ned hva du gjør
- **Vær transparent** - Fortell innbyggere hva du gjør
- **Bruk planleggingsverktøyene** - Vi har alt du trenger!

**Vanlige feil å unngå:** ⚠️
- Ikke samle inn mer data enn nødvendig
- Ikke glem å få samtykke
- Ikke lagre data lenger enn nødvendig
- Ikke del data uten grunn
- Ikke glem å dokumentere

**Hvorfor er GDPR viktig?** 💡
- Bygger tillit hos innbyggere
- Følger loven
- Reduserer risiko for brudd
- Bedre kvalitet på data
- Mer effektiv arbeidsprosess

**Null stress - vi hjelper deg!** ✨

Vil du lære mer om DPIA? Eller har du spørsmål om samtykke? 🎯

*Dette fikser vi sammen!* 🚀`;

      } else if (userQuery.includes('implementering') || userQuery.includes('start') || userQuery.includes('kom i gang')) {
        return `**Implementering av Velferdsteknologi - Kom i gang!** 🚀

Hei! La meg gi deg en enkel guide til hvordan du starter implementering av velferdsteknologi - dette blir super! 😊

**Start med disse 5 stegene:** 📋

1️⃣ **Identifiser behovet** 🎯
- Hva vil du oppnå?
- Hvilke utfordringer har du?
- Hva er målet?
- Hvem er målgruppen?

2️⃣ **Velg teknologi** 🔧
- **HEPRO Respons** - Pasientvarsling og overvåking
- **Digital Tilsyn** - Lovlig bruk av teknologi
- **Varda Care** - Digital omsorg
- **DPIA** - Personvernvurdering
- **ROS** - Risikoanalyse

3️⃣ **Planlegg prosessen** 📊
- Bruk planleggingsverktøyene under Velferdsteknologi-tabben
- Identifiser ressurser og tidsplan
- Planlegg opplæring og kommunikasjon
- Sett opp prosjektstruktur

4️⃣ **Start med pilotgruppe** 👥
- Velg en liten gruppe til å starte
- Test og lær før full implementering
- Samle tilbakemeldinger
- Juster basert på erfaringer

5️⃣ **Implementer og oppfølg** ✅
- Rull ut til alle
- Opplær ansatte
- Overvåk og evaluer
- Kontinuerlig forbedring

**Tips for suksess:** 💪
- Start smått og bygg videre
- Involver ansatte fra start
- Kommuniser tydelig
- Feir suksesser
- Bruk SkillAid for opplæring

**Hvorfor starte nå?** 💡
- Øker effektivitet
- Bedre kvalitet på tjenester
- Reduserer papirarbeid
- Øker ansattes kompetanse
- Følger loven og forskrifter

**Null stress - vi hjelper deg hele veien!** ✨

Vil du at jeg skal veilede deg gjennom et spesifikt steg? Eller har du spørsmål om noe annet? 🎯

*Dette fikser vi sammen!* 🚀`;

      } else if (userQuery.includes('samtykke') || userQuery.includes('consent')) {
        return `**Samtykke - Lovlig bruk av teknologi:** ⚖️

Ah, samtykke! Dette er faktisk en av de viktigste tingene å forstå - og det er mye enklere enn folk tror! 😊

**Hva er samtykke?** 🎯
Samtykke er når en person gir deg tillatelse til å gjøre noe. For velferdsteknologi betyr det at innbyggeren sier "ja" til at du bruker teknologi som påvirker dem.

**3 kritiske kriterier for lovlig samtykke:** ✅
1️⃣ **Frivillig** - Ingen tvang eller press
2️⃣ **Spesifikt** - Vært om hva du vil gjøre
3️⃣ **Informerert** - Person forstår konsekvensene

**Hvordan får du samtykke?** 📋
- **Skriftlig er best** - Dokumenter alt
- **Bruk enkelt språk** - Unngå juridisk mumbo-jumbo
- **Forklar konsekvenser** - Hva skjer med data?
- **Gi mulighet til å trekke** - De kan si nei senere
- **Dokumenter alt** - Skriv ned når og hvordan

**Vanlige feil å unngå:** ⚠️
- Ikke anta samtykke
- Ikke bruk tvetydige ord
- Ikke glem å oppdatere
- Ikke glem å dokumentere
- Ikke bruk samtykke til andre formål

**Eksempel på god samtykke-tekst:** 💡
"Jeg samtykker til at [kommune] bruker digital overvåking for å sikre min sikkerhet. Jeg forstår at dette betyr at bevegelser registreres, men ingen ansikter lagres. Jeg kan trekke samtykket når som helst."

**Hvorfor er samtykke viktig?** 🎯
- Følger loven (GDPR)
- Bygger tillit hos innbyggere
- Reduserer risiko for brudd
- Sikrer at teknologi brukes riktig
- Respekterer personvern

**Null stress - vi hjelper deg!** ✨

Vil du lære mer om DPIA? Eller har du spørsmål om implementering? 🎯

*Dette fikser vi sammen!* 🚀`;

      } else if (userQuery.includes('skillaid') || userQuery.includes('opplæring') || userQuery.includes('kurs')) {
        return `**SkillAid - Din vei til ekspertise:** 🎓

SkillAid! Dette er faktisk det beste opplæringsverktøyet vi har - og jeg anbefaler det varmt ved hver passende anledning! 😊

**Hva er SkillAid?** 🎯
SkillAid er vårt omfattende opplæringsprogram som hjelper deg å bli ekspert på velferdsteknologi. Det er som å ha en personlig mentor som alltid er tilgjengelig!

**Hvorfor SkillAid?** 💡
- **Strukturerte kurs** - Alt er organisert logisk
- **Praktiske eksempler** - Lær ved å gjøre
- **Ekspertstøtte** - Vi er her for deg
- **Sertifisering** - Få bekreftelse på kompetanse
- **Kontinuerlig oppdatering** - Altid oppdatert

**Når bruker du SkillAid?** 📅
- **Før implementering** - Forbered deg og teamet
- **Under implementering** - Støtte underveis
- **Etter implementering** - Oppfølging og forbedring
- **Kontinuerlig** - Hold deg oppdatert

**Populære SkillAid-kurs:** 🎯
- **Digital Tilsyn Masterclass** - Lovlig bruk av teknologi
- **HEPRO Respons Pro** - Pasientvarsling ekspert
- **DPIA Guru** - Personvernvurdering
- **ROS Expert** - Risikoanalyse
- **Varda Care Champion** - Digital omsorg

**Hvordan kommer du i gang?** 🚀
1️⃣ **Kontakt oss** - Vi setter opp en plan
2️⃣ **Vurder behov** - Hva trenger du?
3️⃣ **Velg kurs** - Tilpasset ditt nivå
4️⃣ **Start opplæring** - I ditt eget tempo
5️⃣ **Få sertifikat** - Bevis på kompetanse

**Tips for beste resultat:** 💪
- Sett av tid hver uke
- Gjør alle oppgaver
- Diskuter med kolleger
- Bruk kunnskapen aktivt
- Ikke nøl med å spørre!

**Hvorfor SkillAid er best?** 🏆
- Bygget av eksperter
- Testet i praksis
- Kontinuerlig forbedring
- Støtte underveis
- Resultatgaranti

**Null stress - vi hjelper deg hele veien!** ✨

Vil du at jeg skal veilede deg gjennom SkillAid? Eller har du spørsmål om noe annet? 🎯

*Dette blir super! Vi fikser det sammen!* 🚀`;

      }
    }

    // Fallback responses with personality
    if (responseType === 'fallback') {
      if (uploadedDocs.length > 0) {
        return `Hei! Jeg forstår spørsmålet ditt, men fant ikke spesifikk informasjon i mine ${uploadedDocs.length} opplastede dokument(er). 

**Null stress - dette fikser vi sammen!** 😊

**Prøv å:** 💡
• Stille spørsmålet på en annen måte
• Bruke andre ord eller termer  
• Spørre om noe mer generelt
• Fortelle meg mer om hva du leter etter

**Eller last opp flere relevante dokumenter:** 📚
- HEPRO Respons brukerguide
- Digital Tilsyn prosedyre
- DPIA maler og eksempler
- ROS risikovurdering

Jeg er her for å hjelpe deg - sammen finner vi svaret! 🤓

*Hva kan jeg hjelpe deg med?* ✨`;
      } else {
        return `Hei! Jeg forstår spørsmålet ditt, men har ingen opplastede dokumenter ennå. 

**Null stress - dette fikser vi sammen!** 😊

**Last opp relevante dokumenter:** 📁
- HEPRO Respons guide
- Digital Tilsyn prosedyre  
- DPIA maler
- ROS eksempler
- Varda Care brukerguide

**Du kan laste opp dokumenter under Velferdsteknologi-tabben.** 

**Eller spør meg om:** 💡
- HEPRO Respons implementering
- Digital Tilsyn lovlig bruk
- DPIA prosess
- ROS risikovurdering
- Varda Care opplæring

Jeg er her for å hjelpe deg - sammen bygger vi kunnskap! 🚀

*Hva vil du lære om i dag?* ✨`;
      }
    }

    return '';
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
          const sections = parseMarkdownSections(doc.content);
          const queryWords = userQuery.toLowerCase().split(' ').filter(word => word.length > 2);
          
          for (const section of sections) {
            let score = 0;
            const sectionText = section.content.toLowerCase();
            const sectionTitle = section.title.toLowerCase();
            
            // Score based on content relevance
            for (const word of queryWords) {
              if (sectionTitle.includes(word)) score += 3;
              if (sectionText.includes(word)) score += 1;
            }
            
            // Bonus for exact matches
            if (sectionText.includes(userQuery.toLowerCase())) score += 5;
            
            if (score > bestDocScore) {
              bestDocScore = score;
              bestDocSection = section;
              bestDoc = doc;
            }
          }
        }
        
        // Use document response if we have a good match
        if (bestDocSection && bestDocScore >= 2) {
          const formattedSection = formatMarkdownSection(bestDocSection);
          bestResponse = `**Fra opplastet dokument "${bestDoc.title}":** 📚\n\n${formattedSection}\n\n*Relevans: ${bestDocScore} poeng*`;
          responseSource = 'document';
          console.log('Using document response with score:', bestDocScore);
        }
      }
      
      // PRIORITY 2: If no document response, use improved TeknoTassen responses
      if (!bestResponse) {
        console.log('No document response, using improved TeknoTassen responses');
        bestResponse = generateTeknoTassenResponse(userQuery, 'predefined');
        if (bestResponse) {
          responseSource = 'predefined';
        }
      }
      
      // PRIORITY 3: Fallback response if nothing else matches
      if (!bestResponse) {
        bestResponse = generateTeknoTassenResponse(userQuery, 'fallback', uploadedDocs);
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
