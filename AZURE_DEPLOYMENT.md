# 🚀 **TEKNOTASSEN - KOMPLETT TEKNISK DOKUMENTASJON**

## 📋 **PROSJEKT OVERSIKT**

**TeknoTassen** er en RAG-drevet AI-assistent for teknisk kunnskap, bygget med moderne teknologi-stack:

- **Frontend:** React + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Node.js + Express.js + LangChain + OpenAI + pgvector
- **Database:** Azure PostgreSQL med pgvector extension
- **Storage:** Azure Blob Storage
- **Authentication:** Azure AD B2C (OIDC)
- **Deployment:** Azure Web App (Backend) + Vercel (Frontend)

---

## 🏗️ **ARKITEKTUR OG KODE STRUKTUR**

### **Frontend Struktur (`src/`)**
```
src/
├── components/           # UI komponenter
│   ├── ui/              # shadcn/ui komponenter
│   ├── ChatInterface.tsx # Hovedchat UI
│   ├── DocumentUpload.tsx # Kurs opplasting
│   ├── FeatureCard.tsx  # Funksjoner oversikt
│   ├── Login.tsx        # Azure B2C login
│   ├── AulaNotice.tsx   # Privacy notice
│   └── Header.tsx       # Navigasjon
├── pages/               # Side komponenter
│   ├── Index.tsx        # Hovedside
│   ├── NotFound.tsx     # 404 side
│   └── Aula.tsx         # Privacy policy
├── hooks/               # Custom React hooks
├── integrations/        # Eksterne tjenester
│   └── supabase/        # Supabase klient
├── lib/                 # Utility funksjoner
└── assets/              # Bilder og media
```

### **Backend Struktur (`backend/src/`)**
```
backend/src/
├── routes/              # API endpoints
│   ├── courses.js       # Kurs API (ingest, query)
│   └── ttsStt.js        # Text-to-Speech & Speech-to-Text
├── services/            # Business logic
│   ├── azureStorageService.js    # Azure Blob & Key Vault
│   ├── embeddingService.js       # OpenAI embeddings
│   ├── markdownParserService.js  # Markdown parsing
│   ├── ragChatService.js         # RAG chat logic
│   └── ttsSttService.js          # TTS/STT services
├── utils/               # Utility funksjoner
│   └── database.js      # PostgreSQL + pgvector
└── server.js            # Express server entry point
```

---

## 🔧 **KRITISKE KODE FIXES IMPLEMENTERT**

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

## 🐙 **GIT SETUP OG WORKFLOW**

### **Repository Struktur**
```
dialog-builder-explorer/
├── .github/
│   └── workflows/
│       └── deploy-backend.yml    # Azure deployment pipeline
├── backend/                       # Node.js backend
├── src/                          # React frontend
├── public/                       # Static assets
├── vercel.json                   # Vercel config
└── package.json                  # Frontend dependencies
```

### **Git Branch Strategy**
- **`main`** - Production branch (automatic deployment)
- **`feature/*`** - Feature development branches
- **`hotfix/*`** - Critical bug fixes

### **Git History Cleanup (Gjennomført)**
**Problem:** API keys i git historikk
```bash
# Fjernet sensitive filer fra historikk
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch src/pages/Index.tsx src/components/ChatInterface.tsx' \
  --prune-empty --tag-name-filter cat -- --all

# Force push til remote
git push origin main --force
```

### **Git Secrets Management**
- **GitHub Secrets** for Azure deployment
- **OIDC Authentication** (ingen passord i kode)
- **Federated Credentials** for GitHub Actions

---

## 🚀 **AZURE DEPLOYMENT PIPELINE**

### **GitHub Actions Workflow (`.github/workflows/deploy-backend.yml`)**

#### **1. Authentication & Setup**
```yaml
- name: Azure Login
  uses: azure/login@v1
  with:
    client-id: ${{ secrets.AZURE_CLIENT_ID }}
    tenant-id: ${{ secrets.AZURE_TENANT_ID }}
    subscription-id: ${{ secrets.AZURE_SUBSCRIPTION_ID }}
```

#### **2. Container Registry (ACR)**
```yaml
- name: Create ACR if not exists
  run: |
    az acr create --name $AZURE_CONTAINER_REGISTRY \
      --resource-group $AZURE_RESOURCE_GROUP \
      --sku Basic --admin-enabled true

- name: Enable ACR admin user
  run: |
    az acr update --name $AZURE_CONTAINER_REGISTRY --admin-enabled true
```

