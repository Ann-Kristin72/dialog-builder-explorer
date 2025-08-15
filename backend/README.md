# 🚀 TeknoTassen RAG Backend

En intelligent backend for TeknoTassen som kombinerer RAG (Retrieval-Augmented Generation) med moderne AI-teknologi for å gi presise svar basert på opplastet kunnskap.

## 🌟 Funksjoner

### **RAG (Retrieval-Augmented Generation)**
- **Embedding-basert søk** med pgvector
- **Intelligent chunking** av markdown-dokumenter
- **Kontekstbevisste AI-svar** basert på faktisk kunnskap
- **Ingen hallucineringer** - AI svarer kun basert på opplastet materiale

### **Kursadministrasjon**
- **Markdown-opplasting** med validering
- **Automatisk chunking** og embedding-generering
- **Metadata-håndtering** (tittel, teknologi, tags)
- **Søk og filtrering** av kurs

### **AI-Chat Integration**
- **Dynamiske prompts** basert på brukerrolle og teknologi
- **Relevant kontekst** hentet fra kunnskapsbase
- **Personlighet** - TeknoTassens vennlige og nerdete tone
- **Chat-forslag** basert på tilgjengelige kurs

## 🛠️ Teknologier

- **Node.js** + **Express.js** - Moderne backend-framework
- **PostgreSQL** + **pgvector** - Vektor-database for embeddings
- **LangChain** - AI/ML pipeline for tekstbehandling
- **OpenAI API** - Embeddings og chat-generering
- **Multer** - Filopplasting og validering
- **Zod** - Runtime validering av data

## 🚀 Kom i gang

### **Forutsetninger**
- Node.js 18+
- PostgreSQL 14+ med pgvector extension
- OpenAI API-nøkkel

### **Installasjon**

1. **Klon repository og naviger til backend-mappen**
```bash
cd backend
```

2. **Installer avhengigheter**
```bash
npm install
```

3. **Opprett .env-fil**
```bash
cp .env.example .env
# Fyll ut dine verdier
```

4. **Start PostgreSQL og opprett database**
```bash
createdb teknotassen_dev
psql teknotassen_dev -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

5. **Start backend-serveren**
```bash
npm run dev
```

## 🔧 Konfigurasjon

### **Miljøvariabler (.env)**
```bash
# Server
PORT=3001
NODE_ENV=development

# Database
DB_USER=ann-kristin
DB_HOST=localhost
DB_NAME=teknotassen_dev
DB_PASSWORD=
DB_PORT=5432

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here
```

### **Database Setup**
```sql
-- Opprett pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabellene opprettes automatisk ved første kjøring
```

## 📚 API Endepunkter

### **Kursadministrasjon**
- `POST /api/courses/upload` - Last opp markdown-kurs
- `GET /api/courses` - Hent alle kurs
- `GET /api/courses/:id` - Hent kurs etter ID
- `DELETE /api/courses/:id` - Slett kurs

### **RAG Chat**
- `POST /api/courses/chat` - Chat med RAG-kontekst
- `GET /api/courses/chat/suggestions` - Få chat-forslag
- `GET /api/courses/technology/overview` - Teknologioversikt

### **System**
- `GET /health` - Helsesjekk

## 🧠 RAG-arkitektur

### **1. Dokumentopplasting**
```
Markdown-fil → Validering → Chunking → Embedding → Lagring i pgvector
```

### **2. Chat-prosess**
```
Bruker-spørsmål → Embedding → Søk i pgvector → Kontekst → AI-svar
```

### **3. Embedding Pipeline**
- **Chunking**: 1000 tegn per chunk med 200 tegn overlap
- **Embedding**: OpenAI text-embedding-3-small (1536 dimensjoner)
- **Søk**: Cosine similarity med pgvector

## 📁 Prosjektstruktur

```
backend/
├── src/
│   ├── routes/
│   │   └── courses.js          # API-ruter
│   ├── services/
│   │   ├── embeddingService.js # Embedding og database
│   │   └── ragChatService.js   # RAG chat-logikk
│   ├── utils/
│   │   └── database.js         # Database-tilkobling
│   └── server.js               # Hovedserver
├── package.json
└── README.md
```

## 🔍 Testing

### **Test database-tilkobling**
```bash
curl http://localhost:3001/health
```

### **Test kurs-opplasting**
```bash
curl -X POST http://localhost:3001/api/courses/upload \
  -F "file=@test-course.md" \
  -F "title=Test Kurs" \
  -F "technology=HEPRO Respons"
```

### **Test RAG-chat**
```bash
curl -X POST http://localhost:3001/api/courses/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hvordan starter jeg med HEPRO Respons?", "role": "helsepersonell"}'
```

## 🚀 Deployment

### **Lokal utvikling**
```bash
npm run dev
```

### **Produksjon**
```bash
npm start
```

### **Docker (kommer snart)**
```bash
docker build -t teknotassen-backend .
docker run -p 3001:3001 teknotassen-backend
```

## 🔐 Sikkerhet

- **Helmet.js** - Sikkerhets-headers
- **Rate limiting** - Beskytter mot abuse
- **CORS-konfigurasjon** - Begrenset tilgang
- **Input validering** - Zod-schemas
- **Filtype-validering** - Kun markdown/text

## 📊 Monitoring

- **Health checks** - `/health` endpoint
- **Error logging** - Strukturert feilhåndtering
- **Performance tracking** - Chunking og embedding metrics
- **Database monitoring** - pgvector performance

## 🤝 Bidrag

1. Fork repository
2. Opprett feature branch
3. Commit endringer
4. Push til branch
5. Opprett Pull Request

## 📄 Lisens

MIT License

---

**TeknoTassen RAG Backend** - Gjør AI-intelligens tilgjengelig med faktisk kunnskap! 🦉✨
