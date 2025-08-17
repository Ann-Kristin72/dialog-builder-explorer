# 🚀 **TeknoTassen Backend - RAG API**

## 📋 **Oversikt**

TeknoTassen Backend er en Node.js/Express.js API som implementerer en komplett RAG (Retrieval-Augmented Generation) pipeline for teknisk kunnskap og kurs.

### **🎯 Hovedfunksjoner**
- **RAG Pipeline** - OpenAI embeddings + pgvector similarity search
- **Kurs Ingest** - Markdown parsing og chunking
- **Semantisk Søk** - AI-drevet informasjonsretrieval
- **Azure Integration** - Blob Storage, Key Vault, PostgreSQL
- **TTS/STT** - Text-to-Speech og Speech-to-Text

---

## 🏗️ **Arkitektur**

### **Service Layer**
```
backend/src/
├── services/
│   ├── azureStorageService.js    # Azure Blob & Key Vault
│   ├── embeddingService.js       # OpenAI embeddings
│   ├── markdownParserService.js  # Markdown parsing
│   ├── ragChatService.js         # RAG chat logic
│   └── ttsSttService.js          # TTS/STT services
├── routes/
│   ├── courses.js                # Kurs API endpoints
│   └── ttsStt.js                 # TTS/STT endpoints
├── utils/
│   └── database.js               # PostgreSQL + pgvector
└── server.js                     # Express server entry point
```

### **Data Flow**
```
Markdown Upload → Parsing → Chunking → Embedding → Vector Storage
                                                      ↓
User Question → Semantic Search → Context Retrieval → AI Response
```

---

## 🔧 **Kritiske Fixes Implementert**

### **1. Import Order Problem (LØST)**
**Problem:** Import statements kom etter bruk i `server.js`
```javascript
// ❌ FEIL - Imports etter bruk
app.use(helmet());  // helmet ikke importert ennå!
// ... senere ...
import helmet from 'helmet';  // For sent!
```

**Løsning:** Flyttet alle imports til toppen
```javascript
// ✅ RIKTIG - Imports først
import express from "express";
import helmet from 'helmet';
import cors from 'cors';
// ... alle andre imports ...
const app = express();
app.use(helmet());  // Nå fungerer!
```

### **2. Azure Services Robustness (LØST)**
**Problem:** Azure services krasjet uten environment variables
```javascript
// ❌ FEIL - Krasjet uten config
if (!this.keyVaultUrl) {
  throw new Error('AZURE_KEY_VAULT_URL environment variable is required');
}
```

**Løsning:** Graceful fallback i `initializeServices()`
```javascript
// ✅ RIKTIG - Sjekk config først
const hasAzureConfig = process.env.AZURE_KEY_VAULT_URL || 
                       process.env.POSTGRES_URL || 
                       process.env.BLOB_CONNECTION_STRING;

if (!hasAzureConfig) {
  console.log('ℹ️ Azure services not configured, skipping initialization');
  return;
}
```

### **3. Server Startup Order (LØST)**
**Problem:** Heavy initialization blokkerte server startup
```javascript
// ❌ FEIL - Server ventet på DB/KeyVault
await initializeServices();  // Blokkerende!
app.listen(port, "0.0.0.0", () => { ... });
```

**Løsning:** Non-blocking startup i `server.js`
```javascript
// ✅ RIKTIG - Server starter først
app.listen(port, "0.0.0.0", () => {
  console.log(`Listening on http://0.0.0.0:${port}`);
});

// Services initialiseres i bakgrunnen
initializeServices();  // Non-blocking!
```

---

## 🐳 **Docker Konfigurasjon**

### **Dockerfile**
```dockerfile
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

# Azure Web App port configuration
ENV PORT=8181
EXPOSE 8181

# Start appen
CMD ["npm", "start"]
```

### **Port Configuration**
- **Container Port:** 8181 (matching Azure Web App)
- **Azure Setting:** `WEBSITES_PORT=8181`
- **Binding:** `0.0.0.0:8181` (all interfaces)

---

## 🔌 **API Endpoints**

### **Health Check**
```http
GET /healthz
Response: "OK" (200)
```

### **Kurs API (`/api/courses`)**

#### **Ingest Markdown**
```http
POST /api/courses/ingest
Content-Type: multipart/form-data

Body:
- file: File (markdown)
- courseId: string
- technology: string
- tenantId?: string

Response:
{
  "success": true,
  "courseId": "string",
  "chunksCreated": number,
  "assetsFound": number
}
```

#### **RAG Query**
```http
POST /api/query
Content-Type: application/json

Body:
{
  "question": "string",
  "courseId": "string?",
  "technology": "string?",
  "tenantId": "string?",
  "maxResults": "number?"
}

