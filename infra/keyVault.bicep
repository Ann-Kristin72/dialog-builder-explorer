@description('Azure Key Vault for TeknoTassen secrets')
@metadata({
  version: '1.0.0',
  author: 'TeknoTassen Team'
})

// Parametre
param appName string
param environment string
param location string
param tags object
@secure()
param postgresAdminPassword string
@secure()
param openAiApiKey string
param tenantId string

// Variabler
var keyVaultName = '${appName}-${environment}-kv'
var postgresSecretName = 'postgres-admin-password'
var openAiSecretName = 'openai-api-key'
var postgresConnectionSecretName = 'postgres-connection-string'

// Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 90
    enablePurgeProtection: environment == 'prod'
    networkAcls: {
      defaultAction: 'Allow'
      bypass: 'AzureServices'
      ipRules: [
        // Åpne for testing - KUN FOR TESTING!
        {
          value: '0.0.0.0/0'
          action: 'Allow'
        }
      ]
      virtualNetworkRules: []
    }
    publicNetworkAccess: 'Enabled'
  }
}

// PostgreSQL admin password secret
resource postgresPasswordSecret 'Microsoft.KeyVault/secrets@2023-07-01' = {
  parent: keyVault
  name: postgresSecretName
  properties: {
    value: postgresAdminPassword
    contentType: 'text/plain'
    attributes: {
      enabled: true
      exp: addHours(utcNow(), 8760) // 1 year
    }
  }
}

// OpenAI API key secret
resource openAiSecret 'Microsoft.KeyVault/secrets@2023-07-01' = {
  parent: keyVault
  name: openAiSecretName
  properties: {
    value: openAiApiKey
    contentType: 'text/plain'
    attributes: {
      enabled: true
      exp: addHours(utcNow(), 8760) // 1 year
    }
  }
}

// PostgreSQL connection string secret (placeholder - will be updated by main.bicep)
resource postgresConnectionSecret 'Microsoft.KeyVault/secrets@2023-07-01' = {
  parent: keyVault
  name: postgresConnectionSecretName
  properties: {
    value: 'placeholder-connection-string'
    contentType: 'text/plain'
    attributes: {
      enabled: true
      exp: addHours(utcNow(), 8760) // 1 year
    }
  }
}

// Access policy for Container Apps managed identity
resource keyVaultAccessPolicy 'Microsoft.KeyVault/vaults/accessPolicies@2023-07-01' = {
  parent: keyVault
  name: 'add'
  properties: {
    accessPolicies: [
      {
        tenantId: tenantId
        objectId: '00000000-0000-0000-0000-000000000000' // Will be updated by Container App
        permissions: {
          secrets: [
            'get'
            'list'
          ]
        }
      }
    ]
  }
}

// Diagnostic settings for Key Vault
resource keyVaultDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${keyVaultName}-diagnostics'
  scope: keyVault
  properties: {
    logs: [
      {
        category: 'AuditEvent'
        enabled: true
        retentionPolicy: {
          days: environment == 'prod' ? 365 : 30
          enabled: true
        }
      }
      {
        category: 'AzurePolicyEvaluationDetails'
        enabled: true
        retentionPolicy: {
          days: environment == 'prod' ? 365 : 30
          enabled: true
        }
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
        retentionPolicy: {
          days: environment == 'prod' ? 365 : 30
          enabled: true
        }
      }
    ]
  }
}

// Outputs
output keyVaultName string = keyVault.name
output keyVaultId string = keyVault.id
output postgresSecretName string = postgresPasswordSecret.name
output openAiSecretName string = openAiSecret.name
output postgresConnectionSecretName string = postgresConnectionSecret.name
output keyVaultUri string = keyVault.properties.vaultUri
