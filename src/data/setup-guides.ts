const CF_IMG = "https://imagedelivery.net/NnC2JvU8j4bgBbmedVhjJg";

export interface Step {
  title: string;
  description: string;
  tip?: string;
}

export interface DeviceSetup {
  name: string;
  color: string;
  image: string;
  steps: Step[];
}

export const setupData: Record<string, DeviceSetup> = {
  "ring-one": {
    name: "Ring One",
    color: "#F97316",
    image: `${CF_IMG}/ring-hero-hands/public`,
    steps: [
      {
        title: "Unbox",
        description: "Open the box and take out your Ring One, charging dock, and sizing kit. Check that everything's included.",
      },
      {
        title: "Charge",
        description: "Place Ring One on the charging dock. The LED pulses while charging and stays solid when full. A full charge takes about 60 minutes and lasts up to 7 days.",
      },
      {
        title: "Size",
        description: "Try the sizing rings included in the kit. Wear your best fit for at least 24 hours since finger size changes throughout the day. Pick snug but comfortable.",
        tip: "Your index finger usually gives the best sensor contact.",
      },
      {
        title: "Pair",
        description: "Open the SeeMyHealth app → tap + → scan the QR on the box. Your ring connects via Bluetooth automatically.",
        tip: "Make sure Bluetooth is enabled on your phone.",
      },
      {
        title: "First reading",
        description: "Wear your ring and go about your day. Heart rate and activity data appear within hours. Full sleep and recovery data arrives after your first night.",
      },
    ],
  },
  "scale": {
    name: "The Scale",
    color: "#3B82F6",
    image: `${CF_IMG}/scale-black-pack/public`,
    steps: [
      {
        title: "Unbox",
        description: "Remove The Scale and insert the 4 AAA batteries (included).",
      },
      {
        title: "Place",
        description: "Set the scale on a hard, flat surface. Carpet affects accuracy, so use the included feet extensions if needed.",
      },
      {
        title: "Pair",
        description: "Open the SeeMyHealth app → tap + → select The Scale. Step on barefoot and the app detects and pairs it via Bluetooth.",
      },
      {
        title: "Profiles",
        description: "Add household members in the app. Each person opens the app, connects to the scale, and their reading saves to their own profile.",
        tip: "Each person gets their own private dashboard.",
      },
      {
        title: "First reading",
        description: "Step on barefoot and stand still for 10 seconds. Weight, body fat, muscle mass, and 10 more metrics sync to the app instantly.",
      },
    ],
  },
  "scale-pro": {
    name: "The Scale Pro",
    color: "#3B82F6",
    image: `${CF_IMG}/scale-pro-hero-new/public`,
    steps: [
      {
        title: "Unbox",
        description: "Remove The Scale Pro and insert the 4 AAA batteries (included). Extend the retractable handle to check it moves freely.",
      },
      {
        title: "Place",
        description: "Set the scale on a hard, flat surface. Carpet affects accuracy, so use the included feet extensions if needed.",
      },
      {
        title: "Pair",
        description: "Open the SeeMyHealth app → tap + → select The Scale Pro. Step on barefoot and grip the handle. The app detects and pairs automatically.",
      },
      {
        title: "Profiles",
        description: "Add household members in the app. Each person opens the app, connects to the scale, and their reading saves to their own profile.",
        tip: "Each person gets their own private dashboard with segmental data.",
      },
      {
        title: "First reading",
        description: "Step on barefoot, grip the handle with both hands, arms at 45°. Hold for 15 seconds. 32 metrics including segmental muscle and fat data sync to the app.",
      },
    ],
  },
  "bp-monitor": {
    name: "BP Monitor",
    color: "#EF4444",
    image: `${CF_IMG}/bp-black/public`,
    steps: [
      {
        title: "Unbox",
        description: "Remove the BP Monitor and USB-C cable. The cuff is pre-attached.",
      },
      {
        title: "Charge",
        description: "Connect via USB-C and charge fully. The LED turns solid green when ready.",
      },
      {
        title: "Pair",
        description: "Open the SeeMyHealth app → tap + → select BP Monitor. Press the power button on the device and it connects via Bluetooth.",
      },
      {
        title: "Fit the cuff",
        description: "Wrap the cuff snugly around your bare upper left arm, 1–2cm above the elbow. The tube should run down the inside of your arm.",
        tip: "Sit with your arm at heart level, feet flat on the floor.",
      },
      {
        title: "First reading",
        description: "Sit comfortably and relax for 1 minute. Press Start. Stay still. Results appear in about 30 seconds and sync to the app.",
        tip: "For the best data, measure at the same time each day.",
      },
    ],
  },
  "hydra-one": {
    name: "Hydra One",
    color: "#06B6D4",
    image: `${CF_IMG}/bottle-office-scene/public`,
    steps: [
      {
        title: "Unbox",
        description: "Remove Hydra One and the USB-C cable.",
      },
      {
        title: "Charge",
        description: "Connect the sensor base via USB-C. A full charge lasts up to 30 days.",
      },
      {
        title: "Pair",
        description: "Open the SeeMyHealth app → tap + → select Hydra One. The bottle connects via Bluetooth automatically.",
      },
      {
        title: "Set your goal",
        description: "The app suggests a daily hydration target based on your weight and activity. Adjust it anytime in Settings > Goals > Hydration.",
        tip: "The app nudges you when you're falling behind.",
      },
    ],
  },
  "hema-one": {
    name: "Hema One",
    color: "#A855F7",
    image: `${CF_IMG}/hema-one-web/public`,
    steps: [
      {
        title: "Unbox",
        description: "Remove the Hema One analyzer, USB-C cable, test strips, and lancets.",
      },
      {
        title: "Charge",
        description: "Connect via USB-C and charge fully. The display shows battery level.",
      },
      {
        title: "Pair",
        description: "Open the SeeMyHealth app → tap + → select Hema One. The analyzer connects via Bluetooth.",
      },
      {
        title: "Prepare",
        description: "Insert a test strip into the slot. NFC auto-identifies the strip type and the device confirms it's ready. Wash your hands with warm water to improve blood flow.",
      },
      {
        title: "First test",
        description: "Use the included lancet on your fingertip. Apply a small drop (~1μL) to the test strip. Results appear on the LED display in 5–15 seconds and sync to the app.",
        tip: "Prick the side of your fingertip. It's less sensitive than the center.",
      },
    ],
  },
};
