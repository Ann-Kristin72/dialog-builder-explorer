@description('TeknoTassen - AI-basert prosessassistent for velferdsteknologi')
@metadata({
  version: '1.0.0',
  author: 'TeknoTassen Team',
  description: 'Produksjonsinfrastruktur for TeknoTassen-applikasjonen'
})

// Parametere
@description('Navn på applikasjonen')
param appName string = 'teknotassen'

@description('Miljø (prod, staging, dev)')
@allowed(['prod', 'staging', 'dev'])
param environment string = 'prod'

@description('Azure-region for ressursene')
param location string = 'westeurope'

@description('Admin-passord for PostgreSQL')
@secure()
param postgresAdminPassword string

@description('OpenAI API-nøkkel')
@secure()
param openAiApiKey string

@description('Tenant-ID for Azure AD')
param tenantId string

@description('Resource group navn')
param resourceGroupName string

// Variabler
var appNameLower = toLower(appName)
var environmentLower = toLower(environment)
var resourcePrefix = '${appNameLower}-${environmentLower}'
var tags = {
  Application: appName
  Environment: environment
  Owner: 'TeknoTassen Team'
  CostCenter: 'Velferdsteknologi'
  ManagedBy: 'Bicep'
}

// Key Vault
module keyVault 'keyVault.bicep' = {
  name: '${resourcePrefix}-kv-deploy'
  params: {
    appName: appName
    environment: environment
    location: location
    tags: tags
    postgresAdminPassword: postgresAdminPassword
    openAiApiKey: openAiApiKey
    tenantId: tenantId
  }
}

// PostgreSQL
module postgresql 'postgresql.bicep' = {
  name: '${resourcePrefix}-postgres-deploy'
  params: {
    appName: appName
    environment: environment
    location: location
    tags: tags
    adminPassword: postgresAdminPassword
    keyVaultName: keyVault.outputs.keyVaultName
    keyVaultSecretName: keyVault.outputs.postgresSecretName
  }
}

// Application Insights
module appInsights 'applicationInsights.bicep' = {
  name: '${resourcePrefix}-insights-deploy'
  params: {
    appName: appName
    environment: environment
    location: location
    tags: tags
  }
}

// Container App (Backend)
module webApp 'webApp.bicep' = {
  name: '${resourcePrefix}-backend-deploy'
  params: {
    appName: appName
    environment: environment
    location: location
    tags: tags
    keyVaultName: keyVault.outputs.keyVaultName
    postgresConnectionString: postgresql.outputs.connectionString
    openAiApiKeySecretName: keyVault.outputs.openAiSecretName
    appInsightsConnectionString: appInsights.outputs.connectionString
    tenantId: tenantId
  }
}

// Static Web App (Frontend)
module staticWebApp 'staticWebApp.bicep' = {
  name: '${resourcePrefix}-frontend-deploy'
  params: {
    appName: appName
    environment: environment
    location: location
    tags: tags
    backendApiUrl: webApp.outputs.apiUrl
  }
}

// Outputs
output keyVaultName string = keyVault.outputs.keyVaultName
output postgresConnectionString string = postgresql.outputs.connectionString
output backendApiUrl string = webApp.outputs.apiUrl
output frontendUrl string = staticWebApp.outputs.appUrl
output appInsightsConnectionString string = appInsights.outputs.connectionString

output deploymentInstructions string = '''
🎯 TeknoTassen infrastruktur deployet!

📋 Neste steg:
1. Oppdater DNS/domene til frontend: ${staticWebApp.outputs.appUrl}
2. Test backend API: ${webApp.outputs.apiUrl}
3. Sjekk logging i Application Insights
4. Verifiser database-tilkobling

🔧 CLI kommando for deployment:
az deployment group create \\
  --resource-group ${resourceGroupName} \\
  --template-file infra/main.bicep \\
  --parameters infra/parameters.json \\
  --verbose

📊 Monitoring:
- Application Insights: ${appInsights.outputs.connectionString}
- Key Vault: ${keyVault.outputs.keyVaultName}
- PostgreSQL: ${postgresql.outputs.connectionString}
'''
