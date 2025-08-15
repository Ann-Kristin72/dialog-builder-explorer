#!/bin/bash

# TeknoTassen Azure Infrastructure Deployment Script
# Dette scriptet automatiserer deployment av hele infrastrukturen

set -e  # Stop ved feil

# Farger for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funksjoner
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Sjekk forutsetninger
check_prerequisites() {
    log_info "Sjekker forutsetninger..."
    
    # Sjekk Azure CLI
    if ! command -v az &> /dev/null; then
        log_error "Azure CLI er ikke installert. Installer fra: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
        exit 1
    fi
    
    # Sjekk Azure login
    if ! az account show &> /dev/null; then
        log_error "Du er ikke logget inn på Azure. Kjør: az login"
        exit 1
    fi
    
    # Sjekk Bicep
    if ! command -v bicep &> /dev/null; then
        log_warning "Bicep er ikke installert. Installer med: az bicep install"
        log_info "Installerer Bicep..."
        az bicep install
    fi
    
    log_success "Alle forutsetninger er oppfylt"
}

# Hent Azure subscription info
get_subscription_info() {
    log_info "Henter Azure subscription informasjon..."
    
    SUBSCRIPTION_ID=$(az account show --query id -o tsv)
    SUBSCRIPTION_NAME=$(az account show --query name -o tsv)
    TENANT_ID=$(az account show --query tenantId -o tsv)
    
    log_info "Subscription: $SUBSCRIPTION_NAME ($SUBSCRIPTION_ID)"
    log_info "Tenant ID: $TENANT_ID"
}

# Opprett resource group
create_resource_group() {
    local resource_group=$1
    local location=$2
    
    log_info "Oppretter resource group: $resource_group"
    
    if az group show --name "$resource_group" &> /dev/null; then
        log_warning "Resource group '$resource_group' eksisterer allerede"
    else
        az group create \
            --name "$resource_group" \
            --location "$location" \
            --tags Environment=prod Application=teknotassen Owner="TeknoTassen Team"
        log_success "Resource group '$resource_group' opprettet"
    fi
}

# Opprett Key Vault og lagre secrets
setup_key_vault() {
    local resource_group=$1
    local key_vault_name=$2
    local location=$3
    
    log_info "Setter opp Key Vault: $key_vault_name"
    
    # Opprett Key Vault hvis den ikke eksisterer
    if ! az keyvault show --name "$key_vault_name" --resource-group "$resource_group" &> /dev/null; then
        log_info "Oppretter Key Vault..."
        az keyvault create \
            --name "$key_vault_name" \
            --resource-group "$resource_group" \
            --location "$location" \
            --enable-rbac-authorization \
            --retention-days 90 \
            --enable-purge-protection true
        log_success "Key Vault '$key_vault_name' opprettet"
    else
        log_warning "Key Vault '$key_vault_name' eksisterer allerede"
    fi
    
    # Lagre PostgreSQL admin passord
    log_info "Lagrer PostgreSQL admin passord..."
    if ! az keyvault secret show --vault-name "$key_vault_name" --name "postgres-admin-password" &> /dev/null; then
        POSTGRES_PASSWORD=$(openssl rand -base64 32)
        az keyvault secret set \
            --vault-name "$key_vault_name" \
            --name "postgres-admin-password" \
            --value "$POSTGRES_PASSWORD"
        log_success "PostgreSQL admin passord lagret"
    else
        log_warning "PostgreSQL admin passord eksisterer allerede"
    fi
    
    # Lagre OpenAI API-nøkkel
    log_info "Lagrer OpenAI API-nøkkel..."
    if ! az keyvault secret show --vault-name "$key_vault_name" --name "openai-api-key" &> /dev/null; then
        read -p "Skriv inn OpenAI API-nøkkel: " OPENAI_API_KEY
        az keyvault secret set \
            --vault-name "$key_vault_name" \
            --name "openai-api-key" \
            --value "$OPENAI_API_KEY"
        log_success "OpenAI API-nøkkel lagret"
    else
        log_warning "OpenAI API-nøkkel eksisterer allerede"
    fi
}

