// Shopify Storefront API variant IDs mapped by product handle
// Used by ProductConfigurator to add correct variant to cart

export interface Variant {
  id: string;           // Shopify GID (gid://shopify/ProductVariant/...)
  title: string;
  price: string;        // e.g. "179.99"
  currency: string;
  options: Record<string, string>;  // e.g. { Finish: "Phantom Black", Size: "6" }
  available: boolean;
}

export type MediaType = "image" | "video" | "model";

export interface MediaItem {
  type: MediaType;
  url: string;
  alt?: string;                    // accessible label
  poster?: string;                 // thumbnail/poster for video or model preview
}

export interface ProductVariantData {
  handle: string;
  name: string;
  optionNames: string[];          // e.g. ["Finish", "Size"] or ["Color"]
  variants: Variant[];
  colorSwatches: Record<string, string>;  // variant color name → hex for swatch display
  media?: Record<string, MediaItem[]>;    // variant color name → ordered gallery of images/videos/models
  ambientColors?: Record<string, string>; // variant color name → ambient bg color for configure page
  boxContents?: string[];                 // items included in the box
  deliveryEstimate?: string;              // e.g. "5-7 business days"
  warrantyYears?: number;                 // warranty duration
}

const CF_IMG = "https://imagedelivery.net/NnC2JvU8j4bgBbmedVhjJg";
const CF_STREAM = "https://customer-5zjora8ha9v60sg3.cloudflarestream.com";

