# SeeMyHealth Complete Ecommerce & Frontend Architecture

## 1. Executive Summary

This document defines the complete architecture, infrastructure, frontend strategy, commerce integration, analytics stack, security model, deployment pipeline, and operational standards for the SeeMyHealth premium ecommerce and digital storytelling platform.

The platform is designed around a modern headless commerce architecture using:

- Astro
- Shopify
- Cloudflare
- GSAP
- React Three Fiber

The goal is to create:

- A premium luxury-grade ecommerce experience
- Immersive product storytelling
- Scalable infrastructure
- Strong SEO
- High performance
- Secure commerce operations
- Powerful conversion analytics
- Social commerce integrations

The target benchmark is comparable to premium wearable and consumer technology brands.

## 2. High-Level Architecture

```
User Browser
  |
Astro Frontend
  |
Cloudflare Pages / Workers
  |
Cloudflare Secret Management
  |
Shopify Storefront API
  |
Shopify Checkout
  |
Shopify Admin + Fulfillment
```

Additional integrations:
- Instagram Shop
- Facebook Shop
- TikTok Shop
- Google Shopping
- Shop App
- Klaviyo
- PostHog
- GA4
- Meta Pixel
- TikTok Pixel
- Gorgias
- Loop Returns

## 3. Core Architectural Philosophy

The system must maintain strict separation of concerns.

### Astro Responsibilities

- Premium frontend rendering
- Storytelling
- Landing pages
- SEO
- Blogs
- Immersive experiences
- Product education
- UI/UX
- Animations
- Product presentation

### Shopify Responsibilities

- Checkout
- Products
- Variants
- Inventory
- Orders
- Taxes
- Shipping
- Fulfillment
- Customer accounts
- Discounts
- Refunds

### Cloudflare Responsibilities

- CDN
- Workers
- Secret management
- Edge security
- Rate limiting
- Bot protection
- Edge analytics
- Server-side event dispatch

## 4. Frontend Technology Stack

### Core Stack

- Astro
- React
- TypeScript
- Tailwind CSS

### Animation Stack

- GSAP (with ScrollTrigger, SplitText, MotionPathPlugin, ScrollToPlugin)
- Lenis

### 3D Stack

- Three.js
- React Three Fiber
- Drei

## 5. Astro Rendering Philosophy

Astro must remain the orchestration layer.

The site must NOT become:
- A giant React SPA
- Globally hydrated
- Client-rendered everywhere

Correct architecture:
```
Astro Page
+-- Static HTML
+-- SEO metadata
+-- Shopify-rendered content
+-- Product descriptions
+-- Interactive islands
     +-- GSAP sections
     +-- R3F scenes
     +-- Motion components
```

Only interactive sections should hydrate.

## 6. Astro Hydration Strategy

### `client:load` for:
- Navbar animations
- Immediate GSAP animations
- Hero sections
- Critical motion systems

### `client:visible` for:
- Three.js scenes
- Heavy interactive sections
- Product viewers
- Immersive sections

### `client:media` for:
- Desktop-only immersive scenes
- Mobile simplification
- Responsive hydration

## 7. GSAP Standards

Use GSAP for:
- Scroll storytelling
- Section pinning
- Text reveals
- CTA transitions
- Timeline orchestration
- Premium motion systems

Animation philosophy: intentional, subtle, guided, cinematic.

Avoid: excessive parallax, infinite motion everywhere, distracting effects, over-animation.

## 8. Lenis Smooth Scrolling

Requirements:
- Premium scrolling feel
- Cinematic transitions
- Smoother storytelling
- Preserve accessibility
- Preserve keyboard navigation
- Support `prefers-reduced-motion`

## 9. React Three Fiber Standards

Use for:
- Smart ring visualization
- Exploded product views
- Immersive product scenes
- Material rendering
- Interactive product showcases

### Critical Rules

**Never use a global WebGL canvas** -- use isolated product-specific scenes.

**Lazy-load all scenes** -- use dynamic imports.

**Optimize all models:**
- GLB format
- Draco compression
- KTX2 textures

## 10. Asset Hosting Strategy

Large assets must NOT live inside the Astro repository.

Host externally using:
- Cloudflare R2
- Shopify CDN
- Cloudflare Images / Stream

Assets: GLB models, textures, HDRIs, videos, animations.

## 11. Performance Requirements

Target metrics:
- Lighthouse Performance: 90+
- Lighthouse SEO: 95+
- Lighthouse Accessibility: 90+
- LCP under 2.5s
- CLS under 0.1
- INP under 200ms

Required techniques: lazy loading, minimal hydration, dynamic imports, CDN caching, GPU-friendly transforms, optimized images, code splitting.

## 12. Mobile Rendering Strategy

Desktop may include: immersive 3D, advanced GSAP timelines, pinned storytelling.

Mobile must degrade gracefully: simplified shaders, reduced particles, shorter timelines, static fallbacks, lighter scenes.

## 13. SEO Requirements

Every page must include:
- Title tag
- Meta description
- Canonical URL
- Open Graph metadata
- Structured data (JSON-LD)
- Alt text
- Sitemap inclusion

