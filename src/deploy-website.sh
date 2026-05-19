#!/usr/bin/env bash
# =============================================================
# deploy-website.sh
# Dunder Mifflin Scranton Branch — Azure Static Web App Deployer
# =============================================================
# Prerequisites:
#   1. Azure CLI installed  →  https://learn.microsoft.com/cli/azure/install-azure-cli
#   2. SWA CLI installed    →  npm install -g @azure/static-web-apps-cli
#   3. Logged in to Azure   →  az login
#
# Usage:
#   chmod +x deploy-website.sh
#   ./deploy-website.sh
#
# What this script does:
#   1. Creates a resource group (if it doesn't exist)
#   2. Creates a free-tier Azure Static Web App
#   3. Retrieves the deployment API token
#   4. Deploys all website files using the SWA CLI
#   5. Prints the live URL
# =============================================================

set -euo pipefail

# ── Configuration — edit these if you want different names ──
RESOURCE_GROUP="rg-dundermifflin-website"
LOCATION="eastus2"
APP_NAME="dundermifflin-scranton"
SKU="Free"

# Derive the directory this script lives in (the website folder)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── Colours for output ───────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'

info()    { echo -e "${CYAN}[INFO]${RESET}  $*"; }
success() { echo -e "${GREEN}[OK]${RESET}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${RESET}  $*"; }
error()   { echo -e "${RED}[ERROR]${RESET} $*" >&2; exit 1; }

# ── Banner ───────────────────────────────────────────────────
echo ""
echo -e "${BOLD}============================================${RESET}"
echo -e "${BOLD}  Dunder Mifflin — Azure SWA Deployer${RESET}"
echo -e "${BOLD}  Limitless Paper in a Paperless World${RESET}"
echo -e "${BOLD}============================================${RESET}"
echo ""

# ── Preflight checks ─────────────────────────────────────────
info "Checking prerequisites..."

if ! command -v az &>/dev/null; then
  error "Azure CLI not found. Install from: https://learn.microsoft.com/cli/azure/install-azure-cli"
fi

if ! command -v swa &>/dev/null; then
  warn "SWA CLI not found. Installing now (requires npm)..."
  npm install -g @azure/static-web-apps-cli || error "Failed to install SWA CLI. Run: npm install -g @azure/static-web-apps-cli"
fi

# Verify Azure login
if ! az account show &>/dev/null; then
  info "Not logged in. Running az login..."
  az login
fi

SUBSCRIPTION=$(az account show --query "name" -o tsv)
success "Authenticated. Subscription: ${SUBSCRIPTION}"

# ── Resource group ───────────────────────────────────────────
echo ""
info "Ensuring resource group '${RESOURCE_GROUP}' exists in ${LOCATION}..."

if az group show --name "${RESOURCE_GROUP}" &>/dev/null; then
  success "Resource group already exists — skipping creation."
else
  az group create \
    --name "${RESOURCE_GROUP}" \
    --location "${LOCATION}" \
    --output none
  success "Resource group created."
fi

# ── Static Web App ────────────────────────────────────────────
echo ""
info "Creating Static Web App '${APP_NAME}' (SKU: ${SKU})..."

if az staticwebapp show --name "${APP_NAME}" --resource-group "${RESOURCE_GROUP}" &>/dev/null; then
  warn "Static Web App already exists — skipping creation. Will redeploy content."
else
  az staticwebapp create \
    --name "${APP_NAME}" \
    --resource-group "${RESOURCE_GROUP}" \
    --location "${LOCATION}" \
    --sku "${SKU}" \
    --output none
  success "Static Web App created."
fi

# ── Retrieve deployment token ─────────────────────────────────
echo ""
info "Retrieving deployment token..."

DEPLOY_TOKEN=$(az staticwebapp secrets list \
  --name "${APP_NAME}" \
  --resource-group "${RESOURCE_GROUP}" \
  --query "properties.apiKey" \
  --output tsv)

if [[ -z "${DEPLOY_TOKEN}" ]]; then
  error "Failed to retrieve deployment token. Check your permissions."
fi

success "Deployment token retrieved."

# ── Deploy content ────────────────────────────────────────────
echo ""
info "Deploying website files from: ${SCRIPT_DIR}"
info "This may take a minute..."

swa deploy "${SCRIPT_DIR}" \
  --deployment-token "${DEPLOY_TOKEN}" \
  --app-name "${APP_NAME}" \
  --env "production"

# ── Print live URL ────────────────────────────────────────────
echo ""
HOSTNAME=$(az staticwebapp show \
  --name "${APP_NAME}" \
  --resource-group "${RESOURCE_GROUP}" \
  --query "defaultHostname" \
  --output tsv)

success "Deployment complete!"
echo ""
echo -e "${BOLD}  Live URL:${RESET}  ${GREEN}https://${HOSTNAME}${RESET}"
echo ""
echo -e "${CYAN}  Pages available:${RESET}"
echo "    https://${HOSTNAME}/"
echo "    https://${HOSTNAME}/about"
echo "    https://${HOSTNAME}/products"
echo "    https://${HOSTNAME}/team"
echo "    https://${HOSTNAME}/locations"
echo "    https://${HOSTNAME}/news"
echo "    https://${HOSTNAME}/contact"
echo ""
echo -e "${BOLD}============================================${RESET}"
echo -e "  Resource group : ${RESOURCE_GROUP}"
echo -e "  App name       : ${APP_NAME}"
echo -e "  Location       : ${LOCATION}"
echo -e "  SKU            : ${SKU} (no cost)"
echo -e "${BOLD}============================================${RESET}"
echo ""

# ── Optional: open in browser ────────────────────────────────
read -rp "Open the live site in your browser now? [y/N] " OPEN_BROWSER
if [[ "${OPEN_BROWSER,,}" == "y" ]]; then
  if command -v open &>/dev/null; then          # macOS
    open "https://${HOSTNAME}"
  elif command -v xdg-open &>/dev/null; then    # Linux
    xdg-open "https://${HOSTNAME}"
  fi
fi