#### **3. Docker Build & Push**
```yaml
- name: Get ACR credentials
  run: |
    ACR_USERNAME=$(az acr credential show --name $AZURE_CONTAINER_REGISTRY --query "username" -o tsv)
    ACR_PASSWORD=$(az acr credential show --name $AZURE_CONTAINER_REGISTRY --query "passwords[0].value" -o tsv)
    echo "ACR_USERNAME=$ACR_USERNAME" >> $GITHUB_ENV
    echo "ACR_PASSWORD=$ACR_PASSWORD" >> $GITHUB_ENV

- name: Login to ACR
  uses: azure/docker-login@v1
  with:
    login-server: ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io
    username: ${{ env.ACR_USERNAME }}
    password: ${{ env.ACR_PASSWORD }}

- name: Build and Push Docker image
  run: |
    docker build -f backend/Dockerfile -t $AZURE_CONTAINER_REGISTRY.azurecr.io/$IMAGE_NAME:${{ github.sha }} .
    docker tag $AZURE_CONTAINER_REGISTRY.azurecr.io/$IMAGE_NAME:${{ github.sha }} $AZURE_CONTAINER_REGISTRY.azurecr.io/$IMAGE_NAME:latest
    docker push $AZURE_CONTAINER_REGISTRY.azurecr.io/$IMAGE_NAME:${{ github.sha }}
    docker push $AZURE_CONTAINER_REGISTRY.azurecr.io/$IMAGE_NAME:latest
```

#### **4. Azure Web App Deployment**
```yaml
- name: Deploy to Azure Web App
  uses: azure/webapps-deploy@v2
  with:
    app-name: ${{ env.AZURE_WEBAPP_NAME }}
    slot-name: 'production'
    publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
    images: ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.IMAGE_NAME }}:latest
```

#### **5. Health Check & Verification**
```yaml
- name: Resolve Web App hostname
  id: resolve-host
  run: |
    HOSTNAME=$(az webapp show \
      --resource-group "${{ env.AZURE_RESOURCE_GROUP }}" \
      --name "${{ env.AZURE_WEBAPP_NAME }}" \
      --query defaultHostName -o tsv)
    echo "HOSTNAME=$HOSTNAME" >> $GITHUB_ENV

- name: Wait for /healthz
  run: |
    for i in {1..30}; do
      if curl -fsS --max-time 10 "https://${HOSTNAME}/healthz" > /dev/null; then
        echo "✅ Healthy at https://${HOSTNAME}/healthz"
        exit 0
      fi
      echo "🔄 Attempt $i/30 … not ready yet"; sleep 10
    done
    echo "❌ App never became healthy"; exit 1
```

### **Required GitHub Secrets**
```yaml
AZURE_CLIENT_ID: "teknotassen-github-ci app ID"
AZURE_TENANT_ID: "Azure tenant ID"
AZURE_SUBSCRIPTION_ID: "Azure subscription ID"
AZURE_PUBLISH_PROFILE: "Web App publish profile"
```

---

## 🐳 **DOCKER KONFIGURASJON**

### **Backend Dockerfile (`backend/Dockerfile`)**
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

### **Docker Build Context**
- **Working Directory:** Repository root
- **Dockerfile Path:** `backend/Dockerfile`
- **Build Context:** `.` (includes all files)

### **Port Configuration**
- **Container Port:** 8181 (matching Azure Web App)
- **Azure Setting:** `WEBSITES_PORT=8181`
- **Binding:** `0.0.0.0:8181` (all interfaces)

---

## 🌐 **VERCEL FRONTEND DEPLOYMENT**

### **Vercel Configuration (`vercel.json`)**
```json
{
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "dist",
  "framework": "vite",
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        }
      ]
    }
  ]
}
```

### **Build Scripts (`package.json`)**
```json
{
  "scripts": {
    "build:vercel": "vite build",
    "vercel-build": "vite build",
    "vercel-dev": "vite dev"
  }
}
```

### **Environment Variables for Vercel**
```bash
# Frontend environment variables
NEXT_PUBLIC_OIDC_AUTHORITY=https://teknotassen.b2clogin.com/teknotassen.onmicrosoft.com/B2C_1_signupsignin
NEXT_PUBLIC_OIDC_CLIENT_ID=your-client-id
NEXT_PUBLIC_OIDC_TENANT_ID=teknotassen.onmicrosoft.com
NEXT_PUBLIC_OIDC_POLICY=B2C_1_signupsignin
NEXT_PUBLIC_REDIRECT_URI=https://teknotassen.vercel.app/auth/callback
NEXT_PUBLIC_BACKEND_URL=https://web-teknotassen.azurewebsites.net
```

### **CORS Configuration**
- **Backend CORS:** Konfigurert for Vercel domain
- **API Calls:** Alle `/api/*` endpoints tillatt
- **Credentials:** `true` for authentication

---

## 🔐 **AZURE INFRASTRUKTUR SETUP**