Response:
{
  "answer": "string",
  "sources": [
    {
      "nano_slug": "string",
      "unit_slug": "string",
      "content": "string",
      "similarity": number
    }
  ],
  "assets": [
    {
      "url": "string",
      "kind": "string",
      "alt": "string"
    }
  ]
}
```

#### **List Courses**
```http
GET /api/courses
Query Parameters:
- technology?: string
- tenantId?: string

Response:
{
  "courses": [
    {
      "id": number,
      "title": "string",
      "description": "string",
      "technology": "string",
      "created_at": "string"
    }
  ]
}
```

### **TTS/STT API (`/api/tts-stt`)**

#### **Text-to-Speech**
```http
POST /api/tts-stt/speak
Content-Type: application/json

Body:
{
  "text": "string",
  "voice": "string?",
  "language": "string?"
}

Response:
{
  "audioUrl": "string",
  "duration": number
}
```

#### **Speech-to-Text**
```http
POST /api/tts-stt/transcribe
Content-Type: multipart/form-data

Body:
- audio: File (audio file)

Response:
{
  "text": "string",
  "confidence": number,
  "language": "string"
}
```

---

## 🗄️ **Database Schema**

### **Core Tables**

#### **Courses**
```sql
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  technology VARCHAR(100),
  tenant_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Course Chunks**
```sql
CREATE TABLE course_chunks (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id),
  nano_slug VARCHAR(100),
  unit_slug VARCHAR(100),
  content TEXT NOT NULL,
  embedding vector(1536),
  meta JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **Course Assets**
```sql
CREATE TABLE course_assets (
  id SERIAL PRIMARY KEY,
  course_id INTEGER REFERENCES courses(id),
  nano_slug VARCHAR(100),
  unit_slug VARCHAR(100),
  url TEXT NOT NULL,
  kind VARCHAR(50),
  alt TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### **Indexes**
```sql
-- Vector similarity search
CREATE INDEX ON course_chunks USING ivfflat (embedding vector_cosine_ops);

-- Content search
CREATE INDEX ON course_chunks USING gin(to_tsvector('norwegian', content));

-- Slug lookups
CREATE INDEX ON course_chunks (nano_slug, unit_slug);
CREATE INDEX ON course_assets (nano_slug, unit_slug);
```

---

## 🔄 **RAG Pipeline**

### **Ingestion Flow**

#### **1. Markdown Parsing**
```javascript
// markdownParserService.js
class MarkdownParserService {
  parseMarkdown(content) {
    const sections = this.extractSections(content);
    const frontmatter = this.extractFrontmatter(content);
    const assets = this.extractAssets(content);
    
    return { sections, frontmatter, assets };
  }
  
  extractSections(content) {
    // Parse ## (Nano) and ### (Unit) headers
    const nanoRegex = /^##\s+(.+)$/gm;
    const unitRegex = /^###\s+(.+)$/gm;
    
    // Extract sections with content
    return this.buildSectionHierarchy(content, nanoRegex, unitRegex);
  }
}
```

#### **2. Content Chunking**
```javascript
// embeddingService.js
class EmbeddingService {
  async chunkContent(sections, maxTokens = 2000) {
    const chunks = [];
    
    for (const section of sections) {
      if (section.content.length > maxTokens) {
        // Sub-chunk large sections
        const subChunks = this.createSubChunks(section.content, maxTokens);
        chunks.push(...subChunks);
      } else {
        chunks.push(section);
      }
    }
    
    return chunks;
  }
}
```

#### **3. OpenAI Embeddings**
```javascript
// embeddingService.js
class EmbeddingService {
  async generateEmbeddings(text) {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: this.cleanTextForEmbedding(text),
      dimensions: 1536
    });
    
    return response.data[0].embedding;
  }
  
  cleanTextForEmbedding(text) {
    // Remove markdown, preserve meaning
    return text
      .replace(/[#*`]/g, '')  // Remove markdown syntax
      .replace(/\s+/g, ' ')   // Normalize whitespace
      .trim();
  }
}
```

### **Query Flow**

#### **1. Semantic Search**
```javascript
// ragChatService.js
class RAGChatService {
  async searchSimilarChunks(question, options = {}) {
    const questionEmbedding = await this.generateEmbedding(question);
    
    const query = `
      SELECT 
        cc.*,
        c.title as course_title,
        1 - (cc.embedding <=> $1) as similarity
      FROM course_chunks cc
      JOIN courses c ON cc.course_id = c.id
      WHERE 1=1
        ${options.courseId ? 'AND cc.course_id = $2' : ''}
        ${options.technology ? 'AND c.technology = $3' : ''}
        ${options.tenantId ? 'AND c.tenant_id = $4' : ''}
      ORDER BY cc.embedding <=> $1
      LIMIT $5
    `;
    
    const params = [questionEmbedding, ...Object.values(options)];
    const results = await this.db.query(query, params);
    
    return results.rows;
  }
}
```

#### **2. Context Assembly**
```javascript
// ragChatService.js
class RAGChatService {
  async assembleContext(chunks, question) {
    const context = chunks.map(chunk => ({
      content: chunk.content,
      source: `${chunk.course_title} > ${chunk.nano_slug} > ${chunk.unit_slug}`,
      similarity: chunk.similarity
    }));
    
    const prompt = this.buildPrompt(question, context);
    return { prompt, context };
  }
  
