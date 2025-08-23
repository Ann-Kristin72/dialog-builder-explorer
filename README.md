# 🚀 TEKNOTASSEN - DIALOG BUILDER EXPLORER

## 📋 **OPPSUMMERING**
TeknoTassen er en intelligent chatbot-applikasjon bygget med React, TypeScript og moderne web-teknologier. Applikasjonen integrerer Azure AD B2C for sikker autentisering og bruker avansert AI for å hjelpe brukere med ulike oppgaver.

---

## 🔐 **AZURE AD B2C INTEGRASJON STATUS**

### **✅ IMPLEMENTERT:**
- **MSAL Browser** - Robust Azure AD B2C autentisering
- **AuthBootstrap Pattern** - Automatisk login når ingen konto
- **Design System** - Moderne UI med CSS variabler
- **Backend Integration** - Live Azure backend med health checks

### **🚨 GJENVÆRENDE PROBLEM:**
**Console loggene viser fortsatt gammel kode:**
```
🔐 Azure AD B2C mode enabled - using MSAL authentication
🔑 Client ID: dceaf456-f134-409c-b63e-e6eca59677ab
🌐 Authority: B2C_1_B2C_1A_
✅ MSAL initialized successfully
[MSAL] handleRedirectPromise called but there is no interaction in progress, returning null.
🔍 No existing accounts found
```

**Ingen av de nye loggene fra CTO's AuthBootstrap vises - tyder på deployment problem.**

### **📋 NESTE STEG:**
1. **Verifiser Vercel deploy status**
2. **Sjekk om AuthBootstrap logging vises**
3. **Test Azure AD B2C login flow**
4. **Debug callback handling**

---

## 🛠️ **TEKNOLOGISTACK**

### **Frontend:**
- **React 18** med TypeScript
- **Vite** for build tooling
- **Tailwind CSS** med custom design system
- **shadcn/ui** komponenter
- **MSAL Browser** for Azure AD B2C

### **Backend:**
- **Node.js** med Express.js
- **LangChain** for AI/ML
- **OpenAI** integrasjon
- **PostgreSQL** med pgvector
- **Azure Blob Storage**

### **Deployment:**
- **Vercel** (Frontend)
- **Azure Web App for Containers** (Backend)
- **GitHub Actions** for CI/CD
- **Docker** containerisering

---

## 🚀 **RASK START**

### **Forutsetninger:**
- Node.js 18+
- npm eller yarn
- Azure AD B2C tenant
- Vercel konto

### **Installasjon:**
```bash
# Klone repository
git clone https://github.com/Ann-Kristin72/dialog-builder-explorer.git
cd dialog-builder-explorer

# Installer dependencies
npm install

# Kopier environment variables
cp env.example .env.local

# Start utviklingsserver
npm run dev
```

### **Environment Variables:**
```bash
# Azure AD B2C
VITE_OIDC_CLIENT_ID=your-azure-b2c-client-id
VITE_OIDC_AUTHORITY=https://teknotassenb2c.b2clogin.com/teknotassenb2c.onmicrosoft.com/B2C_1_B2C_1A_
VITE_REDIRECT_URI=https://your-vercel-url.vercel.app

# Backend API
VITE_API_URL=https://your-azure-backend-url
```

---

## 🔍 **TROUBLESHOOTING**

### **Vanlige Problemer:**
1. **Infinite Spinner** - Ready state settes aldri til true
2. **Demo Mode Fallback** - Race condition mellom MSAL og demo
3. **Callback Ignored** - Hash vs query params mismatch
4. **API Failures** - "Failed to fetch" uten autentisering

### **Løsninger:**
- **Hard refresh** siden (Ctrl+F5)
- **Sjekk Vercel deploy status**
- **Verifiser environment variables**
- **Se troubleshooting guide**

---

## 📚 **DOKUMENTASJON**

### **Teknisk Dokumentasjon:**
- **[AZURE_AD_B2C_INTEGRATION.md](./AZURE_AD_B2C_INTEGRATION.md)** - Komplett Azure AD B2C implementasjon
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Debugging guide
- **[AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md)** - Backend deployment
- **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** - Frontend deployment

### **Azure Konfigurasjon:**
- **App Registration** - Redirect URIs og scopes
- **User Flows** - Sign-up/sign-in policies
- **B2C Tenant** - Domain og policy navn

---

## 🎯 **FUNKSJONALITET**

### **Hovedfunksjoner:**
- **Intelligent Chatbot** - AI-drevet samtale
- **Dokument Håndtering** - Upload og analyse
- **Kurs Management** - Strukturert læring
- **Azure AD B2C** - Sikker autentisering
- **Responsivt Design** - Mobil og desktop

### **AI Capabilities:**
- **Natural Language Processing**
- **Document Analysis**
- **Contextual Responses**
- **Learning & Adaptation**

---

## 🤝 **BIDRAG**

### **Utvikling:**
1. Fork repository
2. Opprett feature branch
3. Commit endringer
4. Push til branch
5. Opprett Pull Request

### **Rapportering av Bugs:**
- Bruk GitHub Issues
- Inkluder console logging
- Beskriv problemet detaljert
- Legg til screenshots hvis relevant

---

## 📄 **LISENS**

Dette prosjektet er lisensiert under MIT License - se [LICENSE](LICENSE) filen for detaljer.

---

## 📞 **KONTAKT**

- **Prosjekt:** TeknoTassen Dialog Builder Explorer
- **Repository:** [GitHub](https://github.com/Ann-Kristin72/dialog-builder-explorer)
- **Status:** Azure AD B2C implementert, deployment problem

---

*Sist oppdatert: 23. august 2025*
*Azure AD B2C Status: Implementert, men deployment problem*
