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
    introLine1: "Wear it to bed.",
    introLine2: "Wake up to the story.",
    howItWorks: [
      { title: "Wear It", description: "Slip it on and forget about it. Light, waterproof to 50m and happy to come to bed with you.", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" },
      { title: "Open the App", description: "Your night lands over Bluetooth on its own: heart rate, sleep stages, SpO2 and activity, all in one place.", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" },
      { title: "Watch It Add Up", description: "Over the weeks your sleep, recovery and stress trends take shape. Share them with your doctor if you like.", icon: "M3 17l6-6 4 4 8-8M14 7h7v7" },
    ],
    benefits: {
      headline: "Morning, noon and very late night.",
      items: [
        { title: "Recovery", description: "Wake up to a readiness score built from your HRV, resting heart rate and how you slept. A nudge, never a verdict." },
        { title: "Sleep Stages", description: "Light, deep and REM, tracked on their own. Then see how late dinners or that second coffee show up in your night." },
        { title: "Stress", description: "Your heart rate variability shows when the day's been heavy, with a gentle reminder to breathe when it might help." },
        { title: "Comfort", description: "Light enough to sleep in and smooth on the inside. Gone from your mind by lunch." },
      ],
    },
  },
  "scale": {
    introLine1: "Weight wobbles.",
    introLine2: "Trends tell the truth.",
    howItWorks: [
      { title: "Step On", description: "Open the app, connect and step on barefoot. Been here before? Just reconnect.", icon: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" },
      { title: "Get Your Numbers", description: "About 10 seconds later: weight, body fat, muscle, visceral fat, BMR and the rest of your 14.", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
      { title: "Watch the Trend", description: "See how your body changes over weeks and months, past the day-to-day wobble.", icon: "M3 17l6-6 4 4 8-8M14 7h7v7" },
    ],
    benefits: {
      headline: "Your body, not just your weight.",
      items: [
        { title: "14 Numbers", description: "Body fat, muscle mass, visceral fat, protein, BMR and more, all from one weigh-in." },
        { title: "Family Profiles", description: "Unlimited profiles, each one private. Everyone steps on the same scale and lands in their own account." },
        { title: "Trends", description: "Daily weight wobbles. Real trends don't. 7, 30 and 90-day views show what's actually moving." },
        { title: "Kind on the Wallet", description: "Proper body composition without the big price. Want arms and legs on their own? That's The Scale Pro." },
      ],
    },
  },
  "scale-pro": {
    introLine1: "Not just how much.",
    introLine2: "Where.",
    howItWorks: [
      { title: "Step On & Grip", description: "Step on barefoot and pull out the handles. 8 electrodes read your arms, legs and trunk at once.", icon: "M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z" },
      { title: "Segment by Segment", description: "About 10 seconds later: muscle and fat for each arm, each leg and your trunk, plus the rest of your 32 numbers.", icon: "M22 12h-4l-3 9L9 3l-3 9H2" },
      { title: "Track Each Part", description: "See how each part of you changes over time. Handy for training, getting back into it, or plain curiosity.", icon: "M3 17l6-6 4 4 8-8M14 7h7v7" },
    ],
    benefits: {
      headline: "For the detail lovers.",
      items: [
        { title: "Segmental Analysis", description: "Fat and muscle for each arm, each leg and your trunk. See when one side is doing more of the work." },
        { title: "32 Numbers", description: "Weight, heart rate, BMI, body fat, muscle, visceral fat, skeletal muscle, protein, bone mass, body cell mass, water, minerals and more." },
        { title: "Multi-Frequency", description: "Reads at more than one frequency, so it picks up the water inside and outside your cells for a fuller picture." },
        { title: "Family Profiles", description: "Unlimited profiles, each one private. Everyone steps on the same scale and lands in their own account." },
      ],
    },
  },
  "bp-monitor": {
    introLine1: "Fewer notebooks.",
    introLine2: "More patterns.",
    howItWorks: [
      { title: "Wrap the Cuff", description: "The cuff fits arms from 22 to 42cm, and the app shows you where it should sit.", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" },
      { title: "Press Start", description: "One button, about 30 seconds. Your reading shows on the monitor and lands in the app.", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
      { title: "Share If You Like", description: "Want your doctor in the loop? Switch them on in the app, and off again just as easily.", icon: "M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" },
    ],
    benefits: {
      headline: "Blood pressure, finally simple.",
      items: [
        { title: "Know the Numbers", description: "Within ±3 mmHg on pressure and ±5% on pulse, with every reading kept in the app." },
        { title: "Irregular Rhythm", description: "If your rhythm is irregular during a reading, the monitor flags it and the note stays with that reading." },
        { title: "Morning & Evening", description: "Set a reminder for each, and the app lines them up so you can see how they compare." },
        { title: "Every Reading Kept", description: "Your whole history lives in the app. No 60-reading memory to fill up." },
      ],
    },
  },
  "hydra-one": {
    introLine1: "Just drink.",
    introLine2: "We'll count.",
    howItWorks: [
      { title: "Fill & Go", description: "Fill it up and get on with your day. Every sip gets counted, no logging.", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
      { title: "Watch the Ring", description: "Twelve lights round the lid show how far you've got. A full ring means you're there.", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" },
      { title: "See the Bigger Picture", description: "Next to your sleep and recovery from other SeeMyHealth devices, your water starts telling a story.", icon: "M3 17l6-6 4 4 8-8M14 7h7v7" },
    ],
    benefits: {
      headline: "Water, without the maths.",
      items: [
        { title: "Counts Itself", description: "No buttons, no logging, no guessing. Just drink." },
        { title: "Gentle Reminders", description: "A soft glow when it's been a while, timed around your day." },
        { title: "A Month a Charge", description: "Up to 30 days of daily use on one USB-C charge." },
        { title: "Stays Cold", description: "Double-walled to keep drinks cold for up to 12 hours. BPA-free Tritan with a stainless steel lid." },
      ],
    },
  },
  "hema-one": {
    introLine1: "A few seconds.",
    introLine2: "A clearer picture.",
    howItWorks: [
      { title: "Prick & Place", description: "A small drop from your fingertip goes onto the test strip.", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" },
      { title: "Slide It In", description: "Hema One reads the strip and knows which test it is. Results in 5 to 15 seconds.", icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z" },
      { title: "Keep an Eye on It", description: "Watch your markers over time, and share them with your doctor if you like.", icon: "M3 17l6-6 4 4 8-8M14 7h7v7" },
    ],
    benefits: {
      headline: "Your blood, your data, your terms.",
      items: [
        { title: "Seven Markers", description: "Total cholesterol, HDL, LDL, triglycerides, blood glucose, uric acid and haemoglobin, from one small device." },
        { title: "Nothing to Set", description: "Each strip tells Hema One what it's testing. Slide it in and that's it." },
        { title: "Patterns, Not Snapshots", description: "One reading is a moment. A few months of them start to show how things are moving." },
        { title: "Your Doctor, If You Like", description: "Switch your doctor on in the app and they see your history. Switch them off whenever you like." },
      ],
    },
  },
};
