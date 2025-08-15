@description('Static Web App for TeknoTassen frontend')
@metadata({
  version: '1.0.0',
  author: 'TeknoTassen Team'
})

// Parametre
param appName string
param environment string
param location string
param tags object
param backendApiUrl string

// Variabler
var staticWebAppName = '${appName}-${environment}-frontend'
var buildArtifactPath = 'dist'
var apiUrl = backendApiUrl

// Static Web App
resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: staticWebAppName
  location: location
  tags: tags
  sku: {
    name: environment == 'prod' ? 'Standard' : 'Free'
    tier: environment == 'prod' ? 'Standard' : 'Free'
  }
  properties: {
    branch: 'main'
    buildProperties: {
      apiLocation: ''
      appArtifactLocation: buildArtifactPath
      appLocation: '/'
      apiBuildCommand: ''
      appBuildCommand: 'npm run build'
      deploymentToken: ''
      outputLocation: buildArtifactPath
      skipGithubActionWorkflowGeneration: false
    }
    defaultHostname: ''
    repositoryUrl: 'https://github.com/${appName}/teknotassen-frontend'
    stagingEnvironmentPolicy: environment == 'prod' ? 'Enabled' : 'Disabled'
    allowConfigFileUpdates: true
    userProvidedFunctionApps: []
    provider: 'GitHub'
    enterpriseGradeCdnStatus: environment == 'prod' ? 'Enabled' : 'Disabled'
    publicNetworkAccess: 'Enabled'
    // Åpne for testing - KUN FOR TESTING!
    allowConfigFileUpdates: true
    stagingEnvironmentPolicy: 'Enabled'
  }
}

// App settings for environment variables
resource staticWebAppAppSettings 'Microsoft.Web/staticSites/config/appsettings@2022-09-01' = {
  parent: staticWebApp
  name: 'appsettings'
  properties: {
    VITE_API_URL: apiUrl
    VITE_ENVIRONMENT: environment
    VITE_APP_NAME: appName
    VITE_APP_VERSION: '1.0.0'
    VITE_BUILD_TIME: utcNow()
  }
}

// Custom domain (for production)
resource customDomain 'Microsoft.Web/staticSites/customDomains@2022-09-01' = if (environment == 'prod') {
  parent: staticWebApp
  name: '${appName}.velfersteknologi.no'
  properties: {
    validationMethod: 'dns-txt-token'
  }
}

// Custom domain validation
resource customDomainValidation 'Microsoft.Web/staticSites/customDomains/validation@2022-09-01' = if (environment == 'prod') {
  parent: customDomain
  name: 'validation'
  properties: {
    validationMethod: 'dns-txt-token'
  }
}

// Function app for API routes (optional - for serverless functions)
resource functionApp 'Microsoft.Web/sites@2022-09-01' = if (environment == 'prod') {
  name: '${staticWebAppName}-api'
  location: location
  tags: tags
  kind: 'functionapp'
  properties: {
    serverFarmId: ''
    siteConfig: {
      appSettings: [
        {
          name: 'FUNCTIONS_WORKER_RUNTIME'
          value: 'node'
        }
        {
          name: 'FUNCTIONS_EXTENSION_VERSION'
          value: '~4'
        }
        {
          name: 'WEBSITE_NODE_DEFAULT_VERSION'
          value: '~18'
        }
        {
          name: 'AzureWebJobsStorage'
          value: ''
        }
      ]
      cors: {
        allowedOrigins: [
          'https://${staticWebAppName}.azurestaticapps.net'
          'https://${appName}.velfersteknologi.no'
        ]
      }
    }
  }
}

// Diagnostic settings for Static Web App
resource staticWebAppDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${staticWebAppName}-diagnostics'
  scope: staticWebApp
  properties: {
    logs: [
      {
        category: 'AuditLogs'
        enabled: true
        retentionPolicy: {
          days: environment == 'prod' ? 90 : 30
          enabled: true
        }
      }
      {
        category: 'SignInLogs'
        enabled: true
        retentionPolicy: {
          days: environment == 'prod' ? 90 : 30
          enabled: true
        }
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
        retentionPolicy: {
          days: environment == 'prod' ? 90 : 30
          enabled: true
        }
      }
    ]
  }
}

// CDN profile for production (optional)
resource cdnProfile 'Microsoft.Cdn/profiles@2023-05-01' = if (environment == 'prod') {
  name: '${staticWebAppName}-cdn'
  location: 'global'
  tags: tags
  sku: {
    name: 'Standard_Microsoft'
  }
}

// CDN endpoint
resource cdnEndpoint 'Microsoft.Cdn/profiles/endpoints@2023-05-01' = if (environment == 'prod') {
  parent: cdnProfile
  name: '${staticWebAppName}-endpoint'
  location: 'global'
  tags: tags
  properties: {
    originHostHeader: staticWebApp.properties.defaultHostname
    origins: [
      {
        name: '${staticWebAppName}-origin'
        properties: {
          hostName: staticWebApp.properties.defaultHostname
          httpPort: 80
          httpsPort: 443
        }
      }
    ]
    isHttpAllowed: false
    isHttpsAllowed: true
    queryStringCachingBehavior: 'IgnoreQueryString'
    optimizationType: 'GeneralWebDelivery'
    geoFilters: []
    urlSigningKeys: []
    deliveryPolicy: {
      description: 'Default delivery policy'
      rules: [
        {
          name: 'Default'
          order: 1
          conditions: []
          actions: []
        }
      ]
    }
  }
}

// Outputs
output staticWebAppName string = staticWebApp.name
output staticWebAppId string = staticWebApp.id
output appUrl string = 'https://${staticWebApp.properties.defaultHostname}'
output defaultHostname string = staticWebApp.properties.defaultHostname
output cdnEndpointUrl string = environment == 'prod' ? 'https://${cdnEndpoint.properties.hostName}' : ''
output functionAppName string = environment == 'prod' ? functionApp.name : ''
output customDomainName string = environment == 'prod' ? customDomain.name : ''
