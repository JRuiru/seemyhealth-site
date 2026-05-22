// Per-product content for landing page sections
// Separated from products.ts to keep that file focused on commerce data

export interface HowItWorksStep {
  title: string;
  description: string;
  icon: string;  // SVG path
}

export interface Benefit {
  title: string;
  description: string;
}

export interface ProductContent {
  introLine1: string;
  introLine2: string;  // bold portion
  howItWorks: HowItWorksStep[];
  benefits: {
    headline: string;
    items: Benefit[];
  };
}

export const productContent: Record<string, ProductContent> = {
  "ring-one": {
    introLine1: "Health clarity,",
    introLine2: "day and night.",
    howItWorks: [
      { title: "Wear It", description: "Slide on Ring One and forget about it. Titanium build, IP68 rated, and light enough for 24/7 wear, even while you sleep.", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" },
      { title: "Sync with App", description: "Open the SeeMyHealth app and your data flows in automatically via Bluetooth. Heart rate, sleep stages, SpO2, activity, all in one dashboard.", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
      { title: "Track Your Health", description: "See your trends over time. Get insights on recovery, sleep quality, and stress patterns. Share reports with your doctor in one tap.", icon: "M3 17l6-6 4 4 8-8M14 7h7v7" },
    ],
    benefits: {
      headline: "Clarity, from morning to night.",
      items: [
        { title: "Recovery Insights", description: "Wake up knowing exactly how recovered you are. HRV, resting heart rate, and sleep quality combine into a single readiness score." },
        { title: "Advanced Sleep Tracking", description: "Light, deep, and REM stages tracked automatically. See how your habits affect your sleep, and what to change." },
        { title: "Stress Awareness", description: "Real-time stress detection based on heart rate variability patterns. Get gentle nudges to breathe when your body needs it." },
        { title: "Comfort-First Design", description: "4-6 grams of titanium with a smooth inner curve. Most people forget they're wearing it within an hour." },
      ],
    },
  },
  "scale": {
    introLine1: "Beyond weight.",
    introLine2: "The full picture.",
    howItWorks: [
      { title: "Step On", description: "Just step on the scale barefoot. Auto-recognition identifies you in seconds. No buttons, no setup.", icon: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" },
      { title: "Get Your Metrics", description: "In 10 seconds, see weight, body fat, muscle mass, bone density, water percentage, visceral fat, BMR, and more.", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
      { title: "Track Trends", description: "Open the app and see how your composition changes over weeks and months. Understand what's actually happening beyond daily fluctuations.", icon: "M3 17l6-6 4 4 8-8M14 7h7v7" },
    ],
    benefits: {
      headline: "Know your body, not just your weight.",
      items: [
        { title: "13+ Body Metrics", description: "Body fat, muscle mass, bone density, visceral fat, water percentage, BMR, metabolic age, protein, and more, all from a single weigh-in." },
        { title: "Family Profiles", description: "Unlimited user profiles with auto-recognition. Everyone in the household gets their own private dashboard." },
        { title: "Trend Analysis", description: "Daily weight fluctuates. Real trends don't. See your 7-day, 30-day, and 90-day trajectories to understand what's really changing." },
        { title: "Affordable Precision", description: "Accurate body composition at a fraction of the cost. Need segmental analysis? Upgrade to The Scale Pro." },
      ],
    },
  },
  "scale-pro": {
    introLine1: "Segment by segment.",
    introLine2: "Total clarity.",
    howItWorks: [
      { title: "Step On & Grip", description: "Step on barefoot and pull the retractable handles. 8-point electrodes measure through your arms, legs, and trunk simultaneously.", icon: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" },
      { title: "Segmental Breakdown", description: "In 10 seconds, see muscle and fat distribution for each arm, each leg, and your trunk. Plus 21 total body metrics.", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
      { title: "Track Progress", description: "The app shows how each body segment changes over time. Perfect for targeted training, rehab tracking, or balanced fitness goals.", icon: "M3 17l6-6 4 4 8-8M14 7h7v7" },
    ],
    benefits: {
      headline: "The same tech pro athletes use.",
      items: [
        { title: "Segmental Analysis", description: "See fat and muscle for each arm, leg, and trunk independently. Spot imbalances, track rehab progress, and train smarter." },
        { title: "32 Body Metrics", description: "Weight, heart rate, BMI, body fat, muscle mass, visceral fat, skeletal muscle, protein ratio, subcutaneous fat, bone mass, body cell mass, intracellular/extracellular water, minerals, and more." },
        { title: "Multi-Frequency BIA", description: "Multiple frequencies measure both intra- and extracellular water for significantly more accurate body composition than single-frequency scales." },
        { title: "Family Profiles", description: "Unlimited user profiles with auto-recognition. Everyone in the household gets their own private dashboard." },
      ],
    },
  },
  "bp-monitor": {
    introLine1: "Accuracy you trust.",
    introLine2: "Comfort you feel.",
    howItWorks: [
      { title: "Wrap the Cuff", description: "Adjustable cuff fits arms 22-42cm. The fit guide in the app ensures accurate placement every time.", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" },
      { title: "Press Start", description: "One button. 30 seconds. Your systolic, diastolic, and pulse rate appear on the device and sync to the app automatically.", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
      { title: "Share with Doctor", description: "Toggle access for your doctor in the app. They get authenticated, real-time access to your full BP history.", icon: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" },
    ],
    benefits: {
      headline: "Blood pressure, finally simple.",
      items: [
        { title: "Trusted Accuracy", description: "Readings you and your doctor can rely on. The same confidence you'd get at a doctor's office, from your living room." },
        { title: "Irregular Heartbeat Detection", description: "Automatically flags irregular heart rhythm patterns during measurement. Catches what you might not feel." },
        { title: "AM/PM Tracking", description: "Set reminders for consistent morning and evening readings. The app tracks patterns your doctor would want to see." },
        { title: "Unlimited History", description: "Every reading synced and stored. No 60-reading memory limit like traditional monitors. Your full history lives in the app." },
      ],
    },
  },
  "hydra-one": {
    introLine1: "Drink smarter.",
    introLine2: "Feel the difference.",
    howItWorks: [
      { title: "Fill & Go", description: "Fill the 500ml bottle and go about your day. The capacitive sensor tracks every sip automatically. No manual logging.", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
      { title: "Watch the Ring", description: "The 12-LED progress ring around the lid shows your daily progress at a glance. Full ring means you hit your goal.", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" },
      { title: "See Correlations", description: "The app shows how your hydration affects sleep, energy, and recovery when paired with other SeeMyHealth devices.", icon: "M3 17l6-6 4 4 8-8M14 7h7v7" },
    ],
    benefits: {
      headline: "Hydration that adapts to your life.",
      items: [
        { title: "Auto Tracking", description: "Capacitive sensors detect every sip. No buttons, no logging, no guessing. Just drink." },
        { title: "Smart Reminders", description: "Gentle LED pulses when you haven't sipped in a while. Adjusts to your schedule, activity level, and weather." },
        { title: "30-Day Battery", description: "Rechargeable via USB-C. One charge lasts a full month of daily use." },
        { title: "Double-Wall Insulation", description: "Keeps drinks cold for 12 hours. BPA-free Tritan body with stainless steel lid." },
      ],
    },
  },
  "hema-one": {
    introLine1: "Lab results.",
    introLine2: "No lab visit.",
    howItWorks: [
      { title: "Prick & Place", description: "A tiny fingertip sample (~1μL) goes onto the test strip. Quick and virtually painless.", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" },
      { title: "Insert & Wait", description: "Slide the test strip into Hema One. NFC auto-identifies the strip type. Results in 5–15 seconds: lipid profile, glucose, uric acid, hemoglobin.", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
      { title: "Track Over Time", description: "See how your markers change with diet, exercise, and supplements. Spot deficiencies early. Share trends with your doctor.", icon: "M3 17l6-6 4 4 8-8M14 7h7v7" },
    ],
    benefits: {
      headline: "Your blood, your data, your terms.",
      items: [
        { title: "Lab-Quality Accuracy", description: "±2% accuracy vs. laboratory reference methods. Real results you and your doctor can trust." },
        { title: "7 Key Markers", description: "Full lipid profile (TC, HDL-C, LDL-C, triglycerides), blood glucose, uric acid, and hemoglobin. The markers that matter most for everyday health." },
        { title: "Trend Detection", description: "One reading is a snapshot. Monthly readings reveal patterns. Track the impact of dietary changes and supplements." },
        { title: "Doctor Sharing", description: "Grant your provider secure, authenticated access with a single toggle. They see the longitudinal data they rarely get." },
      ],
    },
  },
};
