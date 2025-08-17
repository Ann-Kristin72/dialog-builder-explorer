# 🚀 **AZURE WEB APP DEPLOYMENT GUIDE (Code-based)**

## 📋 **OVERSIKT**

Etter endeløse 503-feil med container-deployment, har vi byttet til **kodebasert deployment** i Azure Web App.

## 🔧 **HVA VI HAR GJORT**

### **✅ Fjernet Container-ruiner:**
- ❌ **Dockerfile** - slettet
- ❌ **.dockerignore** - slettet  
- ❌ **Container workflow** - slettet
- ❌ **Docker referanser** - fjernet

### **✅ Ny kodebasert strategi:**
- **Azure Web App** med Node.js 20 runtime
- **Direkte kode-deployment** (ingen containers)
- **Standard npm start** som entry point

## 🚀 **DEPLOYMENT PROSESS**

### **1. GitHub Actions Workflow:**
```yaml
# .github/workflows/deploy-backend-webapp.yml
- Setup Node.js 20
- Install dependencies (npm ci)
- Deploy code to Azure Web App
- Configure Node.js runtime
- Set startup command (npm start)
```

### **2. Azure Web App Konfigurasjon:**
- **Stack:** Node.js 20 LTS
- **Startup command:** `npm start`
- **Port:** Azure setter automatisk (process.env.PORT)

## 🔐 **MILJØVARIABLER (App Settings)**

### **Kreves:**
```bash
PORT                    # Azure setter automatisk
OPENAI_API_KEY         # For AI-funksjonalitet
POSTGRES_URL           # Database-tilkobling
```

### **Valgfritt:**
```bash
AZURE_KEY_VAULT_URL    # Hvis du bruker Key Vault
BLOB_CONNECTION_STRING # Hvis du bruker Blob Storage
```

## 🧹 **AZURE PORTAL OPPRYKDING**

### **1. Deployment Center:**
- **Gå til:** Azure Portal → Web App → `web-teknotassen`
- **Deployment Center:** Sjekk at det står "Code" (ikke Docker)

### **2. Configuration → General settings:**
- **Stack:** Node.js 20 LTS
- **Startup command:** `npm start`

### **3. Configuration → Application settings:**
- **Legg til alle miljøvariabler** som App Settings

## 🔍 **TROUBLESHOOTING**

### **Hvis 503-feil fortsatt oppstår:**

#### **1. Sjekk Azure Web App logs:**
```bash
# Azure Portal → Web App → Log stream
# Se etter npm start feil
```

#### **2. Sjekk Process Explorer:**
```bash
# Azure Portal → Web App → Advanced Tools → Kudu
# Process Explorer → Se om npm start kjører
```

#### **3. Diagnose & Solve Problems:**
```bash
# Azure Portal → Web App → Diagnose & Solve Problems
# HTTP 5xx errors → Root cause logging
```

### **Vanlige problemer:**

#### **Port binding feil:**
```javascript
// Bruk process.env.PORT (Azure setter automatisk)
const port = process.env.PORT || 80;
```

#### **Miljøvariabler mangler:**
- **Sjekk App Settings** i Azure Portal
- **Ingen .env fil** i production

#### **Node.js runtime mismatch:**
- **Azure:** Node.js 20 LTS
- **GitHub Actions:** Node.js 20

## 📊 **FORVENTET RESULTAT**

### **Etter deployment:**
1. ✅ **Web App starter** uten container-feil
2. ✅ **npm start kjører** som forventet
3. ✅ **/healthz endpoint** responderer med 200
4. ✅ **Alle funksjoner** fungerer (RAG, AI, Azure services)

## 🎯 **NESTE STEG**

1. **Deploy med ny workflow** (manuell trigger)
2. **Verifiser Azure Portal** konfigurasjon
3. **Test /healthz endpoint**
4. **Verifiser alle funksjoner**

---

**📝 Dette dokumentet oppdateres etter hvert som vi lærer mer om kodebasert deployment!**
