# 🚀 **AZURE WEB APP (LINUX) FOR CONTAINERS DEPLOYMENT GUIDE**

## 📋 **OVERSIKT**

Vi bruker **Azure Web App (Linux) for Containers** for backend deployment med Docker images fra Azure Container Registry (ACR).

## 🔧 **HVA VI HAR**

### **✅ Container-basert deployment:**
- ✅ **Dockerfile** - Node.js 20 Alpine image
- ✅ **Azure Container Registry** - for å lagre Docker images
- ✅ **GitHub Actions workflow** - som bygger og pusher til ACR
- ✅ **Port 8181** - som er riktig for Web App

### **✅ Azure Web App (Linux) konfigurasjon:**
- **Stack:** Linux med Docker runtime
- **Container image:** `acrteknotassen.azurecr.io/teknotassen-backend:latest`
- **Port:** 8181 (WEBSITES_PORT setting)
- **Health check:** `/healthz` endpoint

## 🔐 **MILJØVARIABLER (App Settings)**

### **Kreves:**
```bash
WEBSITES_PORT=8181                    # Container port
DOCKER_REGISTRY_SERVER_URL           # ACR server URL
DOCKER_REGISTRY_SERVER_USERNAME      # ACR username
DOCKER_REGISTRY_SERVER_PASSWORD      # ACR password (fra Key Vault)
OPENAI_API_KEY                       # For AI-funksjonalitet
POSTGRES_URL                         # Database-tilkobling
```

### **Valgfritt:**
```bash
AZURE_KEY_VAULT_URL                  # Hvis du bruker Key Vault
BLOB_CONNECTION_STRING               # Hvis du bruker Blob Storage
WEBSITE_HEALTHCHECK_MAXPINGFAILURES # Health check konfigurasjon
```

## 🧹 **AZURE PORTAL OPPRYKDING**

### **1. Deployment Center:**
- **Gå til:** Azure Portal → Web App → `web-teknotassen`
- **Deployment Center:** Sjekk at det står "Docker" (container deployment)

### **2. Configuration → General settings:**
- **Stack:** Linux med Docker runtime
- **Startup command:** Container image fra ACR

### **3. Configuration → Application settings:**
- **Legg til alle miljøvariabler** som App Settings
- **Sjekk at WEBSITES_PORT=8181** er satt

## 🔍 **TROUBLESHOOTING**

### **Hvis 503-feil fortsatt oppstår:**

#### **1. Sjekk Azure Web App logs:**
```bash
# Azure Portal → Web App → Log stream
# Se etter container pull feil
```

#### **2. Sjekk Container Settings:**
```bash
# Azure Portal → Web App → Configuration → Container settings
# Verifiser ACR credentials og image name
```

#### **3. Diagnose & Solve Problems:**
```bash
# Azure Portal → Web App → Diagnose & Solve Problems
# HTTP 5xx errors → Root cause logging
```

### **Vanlige problemer:**

#### **Container pull feil:**
- **Sjekk ACR permissions** for Web App
- **Verifiser container image** eksisterer i ACR
- **Sjekk ACR credentials** i App Settings

#### **Port binding feil:**
```javascript
// Bruk process.env.PORT (Azure setter WEBSITES_PORT)
const port = process.env.PORT || 8181;
```

#### **Miljøvariabler mangler:**
- **Sjekk App Settings** i Azure Portal
- **Ingen .env fil** i production

## 📊 **FORVENTET RESULTAT**

### **Etter deployment:**
1. ✅ **Container starter** uten pull-feil
2. ✅ **Web App kjører** med Docker runtime
3. ✅ **/healthz endpoint** responderer med 200
4. ✅ **Alle funksjoner** fungerer (RAG, AI, Azure services)

## 🎯 **NESTE STEG**

1. **Deploy med container workflow** (manuell trigger)
2. **Verifiser Azure Portal** container konfigurasjon
3. **Test /healthz endpoint**
4. **Verifiser alle funksjoner**

---

**📝 Dette dokumentet oppdateres etter hvert som vi lærer mer om container deployment!**