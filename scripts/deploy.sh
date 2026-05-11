#!/usr/bin/env bash
# Deploy SeeMyHealth — builds site + deploys Pages + BFF worker
# Usage: ./scripts/deploy.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$SCRIPT_DIR/.."

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
