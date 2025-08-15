#!/bin/bash

# TeknoTassen Azure Infrastructure Testing Deployment Script
# Dette scriptet deployer infrastrukturen for testing

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

# Opprett resource group for testing
create_resource_group() {
    local resource_group="rg-teknotassen-testing"
    local location="westeurope"
    
    log_info "Oppretter resource group for testing: $resource_group"
    
    if az group show --name "$resource_group" &> /dev/null; then
        log_warning "Resource group '$resource_group' eksisterer allerede"
    else
        az group create \
            --name "$resource_group" \
            --location "$location" \
            --tags Environment=testing Application=teknotassen Owner="TeknoTassen Team" Purpose="Testing"
        log_success "Resource group '$resource_group' opprettet"
    fi
}

# Oppdater parameters-testing.json med riktig tenant ID
update_testing_parameters() {
    local tenant_id=$1
    
    log_info "Oppdaterer testing parametere..."
    
    # Oppdater tenant ID
    sed -i.bak "s|00000000-0000-0000-0000-000000000000|$tenant_id|g" parameters-testing.json
    
    log_success "Testing parametere oppdatert"
}

# Deploy testing infrastrukturen
deploy_testing_infrastructure() {
    local resource_group="rg-teknotassen-testing"
    
    log_info "Deployer testing infrastrukturen..."
    
    # Valider Bicep-filene
    log_info "Validerer Bicep-filene..."
    bicep build main.bicep
    
    # Deploy med testing parametere
    az deployment group create \
        --resource-group "$resource_group" \
        --template-file main.bicep \
        --parameters parameters-testing.json \
        --verbose
    
    log_success "Testing infrastrukturen deployet"
}

# Vis testing resultater
show_testing_results() {
    local resource_group="rg-teknotassen-testing"
    
    log_info "Henter testing deployment resultater..."
    
    # Hent outputs fra deployment
    OUTPUTS=$(az deployment group show \
        --resource-group "$resource_group" \
        --name "main" \
        --query properties.outputs \
        --output json)
    
    echo ""
    log_success "🎯 TeknoTassen testing infrastruktur deployet!"
    echo ""
    echo "📋 Testing ressurser:"
    echo "  - Key Vault: $(echo $OUTPUTS | jq -r '.keyVaultName.value')"
    echo "  - PostgreSQL: $(echo $OUTPUTS | jq -r '.postgresConnectionString.value' | cut -d'@' -f2 | cut -d':' -f1)"
    echo "  - Backend API: $(echo $OUTPUTS | jq -r '.backendApiUrl.value')"
    echo "  - Frontend: $(echo $OUTPUTS | jq -r '.frontendUrl.value')"
    echo ""
    echo "🧪 Testing informasjon:"
    echo "  - Miljø: Testing (åpen for alle IP-adresser)"
    echo "  - CORS: Åpen for alle origins"
    echo "  - Firewall: Åpen for testing"
    echo ""
    echo "🔧 Testing kommandoer:"
    echo "  # Test PostgreSQL tilkobling"
    echo "  psql \"$(echo $OUTPUTS | jq -r '.postgresConnectionString.value')\""
    echo ""
    echo "  # Test backend API"
    echo "  curl $(echo $OUTPUTS | jq -r '.backendApiUrl.value')/health"
    echo ""
    echo "  # Test frontend"
    echo "  open $(echo $OUTPUTS | jq -r '.frontendUrl.value')"
    echo ""
    echo "⚠️  ADVARSEL: Dette er en testing-miljø som er åpen for alle!"
    echo "   Ikke bruk for produksjon eller sensitive data!"
}

# Hovedfunksjon
main() {
    echo "🧪 TeknoTassen Azure Infrastructure Testing Deployment"
    echo "====================================================="
    echo ""
    
    # Sjekk forutsetninger
    check_prerequisites
    
    # Hent Azure info
    get_subscription_info
    
    # Opprett resource group
    create_resource_group
    
    # Oppdater testing parametere
    update_testing_parameters "$TENANT_ID"
    
    # Deploy testing infrastrukturen
    deploy_testing_infrastructure
    
    # Vis resultater
    show_testing_results
    
    echo ""
    log_success "Testing deployment fullført! 🎉"
    echo ""
    log_warning "HUSK: Dette er en testing-miljø som er åpen for alle!"
    log_warning "Slett ressursene når testing er ferdig!"
}

# Kjør hovedfunksjon
main "$@"
