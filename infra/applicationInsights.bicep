@description('Application Insights for TeknoTassen monitoring')
@metadata({
  version: '1.0.0',
  author: 'TeknoTassen Team'
})

// Parametre
param appName string
param environment string
param location string
param tags object

// Variabler
var appInsightsName = '${appName}-${environment}-insights'
var logAnalyticsWorkspaceName = '${appName}-${environment}-logs'

// Log Analytics Workspace
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2022-10-01' = {
  name: logAnalyticsWorkspaceName
  location: location
  tags: tags
  properties: {
    sku: {
      name: environment == 'prod' ? 'PerGB2018' : 'Free'
    }
    retentionInDays: environment == 'prod' ? 365 : 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// Application Insights
resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
    IngestionMode: 'LogAnalytics'
    Request_Source: 'rest'
    Flow_Type: 'Redfield'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// Action Group for alerts
resource actionGroup 'Microsoft.Insights/actionGroups@2023-01-01' = {
  name: '${appInsightsName}-action-group'
  location: 'global'
  tags: tags
  properties: {
    groupShortName: 'TeknoTassen'
    enabled: true
    emailReceivers: [
      {
        name: 'DevOpsTeam'
        emailAddress: 'devops@velfersteknologi.no'
        useCommonAlertSchema: true
      }
    ]
    smsReceivers: []
    webhookReceivers: []
    itsmReceivers: []
    azureAppPushReceivers: []
    automationRunbookReceivers: []
    voiceReceivers: []
    logicAppReceivers: []
    azureFunctionReceivers: []
    armRoleReceivers: []
    eventHubReceivers: []
  }
}

// Alert rule for high error rate
resource errorRateAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${appInsightsName}-error-rate-alert'
  location: 'global'
  tags: tags
  properties: {
    description: 'Alert when error rate is high'
    severity: environment == 'prod' ? 1 : 2
    enabled: true
    scopes: [
      appInsights.id
    ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighErrorRate'
          metricName: 'exceptions/count'
          operator: 'GreaterThan'
          threshold: environment == 'prod' ? 10 : 5
          timeAggregation: 'Total'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
        webhookProperties: {}
      }
    ]
  }
}

// Alert rule for high response time
resource responseTimeAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${appInsightsName}-response-time-alert'
  location: 'global'
  tags: tags
  properties: {
    description: 'Alert when response time is high'
    severity: environment == 'prod' ? 2 : 3
    enabled: true
    scopes: [
      appInsights.id
    ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'HighResponseTime'
          metricName: 'requests/duration'
          operator: 'GreaterThan'
          threshold: environment == 'prod' ? 2000 : 5000
          timeAggregation: 'Average'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
        webhookProperties: {}
      }
    ]
  }
}

// Alert rule for availability
resource availabilityAlert 'Microsoft.Insights/metricAlerts@2018-03-01' = {
  name: '${appInsightsName}-availability-alert'
  location: 'global'
  tags: tags
  properties: {
    description: 'Alert when availability is low'
    severity: environment == 'prod' ? 0 : 1
    enabled: true
    scopes: [
      appInsights.id
    ]
    evaluationFrequency: 'PT5M'
    windowSize: 'PT15M'
    criteria: {
      'odata.type': 'Microsoft.Azure.Monitor.SingleResourceMultipleMetricCriteria'
      allOf: [
        {
          name: 'LowAvailability'
          metricName: 'availability/percentage'
          operator: 'LessThan'
          threshold: environment == 'prod' ? 99.5 : 95.0
          timeAggregation: 'Average'
          criterionType: 'StaticThresholdCriterion'
        }
      ]
    }
    actions: [
      {
        actionGroupId: actionGroup.id
        webhookProperties: {}
      }
    ]
  }
}

// Diagnostic settings for Application Insights
resource appInsightsDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: '${appInsightsName}-diagnostics'
  scope: appInsights
  properties: {
    logs: [
      {
        category: 'AuditLogs'
        enabled: true
        retentionPolicy: {
          days: environment == 'prod' ? 365 : 30
          enabled: true
        }
      }
      {
        category: 'Availability'
        enabled: true
        retentionPolicy: {
          days: environment == 'prod' ? 365 : 30
          enabled: true
        }
      }
      {
        category: 'Performance'
        enabled: true
        retentionPolicy: {
          days: environment == 'prod' ? 365 : 30
          enabled: true
        }
      }
      {
        category: 'Requests'
        enabled: true
        retentionPolicy: {
          days: environment == 'prod' ? 365 : 30
          enabled: true
        }
      }
      {
        category: 'Exceptions'
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

// Workbook for custom dashboard
resource workbook 'Microsoft.Insights/workbooks@2022-04-01' = {
  name: '${appInsightsName}-dashboard'
  location: location
  tags: tags
  properties: {
    displayName: 'TeknoTassen ${environment} Dashboard'
    serializedData: loadTextContent('workbook-template.json')
    version: '1.0'
    description: 'Custom dashboard for TeknoTassen ${environment} environment'
    category: 'workbook'
    tags: [
      'hidden-link:${appInsights.id}'
    ]
  }
}

// Outputs
output appInsightsName string = appInsights.name
output appInsightsId string = appInsights.id
output instrumentationKey string = appInsights.properties.InstrumentationKey
output connectionString string = appInsights.properties.ConnectionString
output appId string = appInsights.properties.AppId
output logAnalyticsWorkspaceId string = logAnalyticsWorkspace.id
output logAnalyticsWorkspaceName string = logAnalyticsWorkspace.name
output actionGroupId string = actionGroup.id
