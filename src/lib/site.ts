// Which line this build is for (CLAUDE.md "Prod and dev"). `npm run build:dev` sets
// PUBLIC_SITE_ENV=dev and builds dev.seemyhealth.ai: noindex everywhere, no analytics, the dev
// store's variant ids. Anything else builds prod, unchanged.
export const IS_DEV_SITE = import.meta.env.PUBLIC_SITE_ENV === "dev";

// The site's origin, no trailing slash: astro.config.mjs's `site` for this line
// (https://www.seemyhealth.ai or https://dev.seemyhealth.ai). Canonicals, Open Graph and JSON-LD.
export const SITE_ORIGIN = String(import.meta.env.SITE).replace(/\/+$/, "");
