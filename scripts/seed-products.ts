// Seed script to create the 5 SeeMyHealth products in Shopify
// Run with: npx tsx scripts/seed-products.ts
//
// Requires environment variables:
//   SHOPIFY_STORE_DOMAIN=shop.seemyhealth.ai
//   SHOPIFY_ADMIN_TOKEN=shpat_xxxxx
//
// This uses the Shopify Admin REST API to create products with variants.

const STORE_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const ADMIN_TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = "2025-04";

if (!STORE_DOMAIN || !ADMIN_TOKEN) {
  console.error("Set SHOPIFY_STORE_DOMAIN and SHOPIFY_ADMIN_TOKEN env vars");
  process.exit(1);
}

const BASE = `https://${STORE_DOMAIN}/admin/api/${API_VERSION}`;

async function adminFetch(path: string, body: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": ADMIN_TOKEN!,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify Admin ${res.status}: ${text}`);
  }

  return res.json();
}

interface ProductDef {
  title: string;
  handle: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string[];
  variants: {
    title: string;
    price: string;
    sku: string;
    inventory_management: string;
    option1?: string;
    option2?: string;
  }[];
  options?: { name: string; values: string[] }[];
}

const products: ProductDef[] = [
  {
    title: "Ring One",
    handle: "ring-one",
    body_html: "24/7 heart rate, SpO2, sleep stages, activity tracking, and stress monitoring — all from a ring designed for daily wear.",
    vendor: "SeeMyHealth",
    product_type: "Wearable",
    tags: ["ring", "wearable", "heart-rate", "sleep", "spo2"],
    options: [
      { name: "Finish", values: ["Phantom Black", "Aurora Gold"] },
      { name: "Size", values: ["6", "7", "8", "9", "10", "11", "12", "13"] },
    ],
    variants: [
      // Phantom Black sizes
      ...["6", "7", "8", "9", "10", "11", "12", "13"].map((size) => ({
        title: `Phantom Black / ${size}`,
        price: "179.99",
        sku: `RING-BLK-${size}`,
        inventory_management: "shopify" as const,
        option1: "Phantom Black",
        option2: size,
      })),
      // Aurora Gold sizes
      ...["6", "7", "8", "9", "10", "11", "12", "13"].map((size) => ({
        title: `Aurora Gold / ${size}`,
        price: "199.99",
        sku: `RING-GLD-${size}`,
        inventory_management: "shopify" as const,
        option1: "Aurora Gold",
        option2: size,
      })),
    ],
  },
  {
    title: "The Scale",
    handle: "scale",
    body_html: "Full body composition analysis with 4-point BIA for essential metrics. Step on, and see everything in the app instantly.",
    vendor: "SeeMyHealth",
    product_type: "Scale",
    tags: ["scale", "body-composition", "weight", "bmi"],
    options: [{ name: "Color", values: ["Obsidian Black", "Frost White"] }],
    variants: [
      { title: "Obsidian Black", price: "99.99", sku: "SCALE-BLK", inventory_management: "shopify", option1: "Obsidian Black" },
      { title: "Frost White", price: "99.99", sku: "SCALE-WHT", inventory_management: "shopify", option1: "Frost White" },
    ],
  },
  {
    title: "Scale Pro",
    handle: "scale-pro",
    body_html: "8-point dual-frequency BIA with segmental analysis. Retractable handle for clinical-grade precision. See body fat and muscle mass for each arm, each leg, and your trunk.",
    vendor: "SeeMyHealth",
    product_type: "Scale",
    tags: ["scale", "body-composition", "weight", "segmental", "pro"],
    options: [{ name: "Color", values: ["Obsidian Black", "Frost White"] }],
    variants: [
      { title: "Obsidian Black", price: "199.99", sku: "SCALE-PRO-BLK", inventory_management: "shopify", option1: "Obsidian Black" },
      { title: "Frost White", price: "199.99", sku: "SCALE-PRO-WHT", inventory_management: "shopify", option1: "Frost White" },
    ],
  },
  {
    title: "BP Monitor",
    handle: "bp-monitor",
    body_html: "Accurate blood pressure readings with irregular heartbeat detection. Validated against clinical standards. FDA cleared, CE marked.",
    vendor: "SeeMyHealth",
    product_type: "Monitor",
    tags: ["blood-pressure", "heart", "medical", "fda-cleared"],
    options: [{ name: "Color", values: ["Carbon Black", "Opal White"] }],
    variants: [
      { title: "Carbon Black", price: "89.99", sku: "BP-MON-BLK", inventory_management: "shopify", option1: "Carbon Black" },
      { title: "Opal White", price: "89.99", sku: "BP-MON-WHT", inventory_management: "shopify", option1: "Opal White" },
    ],
  },
  {
    title: "Hydra One",
    handle: "hydra-one",
    body_html: "Smart water bottle that tracks your daily intake automatically. LED ring shows your progress. Gentle reminders keep you on track.",
    vendor: "SeeMyHealth",
    product_type: "Bottle",
    tags: ["hydration", "water", "smart-bottle"],
    options: [{ name: "Color", values: ["Abyss Black", "Glacier White"] }],
    variants: [
      { title: "Abyss Black", price: "59.99", sku: "HYDRA-BLK", inventory_management: "shopify", option1: "Abyss Black" },
      { title: "Glacier White", price: "59.99", sku: "HYDRA-WHT", inventory_management: "shopify", option1: "Glacier White" },
    ],
  },
  {
    title: "Hema One",
    handle: "hema-one",
    body_html: "At-home blood analysis for key health markers. A small sample from your fingertip gives you lab-quality results in minutes.",
    vendor: "SeeMyHealth",
    product_type: "Analyzer",
    tags: ["blood", "glucose", "cholesterol", "hemoglobin", "medical"],
    variants: [
      { title: "Default", price: "99.99", sku: "HEMA-ONE", inventory_management: "shopify" },
    ],
  },
];

async function seed() {
  console.log("Seeding products to Shopify...\n");

  for (const product of products) {
    try {
      const result = await adminFetch("/products.json", { product });
      const created = (result as { product: { id: number; title: string } }).product;
      console.log(`  Created: ${created.title} (ID: ${created.id})`);
    } catch (err) {
      console.error(`  Failed: ${product.title} — ${err}`);
    }
  }

  console.log("\nDone! Product handles match the site slugs (ring-one, scale, bp-monitor, hydra-one, hema-one).");
  console.log("Scale Pro is a separate product since it has different pricing/specs.");
}

seed();