export const productVariants: Record<string, ProductVariantData> = {
  "ring-one": {
    handle: "ring-one",
    name: "Ring One",
    optionNames: ["Finish", "Size"],
    boxContents: ["Ring One", "Charging dock", "USB-C cable", "Quick start guide"],
    deliveryEstimate: "5–7 business days",
    warrantyYears: 1,
    colorSwatches: {
      "Phantom Black": "#1a1a1a",
      "Aurora Gold": "#d4a853",
    },
    media: {
      "Phantom Black": [
        { type: "video", url: `${CF_STREAM}/2ddd23875de627bd1410a4d251735cbe/downloads/default.mp4`, poster: `${CF_IMG}/ring-phantom-black-poster/public`, alt: "Ring One Phantom Black reveal" },
        { type: "model", url: "/models/ring-phantom-black-3d.glb", poster: `${CF_IMG}/ring-phantom-black-poster/public`, alt: "Ring One Phantom Black 3D" },
        { type: "image", url: `${CF_IMG}/ring-photo-07/public`, alt: "Ring One Phantom Black — dining" },
        { type: "image", url: `${CF_IMG}/ring-phantom-chair-hand/public`, alt: "Ring One Phantom Black — hand on chair" },
        { type: "image", url: `${CF_IMG}/ring-phantom-bowl-kitchen/public`, alt: "Ring One Phantom Black — in the kitchen" },
        { type: "image", url: `${CF_IMG}/ring-photo-11/public`, alt: "Ring One Phantom Black — hand detail" },
      ],
      "Aurora Gold": [
        { type: "video", url: `${CF_STREAM}/7ffce116e3e526dae52d54e873f2b2be/downloads/default.mp4`, poster: `${CF_IMG}/ring-aurora-gold-poster/public`, alt: "Ring One Aurora Gold reveal" },
        { type: "model", url: "/models/ring-aurora-gold-3d.glb", poster: `${CF_IMG}/ring-aurora-gold-poster/public`, alt: "Ring One Aurora Gold 3D" },
        { type: "image", url: `${CF_IMG}/ring-photo-03/public`, alt: "Ring One Aurora Gold — working" },
        { type: "image", url: `${CF_IMG}/ring-photo-08/public`, alt: "Ring One Aurora Gold — fitness" },
        { type: "image", url: `${CF_IMG}/ring-photo-09/public`, alt: "Ring One Aurora Gold — close-up hand" },
        { type: "image", url: `${CF_IMG}/ring-photo-10/public`, alt: "Ring One Aurora Gold — face detail" },
      ],
    },
    ambientColors: {
      "Phantom Black": "#0a0a0a",
      "Aurora Gold": "#1a1408",
    },
    variants: [
      { id: "gid://shopify/ProductVariant/43225636470897", title: "Phantom Black / 6", price: "179", currency: "USD", options: { Finish: "Phantom Black", Size: "6" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636503665", title: "Phantom Black / 7", price: "179", currency: "USD", options: { Finish: "Phantom Black", Size: "7" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636536433", title: "Phantom Black / 8", price: "179", currency: "USD", options: { Finish: "Phantom Black", Size: "8" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636569201", title: "Phantom Black / 9", price: "179", currency: "USD", options: { Finish: "Phantom Black", Size: "9" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636601969", title: "Phantom Black / 10", price: "179", currency: "USD", options: { Finish: "Phantom Black", Size: "10" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636634737", title: "Phantom Black / 11", price: "179", currency: "USD", options: { Finish: "Phantom Black", Size: "11" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636667505", title: "Phantom Black / 12", price: "179", currency: "USD", options: { Finish: "Phantom Black", Size: "12" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636700273", title: "Phantom Black / 13", price: "179", currency: "USD", options: { Finish: "Phantom Black", Size: "13" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636733041", title: "Aurora Gold / 6", price: "199", currency: "USD", options: { Finish: "Aurora Gold", Size: "6" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636765809", title: "Aurora Gold / 7", price: "199", currency: "USD", options: { Finish: "Aurora Gold", Size: "7" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636798577", title: "Aurora Gold / 8", price: "199", currency: "USD", options: { Finish: "Aurora Gold", Size: "8" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636831345", title: "Aurora Gold / 9", price: "199", currency: "USD", options: { Finish: "Aurora Gold", Size: "9" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636864113", title: "Aurora Gold / 10", price: "199", currency: "USD", options: { Finish: "Aurora Gold", Size: "10" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636896881", title: "Aurora Gold / 11", price: "199", currency: "USD", options: { Finish: "Aurora Gold", Size: "11" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636929649", title: "Aurora Gold / 12", price: "199", currency: "USD", options: { Finish: "Aurora Gold", Size: "12" }, available: true },
      { id: "gid://shopify/ProductVariant/43225636962417", title: "Aurora Gold / 13", price: "199", currency: "USD", options: { Finish: "Aurora Gold", Size: "13" }, available: true },
    ],
  },
  "scale": {
    handle: "scale",
    name: "The Scale",
    optionNames: ["Color"],
    boxContents: ["Smart Scale", "4× AAA batteries", "Quick start guide"],
    deliveryEstimate: "5–7 business days",
    warrantyYears: 1,
    colorSwatches: {
      "Obsidian Black": "#1a1a1a",
      "Frost White": "#e8e8e8",
    },
    media: {
      "Obsidian Black": [
        { type: "video", url: "", poster: `${CF_IMG}/scale-base-black-config/public`, alt: "Scale Obsidian Black video" },
        { type: "model", url: "/models/scale-basic-black-3d.glb", poster: `${CF_IMG}/scale-base-black-config/public`, alt: "Scale Obsidian Black 3D" },
        { type: "image", url: `${CF_IMG}/scale-black-bathroom/public`, alt: "Scale Obsidian Black on bathroom counter" },
        { type: "image", url: `${CF_IMG}/scale-black-nutritionist/public`, alt: "Scale in nutritionist office" },
      ],
      "Frost White": [
        { type: "video", url: "", poster: `${CF_IMG}/scale-base-white-config/public`, alt: "Scale Frost White video" },
        { type: "model", url: "/models/scale-basic-white-3d.glb", poster: `${CF_IMG}/scale-base-white-config/public`, alt: "Scale Frost White 3D" },
        { type: "image", url: `${CF_IMG}/scale-white-portrait/public`, alt: "Scale Frost White portrait" },
        { type: "image", url: `${CF_IMG}/scale-white-bathroom/public`, alt: "Scale Frost White in bathroom" },
      ],
    },
    ambientColors: {
      "Obsidian Black": "#0a0a0a",
      "Frost White": "#121210",
    },
    variants: [
      { id: "gid://shopify/ProductVariant/43225637814385", title: "Obsidian Black", price: "99", currency: "USD", options: { Color: "Obsidian Black" }, available: true },
      { id: "gid://shopify/ProductVariant/43225637847153", title: "Frost White", price: "99", currency: "USD", options: { Color: "Frost White" }, available: true },
    ],
  },
  "scale-pro": {
    handle: "scale-pro",
    name: "The Scale Pro",
    optionNames: ["Color"],
    boxContents: ["The Scale Pro", "4× AAA batteries", "Quick start guide"],
    deliveryEstimate: "5–7 business days",
    warrantyYears: 1,
    colorSwatches: {
      "Obsidian Black": "#1a1a1a",
      "Frost White": "#e8e8e8",
    },
    media: {
      "Obsidian Black": [
        { type: "video", url: "", poster: `${CF_IMG}/scale-pro-black-config/public`, alt: "Scale Pro Obsidian Black video" },
        { type: "model", url: "/models/scale-pro-black-3d.glb", poster: `${CF_IMG}/scale-pro-black-config/public`, alt: "Scale Pro Obsidian Black 3D" },
        { type: "image", url: `${CF_IMG}/scale-pro-black-bathroom/public`, alt: "Scale Pro Obsidian Black in dark bathroom" },
        { type: "image", url: `${CF_IMG}/scale-pro-using/public`, alt: "Scale Pro in use" },
      ],
      "Frost White": [
        { type: "video", url: "", poster: `${CF_IMG}/scale-pro-white-config/public`, alt: "Scale Pro Frost White video" },
        { type: "model", url: "/models/scale-pro-white-3d.glb", poster: `${CF_IMG}/scale-pro-white-config/public`, alt: "Scale Pro Frost White 3D" },
        { type: "image", url: `${CF_IMG}/scale-pro-white-marble/public`, alt: "Scale Pro Frost White on marble counter" },
        { type: "image", url: `${CF_IMG}/scale-pro-white-bathroom/public`, alt: "Scale Pro Frost White in bathroom" },
        { type: "image", url: `${CF_IMG}/scale-pro-white-gym/public`, alt: "Scale Pro Frost White in fitness suite" },
        { type: "image", url: `${CF_IMG}/scale-pro-using/public`, alt: "Scale Pro in use" },
      ],
    },
    ambientColors: {
      "Obsidian Black": "#0a0a0a",
      "Frost White": "#121210",
    },
    variants: [
      { id: "gid://shopify/ProductVariant/43225637879921", title: "Obsidian Black", price: "199", currency: "USD", options: { Color: "Obsidian Black" }, available: true },
      { id: "gid://shopify/ProductVariant/43225637912689", title: "Frost White", price: "199", currency: "USD", options: { Color: "Frost White" }, available: true },
    ],
  },
  "bp-monitor": {
    handle: "bp-monitor",
    name: "BP Monitor",
    optionNames: ["Color"],
    boxContents: ["BP Monitor", "Adjustable arm cuff (22–42 cm)", "USB-C charging cable", "Carrying pouch", "Quick start guide"],
    deliveryEstimate: "5–7 business days",
    warrantyYears: 1,
    colorSwatches: {
      "Carbon Black": "#1a1a1a",
      "Opal White": "#e8e8e8",
    },
    media: {
      "Carbon Black": [
        { type: "video", url: "", poster: `${CF_IMG}/bp-black-poster/public`, alt: "BP Monitor Carbon Black video" },
        { type: "model", url: "/models/bpm-black-3d.glb", poster: `${CF_IMG}/bp-black-poster/public`, alt: "BP Monitor Carbon Black 3D" },
        { type: "image", url: `${CF_IMG}/bp-black-desk-portrait/public`, alt: "BP Monitor black on desk" },
        { type: "image", url: `${CF_IMG}/bp-desk-display/public`, alt: "BP Monitor displaying reading" },
        { type: "image", url: `${CF_IMG}/bp-black-studio/public`, alt: "BP Monitor Carbon Black studio" },
      ],
      "Opal White": [
        { type: "video", url: "", poster: `${CF_IMG}/bp-white-poster/public`, alt: "BP Monitor Opal White video" },
        { type: "model", url: "/models/bpm-white-3d.glb", poster: `${CF_IMG}/bp-white-poster/public`, alt: "BP Monitor Opal White 3D" },
        { type: "image", url: `${CF_IMG}/bp-white-desk-display/public`, alt: "BP Monitor Opal White on desk" },
        { type: "image", url: `${CF_IMG}/bp-white-living-room/public`, alt: "BP Monitor Opal White in living room" },
        { type: "image", url: `${CF_IMG}/bp-white-studio/public`, alt: "BP Monitor Opal White studio" },
      ],
    },
    ambientColors: {
      "Carbon Black": "#0a0a0a",
      "Opal White": "#121210",
    },
    variants: [
      { id: "gid://shopify/ProductVariant/43225874759793", title: "Carbon Black", price: "89", currency: "USD", options: { Color: "Carbon Black" }, available: true },
      { id: "gid://shopify/ProductVariant/43225874792561", title: "Opal White", price: "89", currency: "USD", options: { Color: "Opal White" }, available: true },
    ],
  },
  "hydra-one": {
    handle: "hydra-one",
    name: "Hydra One",
    optionNames: ["Color"],
    boxContents: ["Hydra One bottle (500 ml)", "USB-C charging cable", "Spare lid seal", "Quick start guide"],
    deliveryEstimate: "5–7 business days",
    warrantyYears: 1,
    colorSwatches: {
      "Abyss Black": "#1a1a1a",
      "Glacier White": "#e8e8e8",
    },
    media: {
      "Abyss Black": [
        { type: "video", url: "", poster: `${CF_IMG}/bottle-black-config/public`, alt: "Hydra One Abyss Black video" },
        { type: "model", url: "/models/bottle-black-3d.glb", poster: `${CF_IMG}/bottle-black-config/public`, alt: "Hydra One Abyss Black 3D" },
        { type: "image", url: `${CF_IMG}/bottle-black-desk/public`, alt: "Hydra One black on desk" },
        { type: "image", url: `${CF_IMG}/bottle-black-gym/public`, alt: "Hydra One black in gym" },
        { type: "image", url: `${CF_IMG}/bottle-treebark/public`, alt: "Hydra One Abyss Black" },
        { type: "image", url: `${CF_IMG}/bottle-black-picnic/public`, alt: "Hydra One Abyss Black in picnic basket" },
      ],
      "Glacier White": [
        { type: "video", url: "", poster: `${CF_IMG}/bottle-white-config/public`, alt: "Hydra One Glacier White video" },
        { type: "model", url: "/models/bottle-white-3d.glb", poster: `${CF_IMG}/bottle-white-config/public`, alt: "Hydra One Glacier White 3D" },
        { type: "image", url: `${CF_IMG}/bottle-white-cafe-v2/public`, alt: "Hydra One white in cafe" },
        { type: "image", url: `${CF_IMG}/bottle-white-park/public`, alt: "Hydra One white in park" },
        { type: "image", url: `${CF_IMG}/bottle-white-office/public`, alt: "Hydra One white on office desk with city view" },
        { type: "image", url: `${CF_IMG}/bottle-white-kitchen/public`, alt: "Hydra One white on kitchen counter with french press and breakfast" },
      ],
    },
    ambientColors: {
      "Abyss Black": "#080a0a",
      "Glacier White": "#0e1012",
    },
    variants: [
      { id: "gid://shopify/ProductVariant/43225874825329", title: "Abyss Black", price: "79", currency: "USD", options: { Color: "Abyss Black" }, available: true },
      { id: "gid://shopify/ProductVariant/43225874858097", title: "Glacier White", price: "79", currency: "USD", options: { Color: "Glacier White" }, available: true },
    ],
  },
  "hema-one": {
    handle: "hema-one",
    name: "Hema One",
    optionNames: ["Color"],
    boxContents: ["Hema One analyzer", "10× test strips", "Lancet device", "10× lancets", "USB-C charging cable", "Quick start guide"],
    deliveryEstimate: "5–7 business days",
    warrantyYears: 1,
    colorSwatches: {
      "Stealth Black": "#1a1a1a",
      "Ember Orange": "#c2571a",
    },
    media: {
      "Stealth Black": [
        { type: "video", url: "", poster: `${CF_IMG}/hema-black-poster/public`, alt: "Hema One Stealth Black video" },
        { type: "model", url: "/models/hema-black-3d.glb", poster: `${CF_IMG}/hema-black-poster/public`, alt: "Hema One Stealth Black 3D" },
        { type: "image", url: `${CF_IMG}/hema-black-lab/public`, alt: "Hema One Stealth Black on lab desk showing lipid panel and glucose readings" },
        { type: "image", url: `${CF_IMG}/hema-black-bedside/public`, alt: "Hema One Stealth Black on bedside table with wellness book" },
        { type: "image", url: `${CF_IMG}/hema-black-hand-v2/public`, alt: "Hema One Stealth Black in hand with test strip and lancet" },
      ],
      "Ember Orange": [
        { type: "video", url: "", poster: `${CF_IMG}/hema-orange-poster/public`, alt: "Hema One Ember Orange video" },
        { type: "model", url: "/models/hema-orange-3d.glb", poster: `${CF_IMG}/hema-orange-poster/public`, alt: "Hema One Ember Orange 3D" },
        { type: "image", url: `${CF_IMG}/hema-orange-kitchen-v2/public`, alt: "Hema One Ember Orange on kitchen counter with test strips and fruit" },
        { type: "image", url: `${CF_IMG}/hema-orange-clinic/public`, alt: "Hema One Ember Orange on clinic desk with stethoscope" },
        { type: "image", url: `${CF_IMG}/hema-orange-doctor/public`, alt: "Doctor holding Hema One Ember Orange with test strip" },
      ],
    },
    ambientColors: {
      "Stealth Black": "#0a0a0a",
      "Ember Orange": "#1a0f08",
    },
    variants: [
      { id: "gid://shopify/ProductVariant/43253482717297", title: "Stealth Black", price: "159", currency: "USD", options: { Color: "Stealth Black" }, available: true },
      { id: "gid://shopify/ProductVariant/43253482750065", title: "Ember Orange", price: "159", currency: "USD", options: { Color: "Ember Orange" }, available: true },
    ],
  },
};