### **Resource Group: `teknotassen-rg`**
- **Location:** Norway East
- **Subscription:** TeknoTassen subscription

### **Azure Services**
1. **Azure Container Registry (`acrteknotassen`)**
   - SKU: Basic
   - Admin user: Enabled
   - Access: Managed Identity + RBAC

2. **Azure Web App (`web-teknotassen`)**
   - Platform: Linux
   - Runtime: Container
   - Plan: App Service Plan (B1)
   - Port: 8181

3. **Azure PostgreSQL (`pg-teknotassen`)**
   - Server: `pg-teknotassen.postgres.database.azure.com`
   - Database: `teknotassen`
   - Extensions: `pgcrypto`, `vector`

4. **Azure Key Vault (`kv-teknotassen`)**
   - Secrets: Connection strings, API keys
   - Access: Managed Identity + RBAC

5. **Azure Storage (`stteknotassen01`)**
   - Containers: `courses`, `branding`
   - Access: Managed Identity + RBAC

### **Managed Identity Setup**
```bash
# Web App Managed Identity
az webapp identity assign \
  --name web-teknotassen \
  --resource-group teknotassen-rg

# Grant Key Vault access
az keyvault set-policy \
  --name kv-teknotassen \
  --object-id <web-app-managed-identity-id> \
  --secret-permissions get list

# Grant Storage access
az role assignment create \
  --assignee <web-app-managed-identity-id> \
  --role "Storage Blob Data Contributor" \
  --scope /subscriptions/<subscription-id>/resourceGroups/teknotassen-rg/providers/Microsoft.Storage/storageAccounts/stteknotassen01
```

---

## 📊 **DATABASE SCHEMA**

### **Core Tables**
```sql
-- Courses table
CREATE TABLE courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  technology VARCHAR(100),
  tenant_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course chunks with embeddings
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

-- Course assets (images, audio)
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

## 🔄 **RAG PIPELINE**

### **Ingestion Flow**
1. **Markdown Upload** → `POST /api/courses/ingest`
2. **Parsing** → Nano (`##`) og Unit (`###`) struktur
3. **Chunking** → 1 Unit per chunk (max 2000 tokens)
4. **Embedding** → OpenAI `text-embedding-3-small` (1536d)
5. **Storage** → PostgreSQL + pgvector

### **Query Flow**
1. **User Question** → `POST /api/query`
2. **Semantic Search** → Vector similarity i pgvector
3. **Filtering** → Course ID, technology, tenant, roles
4. **Context Retrieval** → Top-k relevant chunks
5. **Response Generation** → OpenAI GPT-4 + context

### **API Endpoints**
```javascript
// Course ingestion
POST /api/courses/ingest
Content-Type: multipart/form-data
Body: { file: File, courseId: string, technology: string }

// RAG query
POST /api/query
Content-Type: application/json
Body: { 
  question: string, 
  courseId?: string, 
  technology?: string,
  tenantId?: string 
}
```

---

## 🚨 **TROUBLESHOOTING GUIDE**

### **Common Deployment Issues**

#### **1. ImagePullFailure**
**Symptom:** Container can't pull image from ACR
**Solution:** 
- Verify ACR exists and image is pushed
- Check Web App has `AcrPull` role
- Use `latest` tag instead of commit hash

#### **2. Port Mismatch**
**Symptom:** Health check fails, container not responding
**Solution:**
- Ensure `PORT=8181` in Dockerfile
- Set `WEBSITES_PORT=8181` in Azure
- Bind to `0.0.0.0:8181`

#### **3. Import Errors**
**Symptom:** Container starts but app crashes
**Solution:**
- All imports must be at top of file
- Check for circular dependencies
- Verify module paths

#### **4. Environment Variables**
**Symptom:** Azure services fail to initialize
**Solution:**
- Check Azure App Settings
- Verify Key Vault access
- Use Managed Identity

### **Debug Commands**
```bash
# Check container logs
az webapp log tail --name web-teknotassen --resource-group teknotassen-rg

# Verify container config
az webapp config container show --name web-teknotassen --resource-group teknotassen-rg

# Test health endpoint
curl -f https://web-teknotassen.azurewebsites.net/healthz

# Check environment variables
az webapp config appsettings list --name web-teknotassen --resource-group teknotassen-rg
```

---

## 📈 **NEXT STEPS**

### **Immediate Actions**
1. **✅ Backend Deployment** - All fixes implemented
2. **🚀 Frontend Deployment** - Ready for Vercel
3. **🔐 Authentication** - Azure B2C setup
4. **📊 Database** - Schema ready, migrations needed

### **Future Enhancements**
1. **TTS/STT Integration** - ElevenLabs/Deepgram
2. **Advanced RAG** - Multi-modal, conversation memory
3. **Analytics** - User behavior, course effectiveness
4. **Mobile App** - React Native implementation

