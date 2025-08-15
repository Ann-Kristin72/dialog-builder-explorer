@description('Container App for TeknoTassen backend API')
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
var containerAppName = '${appName}-${environment}-backend'
var containerAppEnvName = '${appName}-${environment}-backend-env'
var imageName = 'ghcr.io/${appName}/backend:${environment}'
var revisionSuffix = environment == 'prod' ? '' : '-${utcNow()}'

// Container Apps Environment
resource containerAppEnv 'Microsoft.App/managedEnvironments@2023-05-01' = {
  name: containerAppEnvName
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: {
      destination: 'log-analytics'
      logAnalyticsConfiguration: {
        customerId: split(appInsightsConnectionString, ';')[0]
        sharedKey: split(appInsightsConnectionString, ';')[1]
      }
    }
    zoneRedundant: environment == 'prod'
    workloadProfiles: environment == 'prod' ? [
      {
        name: 'Consumption'
        workloadProfileType: 'Consumption'
        minimumCount: 0
        maximumCount: 3
      }
    ] : []
  }
}

// Container App
resource containerApp 'Microsoft.App/containerApps@2023-05-01' = {
  name: containerAppName
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: containerAppEnv.id
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        allowInsecure: false
        traffic: [
          {
            latestRevision: true
            weight: 100
          }
        ]
        customDomains: []
        clientCertificateMode: 'Ignore'
        // Åpne for testing - KUN FOR TESTING!
        corsPolicy: {
          allowedOrigins: ['*']
          allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
          allowedHeaders: ['*']
          maxAge: 86400
        }
      }
      secrets: [
        {
          name: 'postgres-connection-string'
          value: postgresConnectionString
        }
        {
          name: 'app-insights-connection-string'
          value: appInsightsConnectionString
        }
      ]
      registries: []
      dns: {
        name: containerAppName
      }
    }
    template: {
      revisionSuffix: revisionSuffix
      containers: [
        {
          name: 'backend'
          image: imageName
          env: [
            {
              name: 'NODE_ENV'
              value: environment
            }
            {
              name: 'PORT'
              value: '3000'
            }
            {
              name: 'POSTGRES_CONNECTION_STRING'
              secretRef: 'postgres-connection-string'
            }
            {
              name: 'APP_INSIGHTS_CONNECTION_STRING'
              secretRef: 'app-insights-connection-string'
            }
            {
              name: 'KEY_VAULT_NAME'
              value: keyVaultName
            }
            {
              name: 'OPENAI_API_KEY_SECRET_NAME'
              value: openAiApiKeySecretName
            }
            {
              name: 'TENANT_ID'
              value: tenantId
            }
            {
              name: 'CORS_ORIGIN'
              value: 'https://${appName}-${environment}-frontend.azurestaticapps.net'
            }
          ]
          resources: {
            cpu: json(environment == 'prod' ? '0.5' : '0.25')
            memory: environment == 'prod' ? '1Gi' : '0.5Gi'
          }
          probes: [
            {
              type: 'readiness'
              httpGet: {
                path: '/health'
                port: 3000
                httpHeaders: [
                  {
                    name: 'Accept'
                    value: 'application/json'
                  }
                ]
              }
              initialDelaySeconds: 10
              periodSeconds: 5
              timeoutSeconds: 3
              failureThreshold: 3
              successThreshold: 1
            }
            {
              type: 'liveness'
              httpGet: {
                path: '/health'
                port: 3000
                httpHeaders: [
                  {
                    name: 'Accept'
                    value: 'application/json'
                  }
                ]
              }
              initialDelaySeconds: 30
              periodSeconds: 10
              timeoutSeconds: 5
              failureThreshold: 3
              successThreshold: 1
            }
          ]
        }
      ]
      scale: {
        minReplicas: environment == 'prod' ? 2 : 1
        maxReplicas: environment == 'prod' ? 10 : 3
        rules: [
          {
            name: 'http-rule'
            http: {
              metadata: {
                concurrentRequests: '100'
              }
            }
          }
          {
            name: 'cpu-rule'
            custom: {
              type: 'cpu'
              metadata: {
                type: 'Utilization'
                value: '70'
              }
            }
          }
        ]
      }
    }
  }
}

// Managed Identity for Container App
resource containerAppIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${containerAppName}-identity'
  location: location
  tags: tags
}

// Role assignment for Key Vault access
resource keyVaultRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVaultName, containerAppIdentity.id, '4633458b-17de-408a-b874-0445c86b69e6') // Key Vault Secrets User
  scope: resourceId('Microsoft.KeyVault/vaults', keyVaultName)
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: containerAppIdentity.properties.principalId
    principalType: 'ServicePrincipal'
  }
}

// Custom domain (optional - for production)
resource customDomain 'Microsoft.App/containerApps/customDomains@2023-05-01' = if (environment == 'prod') {
  parent: containerApp
  name: '${appName}.velfersteknologi.no'
  properties: {
    bindingType: 'Disabled'
    certificateId: ''
  }
}

// Diagnostic settings for Container App
resource containerAppDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${containerAppName}-diagnostics'
  scope: containerApp
  properties: {
    logs: [
      {
        category: 'ContainerAppConsoleLogs'
        enabled: true
        retentionPolicy: {
          days: environment == 'prod' ? 90 : 30
          enabled: true
        }
      }
      {
        category: 'ContainerAppSystemLogs'
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

// Outputs
output containerAppName string = containerApp.name
output containerAppId string = containerApp.id
output apiUrl string = 'https://${containerApp.properties.configuration.ingress.fqdn}'
output containerAppFqdn string = containerApp.properties.configuration.ingress.fqdn
output managedIdentityId string = containerAppIdentity.id
output managedIdentityPrincipalId string = containerAppIdentity.properties.principalId
