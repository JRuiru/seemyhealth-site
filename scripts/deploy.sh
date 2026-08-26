#!/usr/bin/env bash
# Deploy SeeMyHealth — builds site + deploys Pages + BFF worker
# Usage: ./scripts/deploy.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/.."

# Read a single KEY=VALUE out of an env file. Deliberately does NOT source the
# file: these .env files hold unrelated secrets, and a stray line without a "="
# would otherwise be executed as a command.
read_env_var() {
  local file="$1" name="$2" line value
  line=$(grep -m1 -E "^[[:space:]]*(export[[:space:]]+)?${name}=" "$file" 2>/dev/null) || return 1
  value="${line#*=}"
  value="${value%\"}"; value="${value#\"}"
  value="${value%\'}"; value="${value#\'}"
  printf '%s' "$value"
}

# Load Cloudflare credentials unless they're already in the environment (CI
# supplies them from GitHub secrets). First file with a token wins; both are
# gitignored.
if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  for env_file in "$ROOT/.env" "$HOME/seemyhealth-providers/.env"; do
    [ -f "$env_file" ] || continue
    token=$(read_env_var "$env_file" CLOUDFLARE_API_TOKEN) || continue
    [ -n "$token" ] || continue
    export CLOUDFLARE_API_TOKEN="$token"
    account=$(read_env_var "$env_file" CLOUDFLARE_ACCOUNT_ID) || account=""
    [ -n "$account" ] && export CLOUDFLARE_ACCOUNT_ID="$account"
    echo "▸ Loaded Cloudflare credentials from $env_file"
    break
  done
fi

if [ -z "${CLOUDFLARE_API_TOKEN:-}" ]; then
  echo "✗ CLOUDFLARE_API_TOKEN not set and no .env found."
  echo "  Add it to $ROOT/.env or run 'npx wrangler login'."
  exit 1
fi

echo "═══════════════════════════════════════"
echo "  SeeMyHealth — Deploy"
echo "═══════════════════════════════════════"
echo ""

# 1. Build the Astro site
echo "▸ Building site..."
cd "$ROOT"
npm run build
echo "  ✓ Build complete"
echo ""

# 2. Deploy Cloudflare Pages (static site + SSR worker)
echo "▸ Deploying Pages..."
npx wrangler pages deploy dist/client \
  --project-name=seemyhealth-site \
  --commit-dirty=true
echo "  ✓ Pages deployed"
echo ""

# 3. Deploy BFF Worker
echo "▸ Deploying BFF worker..."
cd "$ROOT/workers/bff"
npx wrangler deploy -c wrangler.jsonc
echo "  ✓ BFF deployed"
echo ""

echo "═══════════════════════════════════════"
echo "  ✓ All deployed!"
echo "  → https://www.seemyhealth.ai"
echo "═══════════════════════════════════════"