---

## 📞 **SUPPORT OG KONTAKT**

### **Team Members**
- **Kristil** - Backend development, Azure infrastructure
- **Ann-Kristin** - Frontend development, project management
- **CTO** - Azure setup, deployment guidance

### **Key Resources**
- **Azure Portal:** https://portal.azure.com
- **GitHub Repository:** dialog-builder-explorer
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Azure Web App:** https://web-teknotassen.azurewebsites.net

---

## 🎯 **DEPLOYMENT STATUS**

### **Backend (Azure Web App)**
- **Status:** 🔴 **LATEST DEPLOYMENT FAILED** - ImagePullFailure issue identified
- **Issues Fixed:** ✅ Import order, ✅ Azure services robustness, ✅ Port configuration
- **Current Problem:** 🚨 Image tag mismatch in deployment action
- **Next:** Fix image tag in GitHub Actions workflow

### **Frontend (Vercel)**
- **Status:** 🟢 Ready for deployment
- **Configuration:** ✅ vercel.json, ✅ Build scripts, ✅ CORS setup
- **Dependency:** Backend must be healthy first

---

## 🚨 **LATEST DEPLOYMENT FAILURE - ImagePullFailure**

### **Problem Identified:**
**Image Tag Mismatch** - GitHub Actions workflow was deploying with commit hash tag instead of `latest` tag.

#### **What Happened:**
1. **✅ Docker Build & Push** - Successfully pushed both `:latest` and `:github.sha` tags
2. **❌ Deployment Action** - Used `:${{ github.sha }}` tag that doesn't exist in ACR
3. **🚨 ImagePullFailure** - Azure Web App couldn't pull the specified image

#### **Root Cause:**
```yaml
# ❌ FEIL - Deploying with non-existent tag
images: ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}

# ✅ RIKTIG - Deploy with existing latest tag  
images: ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.IMAGE_NAME }}:latest
```

### **Fix Applied:**
- **✅ Image Tag Fixed** - Changed deployment to use `:latest` tag
- **✅ Workflow Updated** - All fixes implemented in `.github/workflows/deploy-backend.yml`
- **🔄 Ready for Retry** - Next deployment should succeed

### **Current Status:**
- **Backend Code:** ✅ All critical fixes implemented
- **Docker Image:** ✅ Latest tag available in ACR
- **Workflow:** ✅ Image tag mismatch fixed
- **Next Deployment:** 🟡 Ready to trigger

---

## 🔄 **DEPLOYMENT RETRY INSTRUCTIONS**

### **1. Verify Current Status:**
```bash
# Check if latest image exists in ACR
az acr repository show-tags --name acrteknotassen --repository teknotassen-backend

# Should show: latest, [commit-hash]
```

### **2. Trigger New Deployment:**
- **GitHub Actions** → **Actions** tab
- **Select:** `Deploy Backend to Azure Web App (Container)`
- **Click:** **Run workflow** → **Run workflow**

### **3. Expected Result:**
- **✅ Build Success** - Docker image built and pushed
- **✅ Deploy Success** - Azure Web App updated with latest image
- **✅ Health Check** - `/healthz` endpoint responds with 200
- **✅ Backend Ready** - Ready for frontend integration

---

## 📊 **DEPLOYMENT HISTORY**

### **Attempt 1: Initial Setup**
- **Status:** ❌ Failed - Missing GitHub Secrets
- **Fix:** Added AZURE_CLIENT_ID, AZURE_TENANT_ID, AZURE_SUBSCRIPTION_ID

### **Attempt 2: ACR Access**
- **Status:** ❌ Failed - ACR admin user not enabled
- **Fix:** Added `az acr update --admin-enabled true`

### **Attempt 3: Port Configuration**
- **Status:** ❌ Failed - Port mismatch (container: 8181, Azure: 80)
- **Fix:** Aligned ports to 8181 consistently

### **Attempt 4: Import Errors**
- **Status:** ❌ Failed - Import statements after usage
- **Fix:** Moved all imports to top of file

### **Attempt 5: Azure Services Crash**
- **Status:** ❌ Failed - Services failed without environment variables
- **Fix:** Added graceful fallback in initializeServices()

### **Attempt 6: Image Tag Mismatch**
- **Status:** ❌ Failed - Deploying with non-existent commit hash tag
- **Fix:** Changed deployment to use `:latest` tag

### **Attempt 7: Current**
- **Status:** 🟡 Ready for retry
- **All Fixes:** ✅ Implemented
- **Expected:** ✅ Success

**📝 Dette dokumentet oppdateres kontinuerlig med nye learnings og fixes!**
