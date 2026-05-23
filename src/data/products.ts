const CF_IMG = "https://imagedelivery.net/NnC2JvU8j4bgBbmedVhjJg";
const CF_STREAM = "customer-5zjora8ha9v60sg3.cloudflarestream.com";

export interface ProductFeature {
  title: string;
  description: string;
  icon: string;
  image?: string;
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
  crossSellImage?: string;
  streamId?: string;
  price: string;
  color: string;
  specImage?: string;
  benefitsImage?: string;
  videoThumbnail?: string;
  ogImage?: string;
  specs: ProductSpec[];
  features: ProductFeature[];
  lifestyleImages: ProductImage[];
}

export const products: Record<string, Product> = {
  "ring-one": {
    name: "Ring One",
    tagline: "Sensing, Made Human",
    headline: "Health clarity\non your finger",
    description: "24/7 heart rate, SpO2, sleep stages, activity tracking, and stress monitoring, all from a ring designed for daily wear. Wrapped in titanium, rated IP68 for showers, workouts, and everything in between.",
    image: `${CF_IMG}/ring-hero-hands/public`,
    streamId: "11598e9e76e389bfaebbccb7c0c5a5fb",
    price: "$179",
    color: "#F97316",
    specImage: `${CF_IMG}/ring-studio-profile/public`,
    benefitsImage: `${CF_IMG}/ring-one-sunset-meditation/public`,
    ogImage: `${CF_IMG}/og-ring-one/public`,
    specs: [
      { label: "Sensors", value: "PPG, Temperature, Accelerometer" },
      { label: "Battery", value: "Up to 7 days" },
      { label: "Water Rating", value: "IP68, 50m depth" },
      { label: "Weight", value: "4-6g depending on size" },
      { label: "Materials", value: "Titanium shell, biocompatible resin" },
      { label: "Connectivity", value: "Bluetooth 5.2" },
      { label: "Sizes", value: "6, 7, 8, 9, 10, 11, 12, 13" },
      { label: "Finishes", value: "Phantom Black ($179), Aurora Gold ($199)" },
    ],
    features: [
      {
        title: "Sleep Intelligence",
        description: "Advanced sleep staging: light, deep, and REM, plus overnight HRV, skin temperature trends, and a morning recovery score so you know how to approach your day.",
        icon: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z",
        image: `${CF_IMG}/ring-sleeping/public`,
      },
      {
        title: "Heart Health",
        description: "Continuous heart rate monitoring with resting HR trends, heart rate variability, and SpO2 readings. Always watching out for you, day and night.",
        icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
        image: `${CF_IMG}/ring-yoga/public`,
      },
      {
        title: "Activity & Exercise",
        description: "Automatic activity detection with steps, calories, and active minutes. No manual start needed. Ring One knows when you're moving.",
        icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
        image: `${CF_IMG}/ring-fitness-body/public`,
      },
      {
        title: "Stress & Recovery",
        description: "Real-time stress tracking based on HRV patterns. Get nudges to breathe when your body needs it, and see your recovery trend over time.",
        icon: "M12 3v18M3 12h18",
        image: `${CF_IMG}/ring-reading-coffee/public`,
      },
    ],
    lifestyleImages: [
      { src: `${CF_IMG}/ring-reading-coffee/public`, alt: "Ring One while reading with coffee" },
      { src: `${CF_IMG}/ring-cocktails/public`, alt: "Ring One at a social evening" },
      { src: `${CF_IMG}/ring-hand-closeup-black/public`, alt: "Ring One Phantom Black close-up on hand" },
      { src: `${CF_IMG}/ring-painting-aurora/public`, alt: "Ring One Aurora Gold while painting" },
      { src: `${CF_IMG}/ring-face-closeup/public`, alt: "Ring One close-up portrait" },
      { src: `${CF_IMG}/ring-sleeping/public`, alt: "Tracking sleep with Ring One" },
      { src: `${CF_IMG}/ring-working/public`, alt: "Ring One while working" },
      { src: `${CF_IMG}/ring-yoga/public`, alt: "Ring One during yoga" },
      { src: `${CF_IMG}/ring-dining/public`, alt: "Ring One at dinner" },
      { src: `${CF_IMG}/ring-hand-detail/public`, alt: "Ring One hand detail" },
      { src: `${CF_IMG}/ring-fitness-body/public`, alt: "Ring One fitness tracking" },
      { src: `${CF_IMG}/ring-app-phone/public`, alt: "SeeMyHealth app with Ring One" },
      { src: `${CF_IMG}/ring-unboxing/public`, alt: "Ring One unboxing" },
    ],
  },
  "scale": {
    name: "The Scale",
    tagline: "Beyond the Number",
    headline: "The whole picture,\nnot just weight",
    description: "Full body composition analysis with 4-point BIA. Step on and see weight, body fat, muscle mass, visceral fat, and 14 metrics in the app instantly. Looking for segmental analysis? <a href='/products/scale-pro' class='underline hover:text-white transition-colors'>Check out The Scale Pro</a>.",
    image: `${CF_IMG}/scale-bathroom-still/public`,
    crossSellImage: `${CF_IMG}/scale-black-bathroom/public`,
    streamId: "299bcfd1f9b9fb20b7d4f809a7b481fe",
    specImage: `${CF_IMG}/scale-base-side-profile/public`,
    benefitsImage: `${CF_IMG}/scale-bathroom-stepon-v3/public`,
    ogImage: `${CF_IMG}/og-scale/public`,
    price: "$99",
    color: "#3B82F6",
    specs: [
      { label: "Sensors", value: "BIA, 4-point electrode (feet)" },
      { label: "Metrics", value: "14 body composition measurements" },
      { label: "Measures", value: "Weight, heart rate, BMR, BMI, fat ratio, fat mass, muscle rate, muscle mass, protein ratio, subcutaneous fat ratio, skeletal muscle ratio, skeletal muscle mass, fat free mass, visceral fat" },
      { label: "Max Weight", value: "180kg / 396lbs" },
      { label: "Accuracy", value: "0-50kg ±300g, 51-100kg ±400g, 101-180kg ±500g" },
      { label: "Display", value: "Hidden LED, auto-on, auto shut-off (~10s)" },
      { label: "Battery", value: "3x AAA (included)" },
      { label: "Connectivity", value: "Bluetooth" },
      { label: "Compatibility", value: "iOS 17+, Android 15+" },
      { label: "Users", value: "Unlimited profiles via app" },
      { label: "In the Box", value: "Smart Scale, 3x AAA batteries, user manual" },
      { label: "Colors", value: "Obsidian Black, Frost White" },
    ],
    features: [
      {
        title: "Body Composition",
        description: "Go beyond weight. See body fat, muscle mass, visceral fat, skeletal muscle, protein ratio, BMR, BMI, and more — 14 metrics from a single step.",
        icon: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
        image: `${CF_IMG}/scale-bathroom-still/public`,
      },
      {
        title: "Shared by Design",
        description: "Not locked to any account. Open the app, reconnect to a device you've used before or scan and pair a new one, step on, and your reading saves to your own profile.",
        icon: "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
        image: `${CF_IMG}/scale-white-bathroom/public`,
      },
      {
        title: "Family Profiles",
        description: "Unlimited user profiles. Open the app, connect to the device, and your reading saves to your own private dashboard.",
        icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
        image: `${CF_IMG}/scale-black-nutritionist/public`,
      },
      {
        title: "Trend Tracking",
        description: "See your weight and composition change over weeks and months. Understand the real trends behind daily fluctuations.",
        icon: "M3 17l6-6 4 4 8-8M14 7h7v7",
        image: `${CF_IMG}/scale-white-portrait/public`,
      },
    ],
    lifestyleImages: [
      { src: `${CF_IMG}/scale-black-bathroom/public`, alt: "The Scale Obsidian Black in bathroom" },
      { src: `${CF_IMG}/scale-bathroom-still/public`, alt: "The Scale in luxury bathroom" },
      { src: `${CF_IMG}/scale-white-bathroom/public`, alt: "The Scale Frost White in bathroom" },
      { src: `${CF_IMG}/scale-black-nutritionist/public`, alt: "The Scale in nutritionist office" },
      { src: `${CF_IMG}/scale-white-pack/public`, alt: "The Scale white finish" },
      { src: `${CF_IMG}/scale-white-portrait/public`, alt: "The Scale Frost White portrait" },
      { src: `${CF_IMG}/scale-black-pack/public`, alt: "The Scale Obsidian Black" },
    ],
  },
  "scale-pro": {
    name: "The Scale Pro",
    tagline: "Segmental Precision",
    headline: "See your body,\nsegment by segment",
    description: "Multi-frequency BIA with 8 electrodes (4 feet + 4 hands) for detailed body composition. 32 metrics including segmental fat and muscle for each arm, leg, and trunk. The full picture, from home.",
    image: `${CF_IMG}/scale-pro-bathroom-still/public`,
    crossSellImage: `${CF_IMG}/scale-pro-black-bathroom/public`,
    streamId: "bc1265478cde805cec6ffaf93f0fd0ec",
    specImage: `${CF_IMG}/scale-pro-side-profile/public`,
    benefitsImage: `${CF_IMG}/scale-pro-athlete-gym/public`,
    ogImage: `${CF_IMG}/og-scale-pro/public`,
    price: "$179",
    color: "#3B82F6",
    specs: [
      { label: "Sensors", value: "Multi-frequency BIA, 8 electrodes (4 feet + 4 hands) with retractable handlebar grips" },
      { label: "Metrics", value: "32 body composition measurements including segmental analysis" },
      { label: "Segmental", value: "Left/right arm fat & muscle, left/right leg fat & muscle, trunk fat %" },
      { label: "Advanced Metrics", value: "Visceral fat, subcutaneous fat, skeletal muscle, bone mass, body cell mass, protein ratio, intracellular/extracellular water, minerals, adiposity level" },
      { label: "Display", value: "Full-color LED panel with auto shut-off (~10s)" },
      { label: "Battery", value: "Built-in rechargeable via USB-C, ~2 hours to full charge, several weeks battery life" },
      { label: "Connectivity", value: "Bluetooth" },
      { label: "Compatibility", value: "iOS 17+, Android 15+" },
      { label: "Users", value: "Unlimited profiles via app" },
      { label: "In the Box", value: "Scale Pro, USB-C charging cable, user manual" },
      { label: "Colors", value: "Obsidian Black, Frost White" },
    ],
    features: [
      {
        title: "Segmental Analysis",
        description: "See body fat and muscle mass for each arm, each leg, and your trunk separately. 8 electrodes with retractable handlebar grips send signals through different body sections independently.",
        icon: "M22 12h-4l-3 9L9 3l-3 9H2",
        image: `${CF_IMG}/scale-pro-using/public`,
      },
      {
        title: "32 Body Metrics",
        description: "Weight, heart rate, BMI, fat ratio, muscle mass, bone mass, visceral fat, protein, subcutaneous fat, skeletal muscle, body cell mass, intracellular/extracellular water, minerals, adiposity level, and more.",
        icon: "M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
        image: `${CF_IMG}/scale-pro-white-marble/public`,
      },
      {
        title: "Family Profiles",
        description: "Unlimited user profiles. Open the app, connect to the device, and your reading saves to your own private dashboard.",
        icon: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
        image: `${CF_IMG}/scale-pro-white-gym/public`,
      },
      {
        title: "Trend Tracking",
        description: "See your weight and composition change over weeks and months. Understand the real trends behind daily fluctuations.",
        icon: "M3 17l6-6 4 4 8-8M14 7h7v7",
        image: `${CF_IMG}/scale-pro-black-bathroom/public`,
      },
    ],
    lifestyleImages: [
      { src: `${CF_IMG}/scale-pro-black-bathroom/public`, alt: "Scale Pro Obsidian Black in dark bathroom" },
      { src: `${CF_IMG}/scale-pro-white-marble/public`, alt: "Scale Pro Frost White on marble counter" },
      { src: `${CF_IMG}/scale-pro-white-bathroom/public`, alt: "Scale Pro Frost White in bathroom" },
      { src: `${CF_IMG}/scale-pro-white-gym/public`, alt: "Scale Pro Frost White in fitness suite" },
      { src: `${CF_IMG}/scale-pro-using/public`, alt: "Scale Pro body composition reading" },
    ],
  },
  "bp-monitor": {
    name: "BP Monitor",
    tagline: "Blood Pressure, Simplified",
    headline: "Trusted readings,\nhome comfort",
    description: "Accurate blood pressure readings with irregular heartbeat detection. Reliable enough to share directly with your doctor from the app.",
    image: "",
    crossSellImage: `${CF_IMG}/bp-black-desk-portrait/public`,
    streamId: "1d73637dabb39e29daa4e516a616da0e",
    specImage: `${CF_IMG}/bp-monitor-side-profile/public`,
    benefitsImage: `${CF_IMG}/bp-breakfast-reading/public`,
    videoThumbnail: `${CF_IMG}/bp-white-desk-display/public`,
    ogImage: `${CF_IMG}/og-bp-monitor/public`,
    price: "$89",
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
        image: `${CF_IMG}/bp-desk-display/public`,
      },
      {
        title: "Irregular Heartbeat",
        description: "Automatic detection of irregular heartbeat patterns during measurement. Alerts you when something needs attention.",
        icon: "M22 12h-4l-3 9L9 3l-3 9H2",
        image: `${CF_IMG}/bp-white/public`,
      },
      {
        title: "Doctor Sharing",
        description: "Toggle access for your doctor directly in the app. They get authenticated, see your full BP history in real time, and you can revoke access with a single switch.",
        icon: "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
        image: `${CF_IMG}/bp-black-desk-portrait/public`,
      },
      {
        title: "Morning & Evening",
        description: "Set reminders for consistent readings. The app tracks AM/PM patterns to catch trends your doctor would want to know about.",
        icon: "M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0z",
        image: `${CF_IMG}/bp-breakfast-reading/public`,
      },
    ],
    lifestyleImages: [
      { src: `${CF_IMG}/bp-black-desk-portrait/public`, alt: "BP Monitor black on desk" },
      { src: `${CF_IMG}/bp-desk-display/public`, alt: "BP Monitor displaying reading on desk" },
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
    image: "",
    videoThumbnail: `${CF_IMG}/bottle-black-desk-work/public`,
    streamId: "323f4655be53eefdf3f08ecd6765c362",
    specImage: `${CF_IMG}/hydra-one-side-profile/public`,
    benefitsImage: `${CF_IMG}/bottle-treebark/public`,
    ogImage: `${CF_IMG}/og-hydra-one/public`,
    price: "$79",
    color: "#06B6D4",
    specs: [
      { label: "Capacity", value: "500ml / 17oz" },
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
        description: "Capacitive sensors detect every sip. No manual logging, just drink and the app updates automatically.",
        icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
        image: `${CF_IMG}/bottle-white-office/public`,
      },
      {
        title: "LED Progress Ring",
        description: "Twelve LEDs around the lid show your daily progress at a glance. Full ring = goal hit. No phone needed.",
        icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z",
        image: `${CF_IMG}/bottle-black-gym-v2/public`,
      },
      {
        title: "Smart Reminders",
        description: "Gentle LED pulses when you haven't sipped in a while. Adjusts to your schedule and activity level.",
        icon: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
        image: `${CF_IMG}/bottle-white-park/public`,
      },
      {
        title: "Hydration Insights",
        description: "See how hydration affects your sleep, energy, and recovery. The app correlates your intake with data from other SeeMyHealth devices.",
        icon: "M3 17l6-6 4 4 8-8M14 7h7v7",
        image: `${CF_IMG}/bottle-black-picnic/public`,
      },
    ],
    lifestyleImages: [
      { src: `${CF_IMG}/bottle-black-picnic/public`, alt: "Hydra One Abyss Black in picnic basket" },
      { src: `${CF_IMG}/bottle-white-office/public`, alt: "Hydra One white on office desk with city view" },
      { src: `${CF_IMG}/bottle-white-park/public`, alt: "Hydra One white in park" },
      { src: `${CF_IMG}/bottle-black-gym-v2/public`, alt: "Hydra One black in gym" },
      { src: `${CF_IMG}/bottle-white-beach/public`, alt: "Hydra One white on beach sand" },
      { src: `${CF_IMG}/bottle-black-conference/public`, alt: "Hydra One Abyss Black at conference venue" },
      { src: `${CF_IMG}/bottle-white-airport/public`, alt: "Hydra One white at airport lounge" },
    ],
  },
  "hema-one": {
    name: "Hema One",
    tagline: "Your Blood, Your Data",
    headline: "Lab results,\nno lab visit",
    description: "At-home blood analysis for key health markers. A small sample from your fingertip gives you lab-quality results in minutes, right in the app.",
    image: `${CF_IMG}/hema-one-web/public`,
    streamId: "8f576ad01105f0b3c8ff5495c066906e",
    specImage: `${CF_IMG}/hema-one-side-profile/public`,
    benefitsImage: `${CF_IMG}/hema-desk-results/public`,
    ogImage: `${CF_IMG}/og-hema-one/public`,
    price: "$159",
    color: "#A855F7",
    specs: [
      { label: "Markers", value: "Triglycerides, Total Cholesterol, HDL-C, LDL-C, Blood Glucose, Hemoglobin, Uric Acid" },
      { label: "Lipid Panel", value: "15 sec, ~13 μL sample" },
      { label: "Glucose", value: "5 sec, ~3 μL sample" },
      { label: "Hemoglobin", value: "5 sec, ~4 μL sample" },
      { label: "Uric Acid", value: "5 sec, ~4 μL sample" },
      { label: "Hematocrit Range", value: "30–55%" },
      { label: "Sample Method", value: "Fingertip microsampling" },
      { label: "Strip Recognition", value: "NFC automatic identification" },
      { label: "Display", value: "LED high-definition" },
      { label: "Connectivity", value: "Bluetooth 5.0" },
      { label: "Test Strips", value: "10 included, refills available" },
      { label: "Charging", value: "USB-C" },
    ],
    features: [
      {
        title: "Quick Results",
        description: "Place a tiny sample on the test strip and insert into Hema One. Glucose, hemoglobin, and uric acid results in 5 seconds. Full lipid profile (TC, HDL-C, LDL-C, triglycerides) in 15 seconds.",
        icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
        image: `${CF_IMG}/hema-black-hand-v2/public`,
      },
      {
        title: "Comprehensive Markers",
        description: "Full lipid profile (total cholesterol, HDL-C, LDL-C, triglycerides), blood glucose, uric acid, and hemoglobin. The markers that matter most for everyday health.",
        icon: "M22 12h-4l-3 9L9 3l-3 9H2",
        image: `${CF_IMG}/hema-black-lab/public`,
      },
      {
        title: "Trend Analysis",
        description: "See how your blood markers change over time. Spot deficiencies early and track the impact of dietary changes.",
        icon: "M3 17l6-6 4 4 8-8M14 7h7v7",
        image: `${CF_IMG}/hema-orange-kitchen-v2/public`,
      },
      {
        title: "Share with Doctor",
        description: "Grant your healthcare provider secure, authenticated access to your blood marker history with a single toggle. They see the longitudinal data they rarely get, and you stay in full control.",
        icon: "M4 12v8a2 2 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13",
        image: `${CF_IMG}/hema-orange-doctor/public`,
      },
    ],
    lifestyleImages: [
      { src: `${CF_IMG}/hema-orange-kitchen-v2/public`, alt: "Hema One Ember Orange on kitchen counter with test strips and fruit" },
      { src: `${CF_IMG}/hema-orange-clinic/public`, alt: "Hema One Ember Orange on clinic desk with stethoscope" },
      { src: `${CF_IMG}/hema-black-bedside/public`, alt: "Hema One on bedside table with wellness book" },
      { src: `${CF_IMG}/hema-black-hand-v2/public`, alt: "Hema One in hand with test strip and lancet" },
      { src: `${CF_IMG}/hema-orange-wellness/public`, alt: "Hema One Ember Orange on wooden desk with yoga mat and berries" },
      { src: `${CF_IMG}/hema-black-lab/public`, alt: "Hema One on lab desk showing lipid panel and glucose readings" },
      { src: `${CF_IMG}/hema-orange-poster/public`, alt: "Hema One Ember Orange on wooden desk with yoga mat and reflection" },
      { src: `${CF_IMG}/hema-orange-doctor/public`, alt: "Doctor holding Hema One Ember Orange with test strip" },
    ],
  },
};

export const productSlugs = Object.keys(products);
export { CF_IMG, CF_STREAM };
