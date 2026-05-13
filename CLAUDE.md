# SeeMyHealth Website

Premium medical-grade health monitoring device ecommerce site. See `ARCHITECTURE.md` for the full architecture plan.

## Tech Stack

- **Framework:** Astro 6.3 with SSR on Cloudflare Workers
- **Styling:** Tailwind CSS 4 (theme in `src/styles/global.css`)
- **Animations:** GSAP 3.15 + ScrollTrigger + Lenis smooth scroll
- **Hosting:** Cloudflare Pages + Workers
- **Media:** Cloudflare Images (`imagedelivery.net/NnC2JvU8j4bgBbmedVhjJg`) + Cloudflare Stream
- **Commerce:** Shopify headless (Storefront API via BFF Worker, Customer Account API via OAuth PKCE)
- **Email:** Klaviyo + SendGrid (templates in separate ReactSend project)

## Commands

```bash
# Astro frontend (Cloudflare Pages)
npm run dev          # Dev server
npm run build        # Production build
npx wrangler pages deploy dist/client --project-name seemyhealth-site  # Deploy frontend

# BFF Worker (Cloudflare Worker)
cd workers/bff
npm run dev           # Local dev (port 8787)
npx wrangler deploy --config wrangler.jsonc  # Deploy worker

# Shopify product seed (one-time)
SHOPIFY_STORE_DOMAIN=shop.seemyhealth.ai SHOPIFY_ADMIN_TOKEN=shpat_xxx npx tsx scripts/seed-products.ts
```

**Important:** Deploy `dist/client` NOT `dist` — Astro's Cloudflare adapter splits output into `dist/client` (static) and `dist/server` (worker).

## Project Structure

```
src/
  components/     # Astro components (homepage sections, product page sections, nav, footer)
  components/commerce/  # Cart, variant selector, add-to-cart (React islands)
  data/           # products.ts — single source of truth for all 5 devices
  layouts/        # Layout.astro — base HTML template
  lib/shopify/    # Frontend cart client (talks to BFF Worker, never directly to Shopify)
  pages/          # index, app, shop, about, support, privacy, terms, products/[slug]
  scripts/        # animations.ts — all GSAP/ScrollTrigger/Lenis animations
  styles/         # global.css — Tailwind theme + custom properties
workers/
  bff/            # Cloudflare Worker BFF — API proxy for Shopify cart/webhooks
scripts/
  seed-products.ts  # One-time Shopify product creation via Admin API
```

## Products (6 devices)

| Device | Slug | Color | Variants | Shopify ID | Stream ID |
|--------|------|-------|----------|------------|-----------|
| Ring One | ring-one | #F97316 | Phantom Black / Aurora Gold × sizes 6–13 | 7643546812529 | 2dddbe4d3032da2f23af4ada53b92953 |
| The Scale | scale | #3B82F6 | Obsidian Black / Frost White | 7643546878065 | 20a7b78a3a620e0cbb8b861bb65af913 |
| Scale Pro | scale-pro | #3B82F6 | Obsidian Black / Frost White | 7643546943601 | — |
| BP Monitor | bp-monitor | #EF4444 | Carbon Black / Opal White | 7643547009137 | 414b8ac36adafae24dc9750438174d9a |
| Hydra One | hydra-one | #06B6D4 | Abyss Black / Glacier White | 7643547041905 | 09fe15a09d3e2ad17189fbc7d758bc52 |
| Hema One | hema-one | #A855F7 | Single variant | 7643547074673 | 8f576ad01105f0b3c8ff5495c066906e |

## Key Patterns

- All pages use `export const prerender = true` (static generation)
- Images served via Cloudflare Images: `${CF_IMG}/[slug]/public`
- Videos served via Cloudflare Stream direct MP4 downloads (not iframe)
- Animation targeting uses `data-*` attributes (e.g., `data-scroll-reveal`, `data-flip-face`)
- Navbar has 3 variants: `transparent` (homepage), `product` (product pages), `default` (other)
- Product data is centralized in `src/data/products.ts`

