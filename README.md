# 🚀 TeknoTassen - Velferdsteknologi AI-Assistent

## 📋 Prosjektinfo

**TeknoTassen** er en intelligent AI-assistent som hjelper helsepersonell, prosjektledere og administratorer med å implementere velferdsteknologi i kommunal omsorg.

**Live Demo**: [TeknoTassen App](https://lovable.dev/projects/5b930ef5-a6a4-44b2-8bb3-c37d9e5df2c3)

## 🌟 Funksjoner

### 🔐 **Autentisering & Roller**

- **Magic Link Login** - Sikker innlogging uten passord
- **Rollebasert tilgang** - helsepersonell, prosjektleder, admin
- **Brukeradministrasjon** - Admin dashboard for brukerstyring

### 📋 **Sjekkliste & Fremdrift**

- **Helhetlig tjenestemodell** - Strukturert implementeringsprosess
- **Fremdriftssporing** - Individuell progresjon for hver bruker
- **Dynamiske AI-prompts** - Tilpasset basert på rolle og fremdrift

### 🤖 **AI-Chat med TeknoTassen**

- **Kontekstbevisst** - Forstår brukerens rolle og fremdrift
- **Velferdsteknologi-ekspert** - Spesialiserte kunnskaper
- **Lokal testing** - Fungerer offline med mock backend

### 🏗️ **Infrastruktur**

- **Azure Bicep** - Komplett infrastruktur som kode
- **PostgreSQL** - Skalerbar database
- **Container Apps** - Moderne backend hosting
- **Static Web Apps** - Frontend hosting

## 🛠️ Teknologier

### **Frontend**

- **React 18** - Moderne UI-bibliotek
- **TypeScript** - Type-sikker utvikling
- **Vite** - Rask build tool
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Moderne komponenter

### **Backend**

- **Node.js** - Server-side JavaScript
- **Express.js** - Web framework
- **Supabase** - Backend-as-a-Service
- **OpenAI API** - AI-chat funksjonalitet

### **Infrastruktur**

- **Azure Bicep** - Infrastructure as Code
- **Azure PostgreSQL** - Managed database
- **Azure Container Apps** - Serverless containers
- **Azure Key Vault** - Sikker secrets management

## 🚀 Kom i gang

### **Forutsetninger**

- **Node.js 18+** - [Last ned her](https://nodejs.org/)
- **npm** eller **yarn** - Pakkehåndtering
- **Git** - Versjonskontroll

### **Installasjon**

```bash
# 1. Klone repository
git clone https://github.com/Ann-Kristin72/dialog-builder-explorer.git
cd dialog-builder-explorer

# 2. Installer avhengigheter
npm install

# 3. Start utviklingsserver
npm run dev
```

### **Lokal Testing Setup**

```bash
# 1. Start backend server
cd backend
npm install
npm run dev

# 2. I ny terminal - start frontend
npm run dev

# 3. Åpne http://localhost:5173
```

### **Miljøvariabler**

Opprett `.env` fil i `backend/` mappen:

```bash
# OpenAI API Key
OPENAI_API_KEY=din-openai-api-nøkkel-her

# Server konfigurasjon
PORT=3001
NODE_ENV=development
```

## 🔧 Utvikling

### **Tilgjengelige Scripts**

```bash
npm run dev          # Start utviklingsserver
npm run build        # Bygg for produksjon
npm run preview      # Forhåndsvis produksjonsbuild
npm run lint         # Kjør ESLint
```

### **Prosjektstruktur**

```
src/
├── components/      # React komponenter
│   ├── ChatInterface.tsx
│   ├── ChecklistProgress.tsx
│   ├── Header.tsx
│   ├── Login.tsx
│   ├── RoleGate.tsx
│   └── AdminDashboard.tsx
├── contexts/        # React Context (Auth)
│   └── AuthContext.tsx
├── pages/          # Side-komponenter
│   └── Index.tsx
├── utils/          # Hjelpefunksjoner
│   └── chatPromptBuilder.ts
└── integrations/   # Eksterne tjenester
    └── supabase/
        └── client.ts

backend/             # Lokal testing server
├── server.js        # Express server
├── package.json     # Backend avhengigheter
└── config.js        # Server konfigurasjon

infra/               # Azure Bicep infrastruktur
├── main.bicep       # Hovedmodul
├── postgresql.bicep # Database
├── keyVault.bicep   # Secrets management
└── ...              # Andre Azure ressurser
```

## 🚀 Deployment

### **Lokal Testing**

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`
- Mock data og autentisering

### **Produksjon (Azure)**

```bash
# Deploy infrastruktur
cd infra
az deployment group create --template-file main.bicep --parameters parameters.json

# Deploy backend
az containerapp update --name teknotassen-backend --resource-group rg-teknotassen

# Deploy frontend
az staticwebapp update --name teknotassen-frontend --resource-group rg-teknotassen
```

### **Lovable Platform**

- Åpne [Lovable Project](https://lovable.dev/projects/5b930ef5-a6a4-44b2-8bb3-c37d9e5df2c3)
- Klikk Share → Publish for live demo

## 📚 Dokumentasjon

- **ARCHITECTURE.md** - Systemarkitektur og design
- **README-LOCAL-TESTING.md** - Detaljerte instruksjoner for lokal testing
- **OPENAI-SETUP.md** - Konfigurering av OpenAI API
- **database-schema.sql** - Database struktur og RLS policies

## 🤝 Bidrag

1. **Fork** repository
2. **Opprett feature branch**: `git checkout -b feature/ny-funksjon`
3. **Commit endringer**: `git commit -m 'feat: legg til ny funksjon'`
4. **Push til branch**: `git push origin feature/ny-funksjon`
5. **Opprett Pull Request**

## 📄 Lisens

Dette prosjektet er lisensiert under MIT License.

## 🛡️ Sikkerhet & Beste Praksis

### **Miljøvariabler**

- **ALDRIG committ .env filer** til Git
- **Bruk .gitignore** for å ekskludere sensitive filer
- **Azure Key Vault** for produksjonssecrets

### **Git Beste Praksis**

- **Ikke force push** til main branch
- **Bruk feature branches** for nye funksjoner
- **Sjekk .gitignore** før hver commit

### **API Keys**

- **OpenAI API Key** - Kun i backend .env
- **Supabase Keys** - Miljøvariabler
- **Azure Credentials** - Managed Identity

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Ann-Kristin72/dialog-builder-explorer/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Ann-Kristin72/dialog-builder-explorer/discussions)
- **Live Demo**: [TeknoTassen App](https://lovable.dev/projects/5b930ef5-a6a4-44b2-8bb3-c37d9e5df2c3)

## 🎯 Status

**✅ Komplett implementasjon** - Alle hovedfunksjoner implementert
**✅ Lokal testing** - Fungerer offline med mock backend
**✅ Azure infrastruktur** - Bicep templates klar for produksjon
**✅ Sikkerhet** - Ingen sensitive filer i repository
**✅ Dokumentasjon** - Omfattende README og instruksjoner
