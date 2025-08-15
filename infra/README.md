# TeknoTassen Azure Infrastructure

Denne mappen inneholder Azure Bicep-filer for å sette opp produksjonsinfrastrukturen for TeknoTassen-applikasjonen.

## 🏗️ Infrastrukturkomponenter

### 1. **main.bicep** - Hovedkoordinator

- Koordinerer hele infrastrukturoppsettet
- Bruker moduler for hver komponent
- Håndterer avhengigheter mellom ressurser

### 2. **postgresql.bicep** - Database

- Azure PostgreSQL Flexible Server
- Automatisk backup og høy tilgjengelighet
- Firewall-regler for sikker tilgang

### 3. **keyVault.bicep** - Sikker lagring

- Lagrer sensitive verdier (API-nøkler, passord)
- RBAC-basert tilgangskontroll
- Automatisk secret-rotasjon

### 4. **containerApp.bicep** - Backend API

- Container App for Node.js Express-backend
- Automatisk skalering og load balancing
- Integrert med Key Vault og Application Insights

### 5. **staticWebApp.bicep** - Frontend

- Static Web App for React-frontend
- Automatisk deployment fra GitHub
- CDN og custom domains for produksjon

### 6. **applicationInsights.bicep** - Monitoring

- Application Insights for logging og observasjon
- Log Analytics Workspace
- Alerting og dashboards

## 🚀 Deployment

### Forutsetninger

- Azure CLI installert og konfigurert
- Tilgang til Azure-subscription
- Resource group opprettet

### 1. Opprett Resource Group

```bash
az group create \
  --name rg-teknotassen-prod \
  --location westeurope \
  --tags Environment=prod Application=teknotassen
```

### 2. Opprett Key Vault og lagre secrets

```bash
# Opprett Key Vault
az keyvault create \
  --name teknotassen-prod-kv \
  --resource-group rg-teknotassen-prod \
  --location westeurope \
  --enable-rbac-authorization

# Lagre PostgreSQL admin passord
az keyvault secret set \
  --vault-name teknotassen-prod-kv \
  --name postgres-admin-password \
  --value "DittSikrePassord123!"

# Lagre OpenAI API-nøkkel
az keyvault secret set \
  --vault-name teknotassen-prod-kv \
  --name openai-api-key \
  --value "sk-..."
```

### 3. Oppdater parameters.json

```json
{
  "postgresAdminPassword": {
    "reference": {
      "keyVault": {
        "id": "/subscriptions/{subscription-id}/resourceGroups/rg-teknotassen-prod/providers/Microsoft.KeyVault/vaults/teknotassen-prod-kv"
      },
      "secretName": "postgres-admin-password"
    }
  },
  "openAiApiKey": {
    "reference": {
      "keyVault": {
        "id": "/subscriptions/{subscription-id}/resourceGroups/rg-teknotassen-prod/providers/Microsoft.KeyVault/vaults/teknotassen-prod-kv"
      },
      "secretName": "openai-api-key"
    }
  },
  "tenantId": {
    "value": "din-tenant-id"
  }
}
```

### 4. Deploy infrastrukturen

```bash
az deployment group create \
  --resource-group rg-teknotassen-prod \
  --template-file main.bicep \
  --parameters parameters.json \
  --verbose
```

## 🔧 Konfigurasjon

### Miljøvariabler

Infrastrukturen setter automatisk opp følgende miljøvariabler:

**Backend (Container App):**

- `NODE_ENV`: Miljø (prod/staging/dev)
- `POSTGRES_CONNECTION_STRING`: Database-tilkobling
- `APP_INSIGHTS_CONNECTION_STRING`: Monitoring
- `KEY_VAULT_NAME`: Key Vault-navn
- `OPENAI_API_KEY_SECRET_NAME`: OpenAI API-nøkkel referanse

**Frontend (Static Web App):**

- `VITE_API_URL`: Backend API URL
- `VITE_ENVIRONMENT`: Miljø
- `VITE_APP_NAME`: Applikasjonsnavn

### Custom Domains

For produksjon kan du konfigurere custom domains:

- Frontend: `teknotassen.velfersteknologi.no`
- Backend: `api.teknotassen.velfersteknologi.no`

## 📊 Monitoring og Alerting

### Application Insights

- Automatisk logging av requests, exceptions og performance
- Custom dashboards for TeknoTassen
- Real-time monitoring av applikasjonen

### Alerting

- Høy feilrate (>10 exceptions/15min for prod)
- Høy responstid (>2s for prod)
- Lav tilgjengelighet (<99.5% for prod)

### Logging

- Container App logs
- PostgreSQL audit logs
- Key Vault access logs
- Application Insights telemetry

## 🔒 Sikkerhet

### Network Security

- PostgreSQL med private endpoints (prod)
- Key Vault med RBAC
- Container Apps med managed identity

### Access Control

- Managed Identity for Container Apps
- RBAC for Key Vault
- Azure AD-integrasjon

### Compliance

- GDPR-kompatibel datalagring
- Audit logging for alle ressurser
- Backup og disaster recovery

## 💰 Kostnadsestimater

### Produksjon (West Europe)

- PostgreSQL Flexible Server (B2ms): ~$150/mnd
- Container App (Standard): ~$100/mnd
- Static Web App (Standard): ~$20/mnd
- Application Insights: ~$30/mnd
- Key Vault: ~$5/mnd
- **Total: ~$305/mnd**

### Staging/Dev

- PostgreSQL Flexible Server (B1ms): ~$30/mnd
- Container App (Consumption): ~$20/mnd
- Static Web App (Free): $0/mnd
- Application Insights (Free): $0/mnd
- Key Vault: ~$5/mnd
- **Total: ~$55/mnd**

## 🚨 Troubleshooting

### Vanlige problemer

**1. Container App kan ikke koble til Key Vault**

```bash
# Sjekk managed identity
az containerapp identity show \
  --name teknotassen-prod-backend \
  --resource-group rg-teknotassen-prod

# Sjekk Key Vault access policies
az keyvault show \
  --name teknotassen-prod-kv \
  --query properties.accessPolicies
```

**2. PostgreSQL connection issues**

```bash
# Sjekk firewall-regler
az postgres flexible-server firewall-rule list \
  --name teknotassen-prod-psql \
  --resource-group rg-teknotassen-prod

# Test tilkobling
az postgres flexible-server execute \
  --name teknotassen-prod-psql \
  --admin-user teknotassen_admin \
  --database teknotassen_prod \
  --querytext "SELECT version();"
```

**3. Static Web App deployment feiler**

```bash
# Sjekk GitHub Actions
az staticwebapp show \
  --name teknotassen-prod-frontend \
  --resource-group rg-teknotassen-prod

# Manuell deployment
az staticwebapp create \
  --name teknotassen-prod-frontend \
  --resource-group rg-teknotassen-prod \
  --source https://github.com/teknotassen/frontend \
  --branch main \
  --app-location "/" \
  --output-location "dist"
```

## 📚 Ressurser

- [Azure Bicep dokumentasjon](https://docs.microsoft.com/en-us/azure/azure-resource-manager/bicep/)
- [Container Apps dokumentasjon](https://docs.microsoft.com/en-us/azure/container-apps/)
- [Static Web Apps dokumentasjon](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [PostgreSQL Flexible Server](https://docs.microsoft.com/en-us/azure/postgresql/flexible-server/)

## 🤝 Support

For spørsmål eller problemer med infrastrukturen, kontakt DevOps-teamet på:

- Email: devops@velfersteknologi.no
- Slack: #teknotassen-devops
- Azure DevOps: TeknoTassen Project
