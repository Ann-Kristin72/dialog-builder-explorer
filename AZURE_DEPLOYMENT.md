# 🚀 Azure Deployment Guide - TeknoTassen Backend

## 📋 Forutsetninger

✅ **Azure Resources (allerede opprettet):**
- Web App (Linux, Container): `web-teknotassen`
- Container Registry: `acrteknotassen`
- Key Vault: `kv-teknotassen`
- PostgreSQL: `pg-teknotassen`
- Storage Account: `stteknotassen01`

## 🐳 Steg 1: Opprett Azure Container Registry

```bash
# Logg inn (om nødvendig)
az login

# Opprett ACR
az acr create \
  --resource-group teknotassen-rg \
  --name acrteknotassen \
  --sku Basic \
  --location norwayeast

# Gi Web App sin Managed Identity pull-rettighet
RG="teknotassen-rg"
ACR="acrteknotassen"
WEBAPP="web-teknotassen"

# Finn principalId til Web App sin managed identity
WEBAPP_ID=$(az webapp identity show -g $RG -n $WEBAPP --query principalId -o tsv)

# Gi AcrPull på ACR-nivå
az role assignment create \
  --assignee $WEBAPP_ID \
  --role "AcrPull" \
  --scope $(az acr show -n $ACR --query id -o tsv)
```

## 🔑 Steg 2: Konfigurer GitHub Secrets

Gå til `Settings > Secrets and variables > Actions` i GitHub repoet og legg til:

- `AZURE_SUBSCRIPTION_ID`
- `AZURE_TENANT_ID` 
- `AZURE_CLIENT_ID`

## 🚀 Steg 3: Deploy med GitHub Actions

1. **Push til main branch** - workflow starter automatisk
2. **Eller manuell trigger** via `Actions > Deploy Backend > Run workflow`

## ⚙️ Steg 4: Azure Web App Configuration

Sett disse app settings i Azure Portal (`web-teknotassen > Configuration > Application settings`):

```bash
NODE_ENV=production
PORT=3000
WEBSITES_PORT=3000

# Key Vault references (Azure resolverer disse automatisk)
POSTGRES_URL=@Microsoft.KeyVault(SecretUri=https://kv-teknotassen.vault.azure.net/secrets/PostgresConnectionString/<VERSION>)
BLOB_CONNECTION_STRING=@Microsoft.KeyVault(SecretUri=https://kv-teknotassen.vault.azure.net/secrets/StorageConnectionString/<VERSION>)
OPENAI_API_KEY=@Microsoft.KeyVault(SecretUri=https://kv-teknotassen.vault.azure.net/secrets/OpenAIKey/<VERSION>)
```

## 🧪 Steg 5: Test Deployment

```bash
# Health check
curl https://web-teknotassen.azurewebsites.net/healthz

# Database test
curl https://web-teknotassen.azurewebsites.net/api/courses/azure/test-db

# TTS/STT status
curl https://web-teknotassen.azurewebsites.net/api/tts-stt/status
```

## 📊 Monitoring

- **Logs**: `web-teknotassen > Log stream`
- **Metrics**: `web-teknotassen > Metrics`
- **Container**: `web-teknotassen > Container settings`

## 🔧 Troubleshooting

### Container ikke starter
```bash
# Sjekk logs
az webapp log tail -g teknotassen-rg -n web-teknotassen

# Sjekk container settings
az webapp config container show -g teknotassen-rg -n web-teknotassen
```

### Database connection feiler
```bash
# Sjekk Key Vault secrets
az keyvault secret list --vault-name kv-teknotassen

# Test connection string
az keyvault secret show --vault-name kv-teknotassen --name PostgresConnectionString
```

### Storage connection feiler
```bash
# Sjekk storage account
az storage account show -g teknotassen-rg -n stteknotassen01

# Test container access
az storage container list --account-name stteknotassen01
```

## 🌐 CORS Configuration

Backend er konfigurert for:
- **Production**: `https://teknotassen.vercel.app`
- **Azure**: `https://web-teknotassen.azurewebsites.net`
- **Development**: `http://localhost:5173`

## 📝 Neste steg

1. **Test alle API endpoints**
2. **Verifiser database-tilkobling**
3. **Test TTS/STT funksjonalitet**
4. **Deploy frontend til Vercel**
5. **Konfigurer custom domain**

## 🆘 Support

Hvis noe går galt:
1. Sjekk GitHub Actions logs
2. Sjekk Azure Web App logs
3. Verifiser Key Vault secrets
4. Test container lokalt: `docker build -f backend/Dockerfile .`