## Cloudflare Account

- Account ID: `54224eb92112a4d5ebb72d97a7123203`
- Images/Stream are active
- API token name: `lucky-pond`

## Architecture Audit Status

### Done
- [x] Astro frontend with SSR on Cloudflare Workers
- [x] Tailwind CSS theming with brand colors
- [x] GSAP + Lenis animation system
- [x] Homepage storytelling flow (Hero > EcosystemVision > Products > Stats > AppShowcase > HowItWorks > Testimonials > CTA)
- [x] Product pages with hero, features, specs, gallery, video, cross-sell
- [x] Navbar with transparent/product/default variants
- [x] Cloudflare Images migration (all product/lifestyle images)
- [x] Cloudflare Stream migration (all product videos)
- [x] Responsive design
- [x] Klaviyo email templates (6 Shopify flows)
- [x] SendGrid email templates (13 app flows)
- [x] EcosystemVision orbit animation with satellite collapse

### In Progress — Infrastructure
- [x] Shopify Storefront API integration — BFF Worker with cart create/add/update/remove/get
- [x] Cloudflare Worker BFF layer (`workers/bff/`) — routes, CORS, webhook HMAC validation
- [x] Cart architecture (variant selection > BFF Worker > Shopify Cart API > checkout URL)
- [x] Frontend cart client (`src/lib/shopify/cart-client.ts`) — localStorage cart ID, event dispatch
- [x] Product seed script (`scripts/seed-products.ts`) — creates all 6 products via Admin API
- [x] Cloudflare Secrets setup — 9 secrets configured (encrypted at rest, write-only)
- [x] Deploy BFF Worker to production — live at `www.seemyhealth.ai/api/*`
- [x] Customer Account API — OAuth 2.0 PKCE flow (login, callback, refresh, logout, me)
- [x] Google OAuth social login for Shopify customers
- [x] Admin API token auto-refresh via client credentials grant (`admin-token.ts`)
- [x] Shopify Markets — 9 markets with PPP pricing (US primary)
- [x] Inventory set across 4 locations (Nairobi, Qatar, US, Shenzhen)
- [x] Products published to Storefront API + Online Store channels
- [x] Add-to-cart UI components
- [x] Variant selector components
- [x] Cart drawer component

### Blocked — Checkout (needs payment provider + Shopify config)
- [ ] Enable Shopify Payments (or Paystack/Flutterwave) once bank account is set up
- [ ] Remove storefront password on shop.seemyhealth.ai (Shopify Admin > Online Store > Preferences)
- [ ] Verify Headless sales channel is configured for checkout URLs
- [ ] Test end-to-end checkout flow (add to cart > checkout > payment > order confirmation)

### Not Started — Analytics
- [ ] Google Analytics 4 setup
- [ ] PostHog integration (scroll depth, CTA clicks, heatmaps, session replay)
- [ ] Meta Pixel (page views, product views, add to cart, purchase events)
- [ ] TikTok Pixel
- [ ] Server-side tracking via Cloudflare Worker dispatch

### Done — SEO
- [x] Open Graph meta tags (og:title, og:description, og:image, og:url, og:type, og:site_name)
- [x] Twitter Card meta tags (summary_large_image)
- [x] Canonical URLs on all pages
- [x] JSON-LD: Organization + WebSite (homepage)
- [x] JSON-LD: Product + BreadcrumbList (product pages)
- [x] JSON-LD: FAQPage (support page — all 30+ questions)
- [x] JSON-LD: SoftwareApplication (app page)
- [x] JSON-LD: AboutPage (about page)
- [x] Sitemap (@astrojs/sitemap — auto-generated sitemap-index.xml)
- [x] robots.txt (allows all, blocks /api/, points to sitemap)
- [x] noindex on privacy/terms pages
- [x] Keyword-rich descriptions targeting: smart ring, smart scale, smart water bottle, blood pressure monitor, mood tracking, journalling, community challenges