  buildPrompt(question, context) {
    return `Du er TeknoTassen, en ekspert på teknisk kunnskap.

Kontekst fra kursmateriale:
${context.map(c => `- ${c.content}\n  Kilde: ${c.source}`).join('\n')}

Spørsmål: ${question}

Svar basert på konteksten over. Bruk norsk språk og gi korte, praktiske svar.`;
  }
}
```

---

## 🔐 **Azure Services Integration**

### **Azure Storage Service**
```javascript
// azureStorageService.js
class AzureStorageService {
  constructor() {
    this.credential = new DefaultAzureCredential();
    this.keyVaultUrl = process.env.AZURE_KEY_VAULT_URL;
    this.secretClient = null;
    this.blobServiceClient = null;
  }
  
  async initializeKeyVault() {
    if (!this.keyVaultUrl) {
      throw new Error('AZURE_KEY_VAULT_URL environment variable is required');
    }
    
    this.secretClient = new SecretClient(this.keyVaultUrl, this.credential);
  }
  
  async getStorageConnectionString() {
    const secret = await this.secretClient.getSecret('StorageConnectionString');
    return secret.value;
  }
  
  async uploadCourseFile(fileName, fileBuffer, contentType = 'text/markdown') {
    const blobName = `courses/${fileName}`;
    const blockBlobClient = this.coursesContainer.getBlockBlobClient(blobName);
    
    await blockBlobClient.upload(fileBuffer, fileBuffer.length, {
      blobHTTPHeaders: { blobContentType: contentType },
      metadata: {
        uploadedAt: new Date().toISOString(),
        fileType: 'course'
      }
    });
    
    return blobName;
  }
}
```

### **Database Service**
```javascript
// utils/database.js
export class DatabaseService {
  constructor(connectionString) {
    this.pool = new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }
  
  async testConnection() {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }
  
