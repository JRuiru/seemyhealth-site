/**
 * Upload product images from Cloudflare Images to Shopify
 *
 * Run with:
 *   SHOPIFY_STORE_DOMAIN=shop.seemyhealth.ai SHOPIFY_ADMIN_TOKEN=shpat_xxx npx tsx scripts/upload-images-to-shopify.ts
 *
 * This script reads all image URLs from src/data/variants.ts media entries
 * and uploads them to the matching Shopify product via the Admin REST API.
 * Shopify fetches the images directly from the Cloudflare URLs.
 *
 * Options:
 *   --dry-run   Print what would be uploaded without actually uploading
 *   --product   Only upload for a specific product slug (e.g. --product ring-one)
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env file
const envPath = resolve(import.meta.dirname || __dirname, "../.env");
try {
  const envContent = readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {}

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const MYSHOPIFY_DOMAIN = process.env.SHOPIFY_MYSHOPIFY_DOMAIN;
const APP_API_KEY = process.env.SHOPIFY_APP_API_KEY;
const APP_API_SECRET = process.env.SHOPIFY_APP_API_SECRET;
const API_VERSION = "2025-04";

if (!STORE_DOMAIN || !MYSHOPIFY_DOMAIN || !APP_API_KEY || !APP_API_SECRET) {
  console.error("Missing env vars. Need: SHOPIFY_STORE_DOMAIN, SHOPIFY_MYSHOPIFY_DOMAIN, SHOPIFY_APP_API_KEY, SHOPIFY_APP_API_SECRET");
  process.exit(1);
}

// Fetch admin token via client credentials grant (same as BFF worker)
async function getAdminToken(): Promise<string> {
  const res = await fetch(`https://${MYSHOPIFY_DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=client_credentials&client_id=${APP_API_KEY}&client_secret=${APP_API_SECRET}`,
  });
  if (!res.ok) throw new Error(`Admin token exchange failed: ${res.status} ${await res.text()}`);
  const data = await res.json() as { access_token: string };
  return data.access_token;
}

let ADMIN_TOKEN: string;

const BASE = `https://${MYSHOPIFY_DOMAIN}/admin/api/${API_VERSION}`;
const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");
const productFilter = args.find((a) => a.startsWith("--product="))?.split("=")[1]
  || (args.includes("--product") ? args[args.indexOf("--product") + 1] : null);

// Shopify product IDs from CLAUDE.md
const SHOPIFY_PRODUCT_IDS: Record<string, number> = {
  "ring-one": 7643546812529,
  "scale": 7643546878065,
  "scale-pro": 7643546943601,
  "bp-monitor": 7643547009137,
  "hydra-one": 7643547041905,
  "hema-one": 7643547074673,
};

const CF_IMG = "https://imagedelivery.net/NnC2JvU8j4bgBbmedVhjJg";

// All configurator images by product, extracted from variants.ts
// Only image type entries (not video or model), plus poster images
interface ImageEntry {
  src: string;
  alt: string;
  variantColor?: string;
}

const PRODUCT_IMAGES: Record<string, ImageEntry[]> = {
  "ring-one": [
    // Phantom Black
    { src: `${CF_IMG}/ring-phantom-black-poster/public`, alt: "Ring One Phantom Black — hero", variantColor: "Phantom Black" },
    { src: `${CF_IMG}/ring-photo-07/public`, alt: "Ring One Phantom Black — dining", variantColor: "Phantom Black" },
    { src: `${CF_IMG}/ring-phantom-chair-hand/public`, alt: "Ring One Phantom Black — hand on chair", variantColor: "Phantom Black" },
    { src: `${CF_IMG}/ring-phantom-bowl-kitchen/public`, alt: "Ring One Phantom Black — in the kitchen", variantColor: "Phantom Black" },
    { src: `${CF_IMG}/ring-photo-11/public`, alt: "Ring One Phantom Black — hand detail", variantColor: "Phantom Black" },
    // Aurora Gold
    { src: `${CF_IMG}/ring-aurora-gold-poster/public`, alt: "Ring One Aurora Gold — hero", variantColor: "Aurora Gold" },
    { src: `${CF_IMG}/ring-photo-03/public`, alt: "Ring One Aurora Gold — working", variantColor: "Aurora Gold" },
    { src: `${CF_IMG}/ring-photo-08/public`, alt: "Ring One Aurora Gold — fitness", variantColor: "Aurora Gold" },
    { src: `${CF_IMG}/ring-photo-09/public`, alt: "Ring One Aurora Gold — close-up hand", variantColor: "Aurora Gold" },
    { src: `${CF_IMG}/ring-photo-10/public`, alt: "Ring One Aurora Gold — face detail", variantColor: "Aurora Gold" },
  ],
  "scale": [
    { src: `${CF_IMG}/scale-base-black-config/public`, alt: "The Scale Obsidian Black — hero", variantColor: "Obsidian Black" },
    { src: `${CF_IMG}/scale-black-bathroom/public`, alt: "Scale Obsidian Black on bathroom counter", variantColor: "Obsidian Black" },
    { src: `${CF_IMG}/scale-black-nutritionist/public`, alt: "Scale in nutritionist office", variantColor: "Obsidian Black" },
    { src: `${CF_IMG}/scale-base-white-config/public`, alt: "The Scale Frost White — hero", variantColor: "Frost White" },
    { src: `${CF_IMG}/scale-white-portrait/public`, alt: "Scale Frost White portrait", variantColor: "Frost White" },
    { src: `${CF_IMG}/scale-white-bathroom/public`, alt: "Scale Frost White in bathroom", variantColor: "Frost White" },
  ],
  "scale-pro": [
    { src: `${CF_IMG}/scale-pro-black-config/public`, alt: "Scale Pro Obsidian Black — hero", variantColor: "Obsidian Black" },
    { src: `${CF_IMG}/scale-pro-black-bathroom/public`, alt: "Scale Pro Obsidian Black in dark bathroom", variantColor: "Obsidian Black" },
    { src: `${CF_IMG}/scale-pro-using/public`, alt: "Scale Pro in use", variantColor: "Obsidian Black" },
    { src: `${CF_IMG}/scale-pro-white-config/public`, alt: "Scale Pro Frost White — hero", variantColor: "Frost White" },
    { src: `${CF_IMG}/scale-pro-white-marble/public`, alt: "Scale Pro Frost White on marble counter", variantColor: "Frost White" },
    { src: `${CF_IMG}/scale-pro-white-bathroom/public`, alt: "Scale Pro Frost White in bathroom", variantColor: "Frost White" },
    { src: `${CF_IMG}/scale-pro-white-gym/public`, alt: "Scale Pro Frost White in fitness suite", variantColor: "Frost White" },
  ],
  "bp-monitor": [
    { src: `${CF_IMG}/bp-black-poster/public`, alt: "BP Monitor Carbon Black — hero", variantColor: "Carbon Black" },
    { src: `${CF_IMG}/bp-black-desk-portrait/public`, alt: "BP Monitor black on desk", variantColor: "Carbon Black" },
    { src: `${CF_IMG}/bp-desk-display/public`, alt: "BP Monitor displaying reading", variantColor: "Carbon Black" },
    { src: `${CF_IMG}/bp-black-studio/public`, alt: "BP Monitor Carbon Black studio", variantColor: "Carbon Black" },
    { src: `${CF_IMG}/bp-white-poster/public`, alt: "BP Monitor Opal White — hero", variantColor: "Opal White" },
    { src: `${CF_IMG}/bp-white-desk-display/public`, alt: "BP Monitor Opal White on desk", variantColor: "Opal White" },
    { src: `${CF_IMG}/bp-white-living-room/public`, alt: "BP Monitor Opal White in living room", variantColor: "Opal White" },
    { src: `${CF_IMG}/bp-white-studio/public`, alt: "BP Monitor Opal White studio", variantColor: "Opal White" },
  ],
  "hydra-one": [
    { src: `${CF_IMG}/bottle-black-config/public`, alt: "Hydra One Abyss Black — hero", variantColor: "Abyss Black" },
    { src: `${CF_IMG}/bottle-black-desk/public`, alt: "Hydra One black on desk", variantColor: "Abyss Black" },
    { src: `${CF_IMG}/bottle-black-gym-v2/public`, alt: "Hydra One black in gym", variantColor: "Abyss Black" },
    { src: `${CF_IMG}/bottle-treebark/public`, alt: "Hydra One Abyss Black", variantColor: "Abyss Black" },
    { src: `${CF_IMG}/bottle-black-picnic/public`, alt: "Hydra One Abyss Black in picnic basket", variantColor: "Abyss Black" },
    { src: `${CF_IMG}/bottle-white-config/public`, alt: "Hydra One Glacier White — hero", variantColor: "Glacier White" },
    { src: `${CF_IMG}/bottle-white-cafe-v2/public`, alt: "Hydra One white in cafe", variantColor: "Glacier White" },
    { src: `${CF_IMG}/bottle-white-park/public`, alt: "Hydra One white in park", variantColor: "Glacier White" },
    { src: `${CF_IMG}/bottle-white-office/public`, alt: "Hydra One white on office desk with city view", variantColor: "Glacier White" },
    { src: `${CF_IMG}/bottle-white-kitchen/public`, alt: "Hydra One white on kitchen counter", variantColor: "Glacier White" },
  ],
  "hema-one": [
    { src: `${CF_IMG}/hema-black-poster/public`, alt: "Hema One Stealth Black — hero", variantColor: "Stealth Black" },
    { src: `${CF_IMG}/hema-black-lab/public`, alt: "Hema One Stealth Black on lab desk", variantColor: "Stealth Black" },
    { src: `${CF_IMG}/hema-black-bedside/public`, alt: "Hema One Stealth Black on bedside table", variantColor: "Stealth Black" },
    { src: `${CF_IMG}/hema-black-hand-v2/public`, alt: "Hema One Stealth Black in hand", variantColor: "Stealth Black" },
    { src: `${CF_IMG}/hema-orange-poster/public`, alt: "Hema One Ember Orange — hero", variantColor: "Ember Orange" },
    { src: `${CF_IMG}/hema-orange-kitchen-v2/public`, alt: "Hema One Ember Orange on kitchen counter", variantColor: "Ember Orange" },
    { src: `${CF_IMG}/hema-orange-clinic/public`, alt: "Hema One Ember Orange on clinic desk", variantColor: "Ember Orange" },
    { src: `${CF_IMG}/hema-orange-doctor/public`, alt: "Doctor holding Hema One Ember Orange", variantColor: "Ember Orange" },
  ],
};

async function adminFetch(method: string, path: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify Admin ${method} ${path} → ${res.status}: ${text}`);
  }

  return res.json();
}

async function getExistingImages(productId: number): Promise<Set<string>> {
  const data = await adminFetch("GET", `/products/${productId}/images.json`);
  const existing = new Set<string>();
  for (const img of data.images || []) {
    // Shopify rewrites src URLs, so we check alt text to avoid duplicates
    if (img.alt) existing.add(img.alt);
  }
  return existing;
}

async function uploadImage(productId: number, entry: ImageEntry, position: number) {
  // Download image from Cloudflare and upload as base64 attachment
  const imgRes = await fetch(entry.src);
  if (!imgRes.ok) throw new Error(`Failed to download ${entry.src}: ${imgRes.status}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  const b64 = buf.toString("base64");

  // Derive filename from the Cloudflare image ID
  const cfId = entry.src.split("/").slice(-2, -1)[0]; // e.g. "ring-phantom-black-poster"
  const ext = imgRes.headers.get("content-type")?.includes("png") ? "png" : "jpg";

  const payload = {
    image: {
      attachment: b64,
      filename: `${cfId}.${ext}`,
      alt: entry.alt,
      position,
    },
  };

  return adminFetch("POST", `/products/${productId}/images.json`, payload);
}

async function main() {
  console.log("Fetching Shopify Admin token...");
  ADMIN_TOKEN = await getAdminToken();
  console.log("✓ Token obtained\n");

  const slugs = productFilter ? [productFilter] : Object.keys(PRODUCT_IMAGES);

  for (const slug of slugs) {
    const productId = SHOPIFY_PRODUCT_IDS[slug];
    const images = PRODUCT_IMAGES[slug];

    if (!productId || !images) {
      console.error(`Unknown product: ${slug}`);
      continue;
    }

    console.log(`\n━━━ ${slug} (Shopify ID: ${productId}) ━━━`);

    // Check existing images to avoid duplicates
    const existing = await getExistingImages(productId);
    console.log(`  Existing images: ${existing.size}`);

    let uploaded = 0;
    let skipped = 0;

    for (let i = 0; i < images.length; i++) {
      const entry = images[i];

      if (existing.has(entry.alt)) {
        console.log(`  ⏭  [${i + 1}/${images.length}] "${entry.alt}" — already exists`);
        skipped++;
        continue;
      }

      if (DRY_RUN) {
        console.log(`  🔍 [${i + 1}/${images.length}] Would upload: "${entry.alt}"`);
        console.log(`      src: ${entry.src}`);
        uploaded++;
        continue;
      }

      try {
        console.log(`  ⬆  [${i + 1}/${images.length}] Uploading: "${entry.alt}"...`);
        await uploadImage(productId, entry, i + 1);
        uploaded++;
        console.log(`     ✓ Done`);

        // Respect Shopify rate limits (2 requests/sec for REST)
        await new Promise((r) => setTimeout(r, 600));
      } catch (err) {
        console.error(`     ✗ Failed: ${(err as Error).message}`);
      }
    }

    console.log(`  Summary: ${uploaded} uploaded, ${skipped} skipped (already existed)`);
  }

  console.log("\nDone!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
