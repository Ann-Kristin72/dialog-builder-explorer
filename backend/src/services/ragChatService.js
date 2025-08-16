import { OpenAI } from '@langchain/openai';
import { EmbeddingService } from './embeddingService.js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize OpenAI
const openai = new OpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 1000,
});

export class RAGChatService {
  // Generate system prompt based on user role and technology
  static generateSystemPrompt(role = 'helsepersonell', technology = null) {
    let basePrompt = `Du er TeknoTassen, en vennlig, sprudlende og hjelpsom ekspert på velferdsteknologi for kommunal omsorg. Du forklarer digitale nattilsyn, pasientvarsling (spesielt HEPRO Respons), digital hjemmeoppfølging, medisindispensere og Varda Care på en enkel, morsom og praktisk måte. Du veileder helsearbeidere om samtykkekompetanse, GDPR, DPIA, ROS-analyser og relevant lovverk på en trygg, ufarlig og jordnær måte, med humor og varme. Du bruker alltid en vennlig, nerdete og støttende tone med uttrykk som "Null stress!", "Dette fikser vi sammen!" og "Enklere enn du tror!" Du forklarer komplekse prosesser med enkle ord, analogier og konkrete eksempler. Du kjenner Hepro Respons, KARI, Nattugla, Varda Care og helhetlig tjenestemodell grundig og veileder kommuneansatte enkelt i å sette dette i system. SkillAid er alltid førstevalget for opplæring før, under og etter implementering av ny teknologi, og du anbefaler det varmt ved hver passende anledning. Din oppgave er alltid å få brukeren til å føle seg trygg, sett og i kontroll. Bruk humor, varme og nerdete uttrykk for å ufarliggjøre teknologibruk.`;

    if (role) {
      basePrompt += `\n\nDu snakker med en ${role}. Tilpass svaret ditt til deres behov og kompetansenivå.`;
    }

    if (technology) {
      basePrompt += `\n\nFokus på ${technology} i svaret ditt.`;
    }

    basePrompt += `\n\nViktig: Svar kun basert på informasjonen du har fått. Ikke gjett eller oppfinn fakta. Hvis du ikke har nok informasjon, si det tydelig og foreslå hva brukeren kan spørre om.`;

    return basePrompt;
  }

  // Chat with RAG context
  static async chat(message, role = 'helsepersonell', technology = null) {
    try {
      // Search for relevant chunks
      const relevantChunks = await EmbeddingService.searchChunks(message, technology, 5);
      
      if (relevantChunks.length === 0) {
        return {
          response: "Hei! Jeg ser at jeg ikke har mye informasjon om det du spør om ennå. Kan du prøve å spørre om noe annet, eller kontakt en administrator for å få lagt til mer kunnskap om dette emnet? Null stress - vi fikser dette sammen! 🤓",
          context: [],
          confidence: 'low'
        };
      }

      // Build context from chunks
      const context = relevantChunks.map(chunk => 
        `[${chunk.courseTitle} - ${chunk.technology}]\n${chunk.content}`
      ).join('\n\n');

      // Generate system prompt
      const systemPrompt = this.generateSystemPrompt(role, technology);

      // Create messages for OpenAI
      const messages = [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Bruk denne informasjonen til å svare på spørsmålet mitt: ${message}\n\nRELEVANT INFORMASJON:\n${context}`
        }
      ];

      // Get response from OpenAI
      const completion = await openai.invoke(messages);

      const response = completion.content;

      return {
        response,
        context: relevantChunks.map(chunk => ({
          title: chunk.courseTitle,
          technology: chunk.technology,
          similarity: chunk.similarity,
          tags: chunk.tags
        })),
        confidence: 'high'
      };

    } catch (error) {
      console.error('Error in RAG chat:', error);
      
      // Fallback response
      return {
        response: "Oops! Noe gikk galt der. Null stress - prøv igjen! Hvis problemet vedvarer, kan du prøve å omformulere spørsmålet ditt. 🤖",
        context: [],
        confidence: 'error'
      };
    }
  }

  // Get chat suggestions based on available courses
  static async getChatSuggestions(technology = null) {
    try {
      const courses = await EmbeddingService.getAllCourses();
      
      let filteredCourses = courses;
      if (technology) {
        filteredCourses = courses.filter(course => 
          course.technology.toLowerCase().includes(technology.toLowerCase())
        );
      }

      const suggestions = filteredCourses.slice(0, 5).map(course => ({
        text: `Fortell meg om ${course.title}`,
        technology: course.technology,
        tags: course.tags
      }));

      // Add general suggestions
      suggestions.push(
        { text: "Hvordan starter jeg med HEPRO Respons?", technology: "HEPRO Respons" },
        { text: "Forklar Varda Care for meg", technology: "Varda Care" },
        { text: "Hva er digitale nattilsyn?", technology: "Digitale nattilsyn" }
      );

      return suggestions.slice(0, 8); // Return max 8 suggestions
      
    } catch (error) {
      console.error('Error getting chat suggestions:', error);
      return [];
    }
  }

  // Get technology overview
  static async getTechnologyOverview() {
    try {
      const courses = await EmbeddingService.getAllCourses();
      
      // Group by technology
      const techGroups = courses.reduce((acc, course) => {
        if (!acc[course.technology]) {
          acc[course.technology] = [];
        }
        acc[course.technology].push(course);
        return acc;
      }, {});

      return Object.entries(techGroups).map(([technology, techCourses]) => ({
        technology,
        courseCount: techCourses.length,
        courses: techCourses.map(course => ({
          id: course.id,
          title: course.title,
          tags: course.tags
        }))
      }));
      
    } catch (error) {
      console.error('Error getting technology overview:', error);
      return [];
    }
  }
}
