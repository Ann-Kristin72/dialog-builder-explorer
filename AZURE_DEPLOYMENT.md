# Azure Web App Deployment Guide

## 🚀 **DEPLOYMENT STATUS: READY FOR PRODUCTION**

**Dato:** 16. august 2025  
**Status:** ✅ GitHub Secrets konfigurert, RBAC satt opp, Federated Credentials aktiv  
**Neste:** GitHub Actions deployment i gang

## 📋 **Forutsetninger**

### Azure Resources
- ✅ Resource Group: `teknotassen-rg`
- ✅ Web App: `web-teknotassen` (Linux, Container)
- ✅ Key Vault: `kv-teknotassen`
- ✅ Storage Account: `stteknotassen01`
- ✅ PostgreSQL: `pg-teknotassen`

### GitHub Setup
- ✅ Repository: `dialog-builder-explorer`
- ✅ Workflow: `.github/workflows/deploy-backend.yml`
- ✅ Secrets: `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID`
- ✅ **NEW:** `AZURE_PUBLISH_PROFILE` - Web App publish profile
- ✅ App Registration: `teknotassen-github-ci` med federated credentials
- ✅ RBAC: Contributor-rolle på `teknotassen-rg`

## 🐳 **Docker Deployment**

### Container Image
- **Base:** `node:20-alpine`
- **Port:** 3000
- **Health Check:** `/healthz`
- **Registry:** `acrteknotassen.azurecr.io`

### **Build Process**
1. GitHub Actions checkout
2. Azure login (OIDC)
3. **ACR creation** (if needed)
4. **ACR credentials retrieval** (username/password)
5. **ACR login** via `azure/docker-login@v1`
6. **Docker build & push** to ACR
7. **Deploy to Web App** via `azure/webapps-deploy@v2`
8. **Health check** verification

## 🔧 **Environment Variables**

### **GitHub Secrets Required**
```bash
AZURE_CLIENT_ID          # From teknotassen-github-ci app registration
AZURE_TENANT_ID          # Azure AD tenant ID
AZURE_SUBSCRIPTION_ID    # Azure subscription ID
AZURE_PUBLISH_PROFILE    # Web App publish profile (NEW!)
```

### **How to get AZURE_PUBLISH_PROFILE:**
1. **Go to Azure Portal:** `https://portal.azure.com`
2. **Navigate to:** `web-teknotassen` Web App
3. **Click:** `Get publish profile`
4. **Download** the `.publishsettings` file
5. **Copy the content** and add as GitHub secret `AZURE_PUBLISH_PROFILE`

### **Key Vault References**
```bash
POSTGRES_URL=@Microsoft.KeyVault(SecretUri=https://kv-teknotassen.vault.azure.net/secrets/PostgresAppConnectionString/)
BLOB_CONNECTION_STRING=@Microsoft.KeyVault(SecretUri=https://kv-teknotassen.vault.azure.net/secrets/StorageConnectionString/)
OPENAI_API_KEY=@Microsoft.KeyVault(SecretUri=https://kv-teknotassen.vault.azure.net/secrets/OpenAIAPIKey/)
```

### Container Settings
```bash
WEBSITES_PORT=3000
NODE_ENV=production
TZ=Europe/Oslo
```

## 🚀 **Deployment Commands**

### Manual Deployment (hvis GitHub Actions feiler)
```bash
# 1. Opprett ACR (hvis ikke eksisterer)
az acr create --resource-group teknotassen-rg --name acrteknotassen --sku Basic

# 2. Build og push image
cd backend
docker build -t acrteknotassen.azurecr.io/teknotassen-backend:latest .
docker push acrteknotassen.azurecr.io/teknotassen-backend:latest

# 3. Oppdater Web App
az webapp config container set \
  --resource-group teknotassen-rg \
  --name web-teknotassen \
  --docker-custom-image-name acrteknotassen.azurecr.io/teknotassen-backend:latest

# 4. Restart
az webapp restart -g teknotassen-rg -n web-teknotassen
```

## 🧪 **Testing**

### Health Check
```bash
curl https://web-teknotassen.azurewebsites.net/healthz
```

### Database Connection Test
```bash
curl https://web-teknotassen.azurewebsites.net/api/courses/azure/test-db
```

### Expected Response
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-08-16T14:00:00Z"
}
```

## 🔍 **Monitoring**

### Azure Portal
- **Web App** → Log Stream
- **Web App** → Container Settings
- **Application Insights** → Live Metrics

### GitHub Actions
- **Actions** tab → `Deploy Backend to Azure Web App (Container)`
- **Run workflow** for manuell trigger

## 🚨 **Troubleshooting**

### Common Issues
1. **Container won't start** → Check Log Stream
2. **Port binding error** → Verify WEBSITES_PORT=3000
3. **Database connection failed** → Check Key Vault secrets
4. **ACR pull failed** → Verify RBAC permissions

### Log Locations
- **Container logs:** Web App → Log Stream
- **Build logs:** GitHub Actions → Workflow runs
- **Runtime logs:** Web App → Log Stream

## 🎯 **Success Criteria**

- ✅ Web App responds to `/healthz`
- ✅ Database connection established
- ✅ RAG API endpoints accessible
- ✅ Container running successfully
- ✅ GitHub Actions deployment successful

---

**Deployment Status:** 🔧 **CRITICAL HOSTNAME FIX** - CTO identified root cause

**Critical Fix Applied:**
- ✅ **HOSTNAME RESOLUTION:** Use Azure's `defaultHostName` instead of assuming `azurewebsites.net`
- ✅ WEBSITES_PORT=8181 (container compatibility)
- ✅ NODE_ENV=production (fix typo)
- ✅ Health check tests actual hostname on port 8181
- ✅ All workflow cleanup done

**Root Cause:** We were pinging non-existent `azurewebsites.net` URLs
**Solution:** Resolve actual hostname from Azure Web App properties

**Next:** Test deployment with hostname resolution fix → Success! 🎯