# Oppdater parameters.json
update_parameters() {
    local resource_group=$1
    local key_vault_name=$2
    local subscription_id=$3
    local tenant_id=$4
    
    log_info "Oppdaterer parameters.json..."
    
    # Opprett backup av original fil
    cp parameters.json parameters.json.backup
    
    # Oppdater Key Vault referanser
    sed -i.bak "s|{subscription-id}|$subscription_id|g" parameters.json
    sed -i.bak "s|{resource-group}|$resource_group|g" parameters.json
    sed -i.bak "s|{key-vault-name}|$key_vault_name|g" parameters.json
    sed -i.bak "s|00000000-0000-0000-0000-000000000000|$tenant_id|g" parameters.json
    
    log_success "parameters.json oppdatert"
}

# Deploy infrastrukturen
deploy_infrastructure() {
    local resource_group=$1
    
    log_info "Deployer infrastrukturen..."
    
    # Valider Bicep-filene
    log_info "Validerer Bicep-filene..."
    bicep build main.bicep
    
    # Deploy
    az deployment group create \
        --resource-group "$resource_group" \
        --template-file main.bicep \
        --parameters parameters.json \
        --verbose
    
    log_success "Infrastrukturen deployet"
}

# Vis deployment resultater
show_results() {
    local resource_group=$1
    
    log_info "Henter deployment resultater..."
    
    # Hent outputs fra deployment
    OUTPUTS=$(az deployment group show \
        --resource-group "$resource_group" \
        --name "main" \
        --query properties.outputs \
        --output json)
    
    echo ""
    log_success "🎯 TeknoTassen infrastruktur deployet!"
    echo ""
    echo "📋 Ressurser:"
    echo "  - Key Vault: $(echo $OUTPUTS | jq -r '.keyVaultName.value')"
    echo "  - PostgreSQL: $(echo $OUTPUTS | jq -r '.postgresConnectionString.value' | cut -d'@' -f2 | cut -d':' -f1)"
    echo "  - Backend API: $(echo $OUTPUTS | jq -r '.backendApiUrl.value')"
    echo "  - Frontend: $(echo $OUTPUTS | jq -r '.frontendUrl.value')"
    echo ""
    echo "🔧 Neste steg:"
    echo "  1. Oppdater DNS/domene til frontend"
    echo "  2. Test backend API"
    echo "  3. Sjekk logging i Application Insights"
    echo "  4. Verifiser database-tilkobling"
    echo ""
    echo "📊 Monitoring:"
    echo "  - Application Insights: $(echo $OUTPUTS | jq -r '.appInsightsConnectionString.value')"
}

# Hovedfunksjon
main() {
    echo "🚀 TeknoTassen Azure Infrastructure Deployment"
    echo "=============================================="
    echo ""
    
    # Konfigurasjon
    RESOURCE_GROUP="rg-teknotassen-prod"
    LOCATION="westeurope"
    KEY_VAULT_NAME="teknotassen-prod-kv"
    
    # Sjekk forutsetninger
    check_prerequisites
    
    # Hent Azure info
    get_subscription_info
    
    # Opprett resource group
    create_resource_group "$RESOURCE_GROUP" "$LOCATION"
    
    # Sett opp Key Vault
    setup_key_vault "$RESOURCE_GROUP" "$KEY_VAULT_NAME" "$LOCATION"
    
    # Oppdater parameters
    update_parameters "$RESOURCE_GROUP" "$KEY_VAULT_NAME" "$SUBSCRIPTION_ID" "$TENANT_ID"
    
    # Deploy infrastrukturen
    deploy_infrastructure "$RESOURCE_GROUP"
    
    # Vis resultater
    show_results "$RESOURCE_GROUP"
    
    echo ""
    log_success "Deployment fullført! 🎉"
}

# Kjør hovedfunksjon
main "$@"
