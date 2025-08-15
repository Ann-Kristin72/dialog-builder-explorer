@description('PostgreSQL Flexible Server for TeknoTassen')
@metadata({
  version: '1.0.0',
  author: 'TeknoTassen Team'
})

// Parametere
param appName string
param environment string
param location string
param tags object
@secure()
param adminPassword string
param keyVaultName string
param keyVaultSecretName string

// Variabler
var serverName = '${appName}-${environment}-psql'
var databaseName = 'teknotassen_${environment}'
var adminUsername = 'teknotassen_admin'

// PostgreSQL Flexible Server
resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-06-01-preview' = {
  name: serverName
  location: location
  tags: tags
  sku: {
    name: environment == 'prod' ? 'Standard_B2ms' : 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '15'
    administratorLogin: adminUsername
    administratorLoginPassword: adminPassword
    storage: {
      storageSizeGB: environment == 'prod' ? 64 : 32
      autoGrow: 'Enabled'
      iops: environment == 'prod' ? 3600 : 1200
    }
    backup: {
      backupRetentionDays: environment == 'prod' ? 30 : 7
      geoRedundantBackup: environment == 'prod' ? 'Enabled' : 'Disabled'
    }
    highAvailability: environment == 'prod' ? 'Enabled' : 'Disabled'
    maintenanceWindow: {
      customWindow: 'Enabled'
      startHour: 2
      startMinute: 0
      dayOfWeek: 0
    }
    network: {
      delegatedSubnetResourceId: ''
      privateDnsZoneArmResourceId: ''
    }
  }
}

// Database
resource postgresDatabase 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-06-01-preview' = {
  parent: postgresServer
  name: databaseName
  properties: {
    charset: 'utf8'
    collation: 'en_US.utf8'
  }
}

// Firewall rule for Azure services
resource firewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-06-01-preview' = {
  parent: postgresServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

// Firewall rule for Container Apps
resource containerAppFirewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-06-01-preview' = {
  parent: postgresServer
  name: 'AllowContainerApps'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
}

// Firewall rule for testing - Åpne for alle IP-adresser (KUN FOR TESTING!)
resource testingFirewallRule 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-06-01-preview' = {
  parent: postgresServer
  name: 'AllowAllForTesting'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '255.255.255.255'
  }
}

// Private DNS Zone for private connectivity
resource privateDnsZone 'Microsoft.Network/privateDnsZones@2020-06-01' = if (environment == 'prod') {
  name: 'privatelink.postgres.database.azure.com'
  location: 'global'
  tags: tags
}

// Private DNS Zone Group
resource privateDnsZoneGroup 'Microsoft.Network/privateDnsZones/virtualNetworkLinks@2020-06-01' = if (environment == 'prod') {
  parent: privateDnsZone
  name: '${appName}-${environment}-link'
  properties: {
    registrationEnabled: false
    virtualNetwork: {
      id: ''
    }
  }
}

// Outputs
output serverName string = postgresServer.name
output serverFqdn string = postgresServer.properties.fullyQualifiedDomainName
output databaseName string = postgresDatabase.name
output connectionString string = 'postgresql://${adminUsername}:${adminPassword}@${postgresServer.properties.fullyQualifiedDomainName}:5432/${databaseName}?sslmode=require'
output adminUsername string = adminUsername
output serverId string = postgresServer.id