### Not Started — 3D / Immersive
- [ ] React Three Fiber setup
- [ ] Ring One 3D product viewer
- [ ] Exploded product views
- [ ] GLB models (Draco compressed, KTX2 textures)
- [ ] `client:visible` hydration for 3D scenes
- [ ] `client:media` for desktop-only scenes

### Not Started — Accessibility
- [ ] `prefers-reduced-motion` support in animations.ts
- [ ] Keyboard navigation for all interactive elements
- [ ] ARIA labels on custom components
- [ ] Focus management for mobile menu

### Not Started — Commerce Features
- [ ] Product variant selector on product pages
- [ ] Reviews section
- [ ] Comparison section
- [ ] FAQ per product

### Shopify Markets (13 markets)
- US (primary, 0%), Canada (-5%), UK (0%), EU (0%), Qatar (+10%), Middle East (+5%)
- South Africa (-25%), East Africa (-35%), West Africa (-30%)
- China (-20%), Japan & Korea (0%), Southeast Asia (-25%), India (-20%)

### Warehouse Locations
- Nairobi (77833240689), Qatar (77599998065), US (77833273457), Shenzhen (77858472049)

### Not Started — Social Commerce
- [ ] Instagram Shop (via Shopify)
- [ ] Facebook Shop (via Shopify)
- [ ] TikTok Shop (via Shopify)
- [ ] Google Shopping feed (via Shopify)

### Not Started — Support & Returns
- [ ] Gorgias integration
- [ ] Loop Returns integration

### Not Started — Folder Restructure
- [ ] `src/lib/shopify/` — Storefront API client, cart helpers
- [ ] `src/lib/analytics/` — event tracking, pixel helpers
- [ ] `src/lib/animations/` — extracted from monolithic animations.ts
- [ ] `src/components/commerce/` — cart, variant selector, add-to-cart
- [ ] `src/components/analytics/` — tracking scripts, pixel components
- [ ] `src/components/three/` — R3F scenes
- [ ] `src/components/gsap/` — animation-heavy components
- [ ] `src/components/ui/` — buttons, inputs, modals
- [ ] `src/content/` — blog, content collections

### Needs Fixing
- [ ] EcosystemVision satellite collapse animation (currently too fast/invisible on scrub)
- [ ] Satellite image quality during orbit rotation
- [ ] Mobile video playback consistency
- [ ] Homepage section spacing/polish

### Site Audit (2026-05-13) — Fix one by one

1. [x] **Remaining em/en dashes** — Replaced " — " with " | " in all 19 page titles. Fixed alt text and table dash in app.astro. En dashes in number ranges (3–5, 5–10, etc.) kept as acceptable.
2. [x] **Homepage meta description** — Added tailored description to index.astro Layout component.
3. [x] **Lazy loading on images** — Added `loading="lazy"` to 25 img tags across 16 files. Skipped above-the-fold (Hero, Navbar, Footer logo).
4. [x] **Favicon cleanup** — Removed stale Astro default favicon.ico and favicon.svg from /public/. Added proper sizes to favicon and apple-touch-icon links.
5. [ ] **Footer social links** — All 5 social icons (Instagram, X, TikTok, YouTube, Facebook) in Footer.astro point to href="#". Replace with real profile URLs once accounts are created.
6. [ ] **Business page download buttons** — business/index.astro, business/providers.astro, business/insurance.astro all have "Download" buttons pointing to href="#". Need real PDF assets or remove buttons.
7. [x] **Support page CTA** — Already commented out, not rendered. No fix needed.
8. [x] **Shop page placeholder link** — Is a "Back to top" scroll button with JS handler. Working as intended.
9. [x] **Hema One "Coming Soon" status** — Intentional. Product is not yet available for purchase.
10. [x] **Decorative image accessibility** — Added `aria-hidden="true"` to decorative images in ProductSpecs.astro and ProductConfigurator.tsx.
11. [x] **FAQPage schema** — Already exists on support/index.astro (line 241). No fix needed.
12. [x] **Web app manifest** — Not needed. Site is not meant to be installed as a PWA. Removed manifest. Kept theme-color meta only.