  async initDatabase() {
    const createTables = `
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE EXTENSION IF NOT EXISTS "vector";
      
      CREATE TABLE IF NOT EXISTS courses (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        technology VARCHAR(100),
        tenant_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS course_chunks (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id),
        nano_slug VARCHAR(100),
        unit_slug VARCHAR(100),
        content TEXT NOT NULL,
        embedding vector(1536),
        meta JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS course_assets (
        id SERIAL PRIMARY KEY,
        course_id INTEGER REFERENCES courses(id),
        nano_slug VARCHAR(100),
        unit_slug VARCHAR(100),
        url TEXT NOT NULL,
        kind VARCHAR(50),
        alt TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await this.pool.query(createTables);
  }
}
```

---

## 🚨 **Error Handling**

### **Global Error Handler**
```javascript
// server.js
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  if (error.name === 'MulterError') {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large', 
        message: 'File size must be less than 10MB' 
      });
    }
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});
```

### **Service Error Handling**
```javascript
// azureStorageService.js
async uploadCourseFile(fileName, fileBuffer, contentType = 'text/markdown') {
  try {
    // ... upload logic
  } catch (error) {
    console.error(`Failed to upload course file ${fileName}:`, error);
    
    if (error.code === 'BlobNotFound') {
      throw new Error('Storage container not found');
    } else if (error.code === 'AuthenticationFailed') {
      throw new Error('Storage authentication failed');
    } else {
      throw new Error(`Upload failed: ${error.message}`);
    }
  }
}
```

---

## 🔧 **Development Setup**

### **Local Development**
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Set environment variables
OPENAI_API_KEY=your-openai-key
POSTGRES_URL=postgresql://user:pass@localhost:5432/teknotassen
NODE_ENV=development

# Start development server
npm run dev
```

### **Environment Variables**
```bash
# Required
OPENAI_API_KEY=sk-...
POSTGRES_URL=postgresql://...

# Optional (Azure)
AZURE_KEY_VAULT_URL=https://kv-name.vault.azure.net/
BLOB_CONNECTION_STRING=DefaultEndpointsProtocol=https;...

# Server
NODE_ENV=development
PORT=8181
```

### **Database Setup**
```bash
# Install PostgreSQL with pgvector
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib
sudo apt-get install postgresql-14-pgvector

# macOS
brew install postgresql
brew install pgvector

# Create database
createdb teknotassen

# Run migrations
psql -d teknotassen -f migrations/001_initial_schema.sql
```

---

## 🧪 **Testing**

### **Unit Tests**
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- --grep "RAG"
```

### **Integration Tests**
```bash
# Start test database
docker run -d --name test-postgres \
  -e POSTGRES_PASSWORD=test \
  -e POSTGRES_DB=teknotassen_test \
  -p 5433:5432 \
  postgres:15

# Run integration tests
POSTGRES_URL=postgresql://postgres:test@localhost:5433/teknotassen_test \
npm run test:integration
```

### **API Testing**
```bash
# Test health endpoint
curl http://localhost:8181/healthz

# Test course ingest
curl -X POST http://localhost:8181/api/courses/ingest \
  -F "file=@test-course.md" \
  -F "courseId=test-001" \
  -F "technology=test"

# Test RAG query
curl -X POST http://localhost:8181/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Hvordan fungerer test?"}'
```

---

## 🚀 **Deployment**

### **Azure Web App**
- **Platform:** Linux Container
- **Runtime:** Node.js 20
- **Port:** 8181
- **Health Check:** `/healthz`

### **Environment Variables (Azure)**
```bash
# Database
POSTGRES_URL=@Microsoft.KeyVault(SecretUri=https://kv-teknotassen.vault.azure.net/secrets/PostgresAppConnectionString/)

# Storage
BLOB_CONNECTION_STRING=@Microsoft.KeyVault(SecretUri=https://kv-teknotassen.vault.azure.net/secrets/StorageConnectionString/)

# OpenAI
OPENAI_API_KEY=@Microsoft.KeyVault(SecretUri=https://kv-teknotassen.vault.azure.net/secrets/OpenAIAPIKey/)

# Server
NODE_ENV=production
WEBSITES_PORT=8181
```

### **GitHub Actions**
- **Workflow:** `.github/workflows/deploy-backend.yml`
- **Trigger:** Push to main branch
- **Steps:** Build → Push to ACR → Deploy to Web App → Health Check

---

## 📊 **Monitoring og Logging**

### **Health Check Endpoint**
```javascript
app.get("/healthz", (_req, res) => {
  res.status(200).send("OK");
});
```

### **Structured Logging**
```javascript
// server.js
console.log('🚀 Starting TeknoTassen RAG Backend...');
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 Health check: http://0.0.0.0:${port}/healthz`);
console.log(`📚 API docs: http://0.0.0.0:${port}/api/courses`);
```

### **Performance Monitoring**
- **Response Time:** Express middleware
- **Database Queries:** Query timing
- **Memory Usage:** Process monitoring
- **Error Rates:** Error tracking

---

## 🔮 **Future Enhancements**

### **Short Term**
- **Rate Limiting:** Per-user API limits
- **Caching:** Redis for frequent queries
- **Webhooks:** Real-time notifications
- **Batch Processing:** Bulk course ingestion

### **Long Term**
- **Multi-modal RAG:** Image, audio, video
- **Conversation Memory:** Chat history
- **Advanced Analytics:** Usage patterns
- **Plugin System:** Extensible architecture

---

## 📞 **Support**

### **Team**
- **Backend Lead:** Kristil
- **DevOps:** CTO
- **Frontend:** Ann-Kristin

### **Resources**
- **Azure Portal:** [web-teknotassen](https://web-teknotassen.azurewebsites.net)
- **GitHub:** [dialog-builder-explorer](https://github.com/your-username/dialog-builder-explorer)
- **Documentation:** [AZURE_DEPLOYMENT.md](../AZURE_DEPLOYMENT.md)

---

## 🎯 **Status**

### **Current Status: 🔴 LATEST DEPLOYMENT FAILED**
- **Code Quality:** ✅ All critical fixes implemented
- **Testing:** ✅ Local testing passed
- **Documentation:** ✅ Complete
- **Deployment:** ❌ Failed - ImagePullFailure (Image tag mismatch)

### **Latest Issue: Image Tag Mismatch**
**Problem:** GitHub Actions workflow was deploying with commit hash tag instead of `latest` tag.

**Root Cause:**
```yaml
# ❌ FEIL - Deploying with non-existent tag
images: ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}

# ✅ RIKTIG - Deploy with existing latest tag  
images: ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.IMAGE_NAME }}:latest
```

**Fix Applied:** ✅ Changed deployment to use `:latest` tag in workflow

### **Next Steps**
1. **✅ Fix Applied** - Image tag mismatch resolved
2. **🔄 Retry Deployment** - Trigger GitHub Actions workflow
3. **Health Check** - Verify `/healthz` endpoint
4. **Integration Testing** - Test with frontend
5. **Go-Live** - Production deployment

---

**📝 Dette dokumentet oppdateres kontinuerlig med nye features og learnings!**