Critical content must remain HTML-rendered. Canvas-only pages are prohibited for SEO-critical content.

## 14. Product Page Standards

Each product page must contain:
- Premium hero section
- Product overview
- Variant selector
- Add-to-cart
- FAQ
- Reviews
- Comparison section
- Technical specs
- CTA sections
- Structured data

## 15. Shopify Integration

Shopify handles: products, variants, inventory, checkout, taxes, shipping, orders, customer accounts, discounts, refunds, fulfillment.

Astro must NEVER:
- Process payments
- Store card data
- Build custom checkout

Checkout must always redirect to Shopify Checkout.

## 16. Cart Architecture

```
User selects variant
  |
Astro frontend
  |
Cloudflare Worker API
  |
Shopify Cart API
  |
Checkout URL returned
  |
Redirect to Shopify Checkout
```

Never expose Admin API tokens to the browser.

## 17. Customer Account Strategy

**Shopify account** -- purchases, shipping, order history.

**SeeMyHealth account** -- device pairing, wellness platform, health data, subscriptions.

This separation supports: gifting, shared ownership, cleaner architecture, privacy separation.

## 18. Cloudflare Worker / Backend-for-Frontend Layer

A Cloudflare Worker or Astro server endpoint must sit between the frontend and sensitive APIs.

Use Workers for:
- Cart creation/updates
- Webhook validation
- Analytics dispatch
- Shopify Admin API access
- Rate limiting
- Bot protection
- Request validation
- Secure backend communication

## 19. Secret Management Standards

Never expose:
- Shopify Admin API tokens
- Private Storefront API tokens
- Klaviyo private keys
- Meta access tokens
- TikTok access tokens
- Backend service tokens

Store all sensitive values in Cloudflare Secrets / Worker runtime bindings.

## 20. Analytics Architecture

### Infrastructure Analytics -- Cloudflare Analytics
Tracks: requests, bandwidth, cache hits, edge performance, bot traffic, latency.

### Web Analytics -- Google Analytics 4
Tracks: traffic sources, acquisition, funnels, sessions, conversion paths.

### Product Analytics -- PostHog
Tracks: scroll depth, CTA clicks, engagement, heatmaps, session replay, funnels, A/B testing.

### Advertising Attribution -- Meta Pixel + TikTok Events Manager
Tracks: page views, product views, add to cart, checkout started, purchases.
Purpose: ad optimization, retargeting, lookalike audiences, ROAS optimization.

### Commerce Analytics -- Shopify Analytics
Tracks: revenue, products sold, AOV, refunds, conversion.

## 21. Privacy & Health Data Separation

Advertising systems must NEVER receive: BP readings, glucose data, sleep metrics, therapy information, family health data, recovery scores.

Only commerce and engagement events may be tracked.

## 22. Server-Side Tracking Architecture

```
Browser
  |
Astro frontend
  |
Cloudflare Worker
  |
Analytics dispatch layer
  +-- GA4
  +-- PostHog
  +-- Meta Conversion API
  +-- TikTok Events API
```

Advantages: improved attribution, harder to block, better security, reduced ad blocker impact.

## 23. Social Commerce Architecture

Shopify integrates with: Instagram Shop, Facebook Shop, TikTok Shop, Google Shopping, Shop App.

Product catalogs originate from Shopify only. Astro must not act as the product feed source.

## 24. Shopify Markets & Global Selling

Configure Shopify Markets for: US, Canada, UK, EU, future expansion regions.

Use Shopify for: localized pricing, currency handling, taxes, duties, international selling.

## 25. Marketing Stack

- Klaviyo (email flows: welcome, abandoned cart, checkout abandonment, onboarding, review requests, win-back)
- Meta Ads
- TikTok Ads
- GA4
- PostHog

## 26. Customer Support & Returns

- Gorgias (support across Shopify, Instagram, email, Meta channels)
- Loop Returns (wrong size, exchange, defective hardware, warranty support)

## 27. Deployment Architecture

- Cloudflare Pages (frontend)
- Cloudflare Workers (BFF / API proxy)
- Cloudflare CDN (assets)
- Cloudflare R2 (large media)

Domains:
- `www.seemyhealth.ai` -- Astro frontend
- `shop.seemyhealth.ai` -- Shopify storefront (optional fallback)

## 28. Recommended Folder Structure

```
src/
 +-- components/
 |    +-- gsap/
 |    +-- three/
 |    +-- commerce/
 |    +-- analytics/
 |    +-- ui/
 |
 +-- layouts/
 +-- pages/
 +-- lib/
 |    +-- shopify/
 |    +-- analytics/
 |    +-- animations/
 |    +-- utils/
 |
 +-- styles/
 +-- content/
 +-- assets/
```

## 29. Final Experience Objective

The storefront must feel: cinematic, premium, modern, trustworthy, wellness-focused, highly performant.

Target benchmark: luxury wearable brands, premium consumer technology brands, Apple-style storytelling experiences.

While maintaining: operational stability, scalability, SEO, maintainability, conversion optimization.
