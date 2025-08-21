@description('Azure Web App (Linux) for Containers - TeknoTassen Backend API')
@metadata({
  version: '1.0.0',
  author: 'TeknoTassen Team'
})

// Parametre
param appName string
param environment string
param location string
param tags object
param keyVaultName string
param postgresConnectionString string
param openAiApiKeySecretName string
param appInsightsConnectionString string
param tenantId string

// Variabler
var webAppName = '${appName}-${environment}-backend'
var appServicePlanName = '${appName}-${environment}-backend-plan'
var imageName = '${appName}.azurecr.io/${appName}-backend:latest'

// App Service Plan (Linux)
resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  sku: {
    name: environment == 'prod' ? 'P1v2' : 'B1'
    tier: environment == 'prod' ? 'PremiumV2' : 'Basic'
  }
  kind: 'linux'
  properties: {
    reserved: true // Linux
    perSiteScaling: false
    maximumElasticWorkerCount: environment == 'prod' ? 20 : 1
  }
}

// Azure Web App (Linux) for Containers
resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: webAppName
  location: location
  tags: tags
  kind: 'linux,container'
  properties: {
    serverFarmId: appServicePlan.id
    siteConfig: {
      linuxFxVersion: 'DOCKER|${imageName}'
      appSettings: [
        {
          name: 'WEBSITES_ENABLE_APP_SERVICE_STORAGE'
          value: 'false'
        }
        {
          name: 'WEBSITES_PORT'
          value: '80'
        }
        {
          name: 'NODE_ENV'
          value: environment
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_URL'
          value: 'https://${appName}.azurecr.io'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_USERNAME'
          value: '${appName}'
        }
        {
          name: 'DOCKER_REGISTRY_SERVER_PASSWORD'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVaultName}.vault.azure.net/secrets/AcrPassword)'
        }
        {
          name: 'POSTGRES_URL'
          value: postgresConnectionString
        }
        {
          name: 'OPENAI_API_KEY'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVaultName}.vault.azure.net/secrets/${openAiApiKeySecretName})'
        }
        {
          name: 'BLOB_CONNECTION_STRING'
          value: '@Microsoft.KeyVault(SecretUri=https://${keyVaultName}.vault.azure.net/secrets/StorageConnectionString)'
        }
        {
          name: 'AZURE_KEY_VAULT_URL'
          value: 'https://${keyVaultName}.vault.azure.net/'
        }
        {
          name: 'AZURE_TENANT_ID'
          value: tenantId
        }
        {
          name: 'WEBSITE_HEALTHCHECK_MAXPINGFAILURES'
          value: '10'
        }
      ]
      alwaysOn: true
      ftpsState: 'FtpsOnly'
      http20Enabled: true
      minTlsVersion: '1.2'
      healthCheckPath: '/healthz'
    }
    httpsOnly: true
    clientAffinityEnabled: false
  }
}

// Container Registry credentials
resource webAppContainerConfig 'Microsoft.Web/sites/config@2023-01-01' = {
  parent: webApp
  name: 'web'
  properties: {
    linuxFxVersion: 'DOCKER|${imageName}'
    appSettings: webApp.properties.siteConfig.appSettings
  }
}

// Application Insights integration
resource webAppAppInsights 'Microsoft.Web/sites/config@2023-01-01' = {
  parent: webApp
  name: 'appsettings'
  properties: {
    APPINSIGHTS_INSTRUMENTATIONKEY: split(appInsightsConnectionString, ';')[0]
    APPINSIGHTS_CONNECTION_STRING: appInsightsConnectionString
    ApplicationInsightsAgent_EXTENSION_VERSION: '~4'
  }
}

// Custom domain (for production)
resource customDomain 'Microsoft.Web/sites/hostNameBindings@2023-01-01' = if (environment == 'prod') {
  parent: webApp
  name: '${appName}.velfersteknologi.no'
  properties: {
    sslState: 'SniEnabled'
    hostNameType: 'Verified'
  }
}

// SSL binding (for production)
resource sslBinding 'Microsoft.Web/sites/hostNameBindings@2023-01-01' = if (environment == 'prod') {
  parent: webApp
  name: '${appName}.velfersteknologi.no:443:${appName}-ssl-cert'
  properties: {
    sslState: 'SniEnabled'
    hostNameType: 'Verified'
  }
}

// Outputs
output webAppName string = webApp.name
output webAppId string = webApp.id
output apiUrl string = 'https://${webApp.properties.defaultHostName}'
output defaultHostname string = webApp.properties.defaultHostname
output appServicePlanName string = appServicePlan.name
