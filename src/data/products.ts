const CF_IMG = "https://imagedelivery.net/NnC2JvU8j4bgBbmedVhjJg";
const CF_STREAM = "customer-5zjora8ha9v60sg3.cloudflarestream.com";

export interface ProductFeature {
  title: string;
  description: string;
  icon: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Product {
  name: string;
  tagline: string;
  headline: string;
  description: string;
  image: string;
  streamId?: string;
  price: string;
  color: string;
  specImage?: string;
  specs: ProductSpec[];
  features: ProductFeature[];
  lifestyleImages: ProductImage[];
}

export const products: Record<string, Product> = {
  "ring-one": {
    name: "Ring One",
    tagline: "Sensing, Made Human",
    headline: "Health clarity\non your finger",
    description: "24/7 heart rate, SpO2, sleep stages, activity tracking, and stress monitoring — all from a ring designed for daily wear. Medical-grade sensors wrapped in titanium, rated IP68 for showers, workouts, and everything in between.",
    image: `${CF_IMG}/ring-hero-hands/public`,
    streamId: "2dddbe4d3032da2f23af4ada53b92953",
    price: "From $179.99",
    color: "#F97316",
    specImage: `${CF_IMG}/ring-studio-profile/public`,
    specs: [
      { label: "Sensors", value: "PPG, Temperature, Accelerometer" },
      { label: "Battery", value: "Up to 7 days" },
      { label: "Water Rating", value: "IP68 — 50m depth" },
      { label: "Weight", value: "4-6g depending on size" },
      { label: "Materials", value: "Titanium shell, medical-grade resin" },
      { label: "Connectivity", value: "Bluetooth 5.2" },
      { label: "Sizes", value: "6, 7, 8, 9, 10, 11, 12, 13" },
      { label: "Finishes", value: "Midnight Black ($179.99), Aurora Gold ($199.99)" },
    ],
    features: [
      {
        title: "Sleep Intelligence",
        description: "Advanced sleep staging — light, deep, REM — plus overnight HRV, skin temperature trends, and a morning recovery score so you know how to approach your day.",
        icon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
      },
      {
        title: "Heart Health",
        description: "Continuous heart rate monitoring with resting HR trends, heart rate variability, and SpO2 readings. Medical-grade accuracy validated against clinical standards.",
        icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
      },
      {
        title: "Activity & Exercise",
        description: "Automatic activity detection with steps, calories, and active minutes. No manual start needed — Ring One knows when you're moving.",
        icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
      },
      {
        title: "Stress & Recovery",
        description: "Real-time stress tracking based on HRV patterns. Get nudges to breathe when your body needs it, and see your recovery trend over time.",
        icon: "M12 3v18M3 12h18",
      },
    ],
    lifestyleImages: [
      { src: `${CF_IMG}/ring-cocktails/public`, alt: "Ring One at a social evening" },
      { src: `${CF_IMG}/ring-face-closeup/public`, alt: "Ring One close-up portrait" },
      { src: `${CF_IMG}/ring-sleeping/public`, alt: "Tracking sleep with Ring One" },
      { src: `${CF_IMG}/ring-working/public`, alt: "Ring One while working" },
      { src: `${CF_IMG}/ring-yoga/public`, alt: "Ring One during yoga" },
      { src: `${CF_IMG}/ring-dining/public`, alt: "Ring One at dinner" },
      { src: `${CF_IMG}/ring-hand-detail/public`, alt: "Ring One hand detail" },
      { src: `${CF_IMG}/ring-fitness-body/public`, alt: "Ring One fitness tracking" },
      { src: `${CF_IMG}/ring-app-phone/public`, alt: "SeeMyHealth app with Ring One" },
      { src: `${CF_IMG}/ring-unboxing/public`, alt: "Ring One unboxing" },
      { src: `${CF_IMG}/ring-all-finishes/public`, alt: "All Ring One finishes" },
      { src: `${CF_IMG}/ring-aurora-studio/public`, alt: "Aurora Gold studio shot" },
    ],
  },
  "scale": {
    name: "The Scale",
    tagline: "Beyond the Number",
    headline: "The whole picture,\nnot just weight",
    description: "Full body composition analysis with 4-point BIA. Step on and see weight, body fat, muscle mass, bone density, and 10 more metrics in the app instantly. Looking for segmental analysis? Check out The Scale Pro.",
    image: `${CF_IMG}/scale-black-pack/public`,
    streamId: "aaff94de34c19bfe9fe6fa3b038c80c8",
    price: "From $99.99",
    color: "#3B82F6",
    specs: [
      { label: "Sensors", value: "BIA, 4-point electrode" },
      { label: "Metrics", value: "13 body composition measurements" },
      { label: "Battery", value: "4x AAA, up to 12 months" },
      { label: "Display", value: "Hidden LED, auto-on" },
      { label: "Max Weight", value: "180kg / 400lbs" },
      { label: "Connectivity", value: "Bluetooth 5.0, Wi-Fi" },
      { label: "Users", value: "Unlimited profiles with auto-recognition" },
      { label: "Colors", value: "Obsidian Black, Frost White" },
    ],
    features: [
      {
        title: "Body Composition",
        description: "Go beyond weight. See body fat percentage, muscle mass, bone density, visceral fat, water percentage, BMR, and metabolic age — all in one step.",
        icon: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
      },
      {
        title: "Wi-Fi Auto Sync",
        description: "Step off and your data is already in the app. No phone needed nearby — the scale syncs over Wi-Fi in the background.",
        icon: "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
      },
      {
        title: "Family Profiles",
        description: "Unlimited user profiles with auto-recognition. Everyone in the household gets their own private dashboard.",
        icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
      },
      {
        title: "Trend Tracking",
        description: "See your weight and composition change over weeks and months. Understand the real trends behind daily fluctuations.",
        icon: "M3 17l6-6 4 4 8-8M14 7h7v7",
      },
    ],
    lifestyleImages: [
      { src: `${CF_IMG}/scale-white-pack/public`, alt: "The Scale white finish" },
      { src: `${CF_IMG}/scale-pro-hero-new/public`, alt: "Scale Pro with handle" },
      { src: `${CF_IMG}/scale-pro-lifestyle-new/public`, alt: "Using Scale Pro at home" },
      { src: `${CF_IMG}/scale-pro-laser-front/public`, alt: "Scale Pro front view" },
      { src: `${CF_IMG}/scale-pro-laser-side/public`, alt: "Scale Pro side view" },
      { src: `${CF_IMG}/scale-pro-using/public`, alt: "Scale Pro body composition reading" },
    ],
  },
  "scale-pro": {
    name: "The Scale Pro",
    tagline: "Segmental Precision",
    headline: "See your body,\nsegment by segment",
    description: "Clinical-grade body composition with 8-point dual-frequency BIA and segmental analysis. See fat and muscle distribution for each arm, leg, and trunk — the same technology used in professional sports labs.",
    image: `${CF_IMG}/scale-pro-hero-new/public`,
    streamId: "aaff94de34c19bfe9fe6fa3b038c80c8",
    price: "From $179.99",
    color: "#3B82F6",
    specs: [
      { label: "Sensors", value: "Dual-frequency BIA, 8-point electrode with retractable handle" },
      { label: "Metrics", value: "21 body composition measurements" },
      { label: "Segmental", value: "Arms, legs, trunk — individual fat & muscle readings" },
      { label: "Display", value: "Full-color LED panel" },
      { label: "Max Weight", value: "200kg / 440lbs" },
      { label: "Connectivity", value: "Bluetooth 5.0, Wi-Fi" },
      { label: "Users", value: "Unlimited profiles with auto-recognition" },
      { label: "Battery", value: "4x AAA, up to 12 months" },
      { label: "Colors", value: "Obsidian Black, Frost White" },
    ],
    features: [
      {
        title: "Segmental Analysis",
        description: "See body fat and muscle mass for each arm, each leg, and your trunk separately. 8-point electrodes with retractable handle for clinical-grade precision.",
        icon: "M22 12h-4l-3 9L9 3l-3 9H2",
      },
      {
        title: "21 Body Metrics",
        description: "Weight, body fat, muscle mass, bone density, visceral fat, water percentage, BMR, metabolic age, protein, subcutaneous fat, and more — all from a single 10-second step.",
        icon: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
      },
      {
        title: "Family Profiles",
        description: "Unlimited user profiles with auto-recognition. Everyone in the household gets their own private dashboard.",
        icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
      },
      {
        title: "Trend Tracking",
        description: "See your weight and composition change over weeks and months. Understand the real trends behind daily fluctuations.",
        icon: "M3 17l6-6 4 4 8-8M14 7h7v7",
      },
    ],
    lifestyleImages: [
      { src: `${CF_IMG}/scale-pro-hero-new/public`, alt: "Scale Pro with handle" },
      { src: `${CF_IMG}/scale-pro-laser-front/public`, alt: "Scale Pro front view" },
      { src: `${CF_IMG}/scale-pro-laser-side/public`, alt: "Scale Pro side view" },
      { src: `${CF_IMG}/scale-pro-using/public`, alt: "Scale Pro body composition reading" },
      { src: `${CF_IMG}/scale-pro-lifestyle-new/public`, alt: "Using Scale Pro at home" },
      { src: `${CF_IMG}/scale-pro-lifestyle/public`, alt: "Scale Pro lifestyle" },
    ],
  },
  "bp-monitor": {
    name: "BP Monitor",
    tagline: "Blood Pressure, Simplified",
    headline: "Clinical accuracy,\nhome comfort",
    description: "Accurate blood pressure readings with irregular heartbeat detection. Validated against clinical standards. Share results directly with your doctor from the app.",
    image: `${CF_IMG}/bp-black/public`,
    streamId: "414b8ac36adafae24dc9750438174d9a",
    price: "$89.99",
    color: "#EF4444",
    specs: [
      { label: "Method", value: "Oscillometric" },
      { label: "Range", value: "0-300 mmHg (pressure), 40-199 bpm (pulse)" },
      { label: "Accuracy", value: "±3 mmHg (pressure), ±5% (pulse)" },
      { label: "Cuff Size", value: "22-42cm (adjustable)" },
      { label: "Battery", value: "Rechargeable, up to 200 readings" },
      { label: "Memory", value: "Unlimited (synced to app)" },
      { label: "Connectivity", value: "Bluetooth 5.0" },
      { label: "Certification", value: "FDA cleared, CE marked" },
    ],
    features: [
      {
        title: "One-Touch Reading",
        description: "Wrap the cuff, press the button. Your systolic, diastolic, and pulse rate appear in 30 seconds. No setup needed.",
        icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
      },
      {
        title: "Irregular Heartbeat",
        description: "Automatic detection of irregular heartbeat patterns during measurement. Alerts you when something needs attention.",
        icon: "M22 12h-4l-3 9L9 3l-3 9H2",
      },
      {
        title: "Doctor Sharing",
        description: "Toggle access for your doctor directly in the app. They get authenticated, see your full BP history in real time, and you can revoke access with a single switch.",
        icon: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
      },
      {
        title: "Morning & Evening",
        description: "Set reminders for consistent readings. The app tracks AM/PM patterns to catch trends your doctor would want to know about.",
        icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
      },
    ],
    lifestyleImages: [
      { src: `${CF_IMG}/bp-white/public`, alt: "BP Monitor white finish" },
      { src: `${CF_IMG}/bp-black-studio/public`, alt: "BP Monitor black studio" },
      { src: `${CF_IMG}/bp-white-studio/public`, alt: "BP Monitor white studio" },
    ],
  },
  "hydra-one": {
    name: "Hydra One",
    tagline: "Stay Perfectly Hydrated",
    headline: "Drink smarter,\nnot harder",
    description: "Smart water bottle that tracks your daily intake automatically. LED ring shows your progress. Gentle reminders keep you on track without being annoying.",
    image: `${CF_IMG}/bottle-treebark/public`,
    streamId: "09fe15a09d3e2ad17189fbc7d758bc52",
    price: "$59.99",
    color: "#06B6D4",
    specs: [
      { label: "Capacity", value: "750ml / 25oz" },
      { label: "Material", value: "Tritan BPA-free, stainless steel lid" },
      { label: "Battery", value: "Rechargeable, up to 30 days" },
      { label: "Indicator", value: "12-LED progress ring" },
      { label: "Sensor", value: "Capacitive water level" },
      { label: "Connectivity", value: "Bluetooth 5.0" },
      { label: "Insulation", value: "Double-wall, 12hr cold" },
      { label: "Weight", value: "320g empty" },
    ],
    features: [
      {
        title: "Auto Tracking",
        description: "Capacitive sensors detect every sip. No manual logging — just drink and the app updates automatically.",
        icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
      },
      {
        title: "LED Progress Ring",
        description: "Twelve LEDs around the lid show your daily progress at a glance. Full ring = goal hit. No phone needed.",
        icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
      },
      {
        title: "Smart Reminders",
        description: "Gentle LED pulses when you haven't sipped in a while. Adjusts to your schedule and activity level.",
        icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
      },
      {
        title: "Hydration Insights",
        description: "See how hydration affects your sleep, energy, and recovery. The app correlates your intake with data from other SeeMyHealth devices.",
        icon: "M3 17l6-6 4 4 8-8M14 7h7v7",
      },
    ],
    lifestyleImages: [
      { src: `${CF_IMG}/bottle-trio-studio/public`, alt: "Hydra One all colors" },
      { src: `${CF_IMG}/bottle-office-scene/public`, alt: "Hydra One on desk" },
      { src: `${CF_IMG}/kitchen-lifestyle-web/public`, alt: "Hydra One in kitchen" },
    ],
  },
  "hema-one": {
    name: "Hema One",
    tagline: "Your Blood, Your Data",
    headline: "Lab results,\nno lab visit",
    description: "At-home blood analysis for key health markers. A small sample from your fingertip gives you lab-quality results in minutes, right in the app.",
    image: `${CF_IMG}/hema-one-web/public`,
    streamId: "8f576ad01105f0b3c8ff5495c066906e",
    price: "$99.99",
    color: "#A855F7",
    specs: [
      { label: "Sample", value: "Fingertip microsampling" },
      { label: "Volume", value: "< 0.1ml per test" },
      { label: "Results", value: "Under 5 minutes" },
      { label: "Markers", value: "Hemoglobin, Glucose, Cholesterol, Iron" },
      { label: "Accuracy", value: "±2% vs. laboratory reference" },
      { label: "Cartridges", value: "10 included, refills available" },
      { label: "Connectivity", value: "Bluetooth 5.0" },
      { label: "Storage", value: "Results synced to app" },
    ],
    features: [
      {
        title: "Quick Results",
        description: "Place a tiny sample on the cartridge, insert into Hema One, and get results in under 5 minutes. No appointment needed.",
        icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
      },
      {
        title: "Key Markers",
        description: "Track hemoglobin, blood glucose, total cholesterol, and iron levels. The markers that matter most for everyday health awareness.",
        icon: "M22 12h-4l-3 9L9 3l-3 9H2",
      },
      {
        title: "Trend Analysis",
        description: "See how your blood markers change over time. Spot deficiencies early and track the impact of dietary changes.",
        icon: "M3 17l6-6 4 4 8-8M14 7h7v7",
      },
      {
        title: "Share with Doctor",
        description: "Grant your healthcare provider secure, authenticated access to your blood marker history with a single toggle. They see the longitudinal data they rarely get — and you stay in full control.",
        icon: "M4 12v8a2 2 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
      },
    ],
    lifestyleImages: [
      { src: `${CF_IMG}/hema-one-device-web/public`, alt: "Hema One device" },
    ],
  },
};

export const productSlugs = Object.keys(products);
export { CF_IMG, CF_STREAM };
