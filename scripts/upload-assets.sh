#!/usr/bin/env bash
# Upload images, videos, and 3D models to Cloudflare Images / R2
# Usage: ./scripts/upload-assets.sh <file-or-directory> [custom-id]
#
# Examples:
#   ./scripts/upload-assets.sh ~/Desktop/RingOne/DSC06187.jpg ring-photo-01
#   ./scripts/upload-assets.sh ~/Desktop/RingOne/                            # batch upload entire folder
#
# Reads CF credentials from .env:
#   CLOUDFLARE_ACCOUNT_ID
#   CLOUDFLARE_API_TOKEN  (lucky-pond token)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="$SCRIPT_DIR/../.env"

# Load .env
if [[ -f "$ENV_FILE" ]]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

: "${CLOUDFLARE_ACCOUNT_ID:?Set CLOUDFLARE_ACCOUNT_ID in .env}"
: "${CLOUDFLARE_API_TOKEN:?Set CLOUDFLARE_API_TOKEN in .env}"

API_BASE="https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}"
IMAGES_URL="${API_BASE}/images/v1"

# Map of extensions to upload method
upload_image() {
  local file="$1"
  local custom_id="$2"

  echo "⬆  Uploading image: $(basename "$file") → $custom_id"

  local response
  response=$(curl -s -w "\n%{http_code}" \
    -X POST "$IMAGES_URL" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -F "file=@$file" \
    -F "id=$custom_id")

  local http_code
  http_code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" == "200" ]]; then
    local variant_url
    variant_url=$(echo "$body" | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['variants'][0])" 2>/dev/null || echo "")
    echo "   ✓ Done → $variant_url"
  elif echo "$body" | grep -q "ERROR 5409"; then
    echo "   ⊘ Already exists (skipping)"
  else
    echo "   ✗ Failed (HTTP $http_code)"
    echo "     $body" | head -3
  fi
}

# Derive a slug from filename: DSC06187.jpg → dsc06187, SMH-Ring-Aurora-Gold-Web.glb → smh-ring-aurora-gold-web
slugify() {
  local name="${1%.*}"                     # strip extension
  echo "$name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g' | sed 's/--*/-/g' | sed 's/^-//;s/-$//'
}

# --- Main ---

INPUT="${1:?Usage: $0 <file-or-directory> [custom-id]}"
CUSTOM_ID="${2:-}"

if [[ -f "$INPUT" ]]; then
  # Single file
  ext="${INPUT##*.}"
  ext_lower=$(echo "$ext" | tr '[:upper:]' '[:lower:]')
  id="${CUSTOM_ID:-$(slugify "$(basename "$INPUT")")}"

  case "$ext_lower" in
    jpg|jpeg|png|gif|webp|svg|avif)
      upload_image "$INPUT" "$id"
      ;;
    mp4|webm|mov)
      echo "⬆  Video file detected: $(basename "$INPUT")"
      echo "   Cloudflare Images doesn't support video."
      echo "   Uploading to Cloudflare Stream instead..."

      response=$(curl -s -w "\n%{http_code}" \
        -X POST "${API_BASE}/stream" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -F "file=@$INPUT" \
        -F "meta={\"name\":\"$id\"}")

      http_code=$(echo "$response" | tail -1)
      body=$(echo "$response" | sed '$d')

      if [[ "$http_code" == "200" ]]; then
        uid=$(echo "$body" | python3 -c "import sys,json; print(json.load(sys.stdin)['result']['uid'])" 2>/dev/null || echo "unknown")
        # Enable MP4 downloads automatically
        curl -s -X POST "${API_BASE}/stream/${uid}/downloads" \
          -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
          -H "Content-Type: application/json" > /dev/null 2>&1
        echo "   ✓ Stream UID: $uid"
        echo "   ✓ MP4 URL: https://customer-5zjora8ha9v60sg3.cloudflarestream.com/$uid/downloads/default.mp4"
        echo "   ✓ Downloads enabled"
      else
        echo "   ✗ Failed (HTTP $http_code)"
        echo "     $body" | head -3
      fi
      ;;
    glb|gltf)
      echo "⬆  3D model detected: $(basename "$INPUT")"
      echo "   Uploading as image (Cloudflare will store the binary)..."
      echo "   Note: If CF Images rejects .glb, we'll fall back to R2 or public/ folder."

      # Try uploading as a regular file — CF Images may reject non-image types
      response=$(curl -s -w "\n%{http_code}" \
        -X POST "$IMAGES_URL" \
        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
        -F "file=@$INPUT" \
        -F "id=$id")

      http_code=$(echo "$response" | tail -1)
      body=$(echo "$response" | sed '$d')

      if [[ "$http_code" == "200" ]]; then
        echo "   ✓ Uploaded to CF Images as $id"
      else
        echo "   ⊘ CF Images rejected .glb — copying to public/models/ instead"
        mkdir -p "$SCRIPT_DIR/../public/models"
        cp "$INPUT" "$SCRIPT_DIR/../public/models/$id.glb"
        echo "   ✓ Copied to public/models/$id.glb"
        echo "   → Serve at: /models/$id.glb"
      fi
      ;;
    *)
      echo "   ? Unknown file type: $ext_lower — skipping"
      ;;
  esac

elif [[ -d "$INPUT" ]]; then
  # Directory — batch upload everything
  echo "Batch uploading from: $INPUT"
  echo "---"

  count=0
  for file in "$INPUT"/*; do
    [[ -f "$file" ]] || continue
    [[ "$(basename "$file")" == .DS_Store ]] && continue

    "$0" "$file"
    count=$((count + 1))
    echo ""
  done

  echo "---"
  echo "Processed $count files."
else
  echo "Error: $INPUT is not a file or directory"
  exit 1
fi
