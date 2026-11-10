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
        description: "Open the box and take out your Ring One and its charger. Check that everything's included.",
      },
      {
        title: "Charge",
        description: "Pop Ring One on its charger (its blue light just shows the charger has power). The green light on the ring itself flashes while it charges and stays steady when it's full. A full charge takes about an hour and lasts up to 7 days. Leave it there for setup: you start with your ring on its charger and your phone close by.",
      },
      {
        title: "Pair",
        description: "Open SeeMyHealth and tap the ring icon on Home, or go to Devices › Ring One › Set up. With Bluetooth on and the ring on its charger right next to your phone, the app looks for it. Pick the closest ring (it's the one on the charger next to your phone) and tap That's mine.",
        tip: "Not showing up? Give it 5 minutes on the charger: it might just be flat.",
      },
      {
        title: "Software update",
        description: "Once it's connected, the app checks for the latest software. If there's an update, it installs straight from your phone, with no charger needed. Keep your ring charged to 50% or more, your phone close by and the app open until it's done. Below 50%? Wait while it charges, or finish setup and update later from your ring page.",
      },
      {
        title: "Which hand and finger",
        description: "Tell the app which hand and finger your ring is on, so it reads your data accurately. It should feel snug but still turn with a gentle push, and slide over your knuckle with a little resistance. Fingers swell in the heat and after exercise and shrink in the cold, so check the fit later in the day.",
        tip: "Not sure? The index finger on your non-dominant hand works best for most people. Moved it to another finger? Update it in Ring details.",
      },
      {
        title: "Wear it",
        description: "Wear it to bed tonight and your first sleep data will be here in the morning. Your baselines take about a week.",
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
        description: "Remove The Scale and put in the 3 AAA batteries (included).",
      },
      {
        title: "Place",
        description: "Set the scale on a hard, flat surface, not carpet or a rug: a soft floor throws the readings off.",
      },
      {
        title: "Pair",
        description: "Open SeeMyHealth and go to Devices › The Scale › Set up. Step on (or tap it with your foot) until the display lights up. It may show a weight: that's fine, nothing is saved. The scale then appears on your phone: pick the one you just woke (usually the closest) and the app links it. Once the display switches off, it's ready.",
      },
      {
        title: "Just me or shared",
        description: "During setup, choose how you use it. Just me: your readings save even when your phone isn't around and sync the next time you open the app. Shared: family or housemates use it too, and each person adds the same scale in their own SeeMyHealth app. Readings then save only while you measure in the app, so nobody else's weight lands in your trends.",
        tip: "Everyone sees only their own readings. You can switch modes any time from Manage.",
      },
      {
        title: "First reading",
        description: "Tap Measure in the app and step on with bare, dry feet. Stand tall with your weight even on both feet and your arms relaxed by your sides, and stay still until it's done. Weight, body fat, muscle mass and 11 more metrics sync to the app.",
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
        description: "Remove The Scale Pro and its USB-C charging cable.",
      },
      {
        title: "Charge",
        description: "The Scale Pro is rechargeable, with no batteries to change. Plug the USB-C cable into the scale and a USB power adapter, and charge it fully before first use (about 2 hours). One charge lasts several weeks.",
      },
      {
        title: "Place",
        description: "Set the scale on a hard, flat surface, not carpet or a rug: a soft floor throws the readings off.",
      },
      {
        title: "Pair",
        description: "Open SeeMyHealth and go to Devices › The Scale Pro › Set up. Step on (or tap it with your foot) until the display lights up. No need to hold the handle: that's only for measuring. It may show a weight: that's fine, nothing is saved. The scale then appears on your phone: pick the one you just woke (usually the closest) and the app links it. Once the display switches off, it's ready.",
      },
      {
        title: "Just me or shared",
        description: "During setup, choose how you use it. Just me: your readings save even when your phone isn't around and sync the next time you open the app. Shared: family or housemates use it too, and each person adds the same scale in their own SeeMyHealth app. Readings then save only while you measure in the app, so nobody else's weight lands in your trends.",
        tip: "Everyone sees only their own readings, segmental data included. You can switch modes any time from Manage.",
      },
      {
        title: "First reading",
        description: "Tap Measure in the app and step on with bare, dry feet. Pull out the handle bar and grip it firmly, thumbs on the electrodes, arms straight and held out at about 45° from your body. Hold still until it's done, and 32 metrics including segmental muscle and fat sync to the app.",
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
        title: "Power",
        description: "Put in 4 AAA batteries (not included), or plug the USB-C cable into the monitor and a USB power adapter in an outlet. Either works.",
      },
      {
        title: "Pair",
        description: "Open SeeMyHealth and go to Devices › BP Monitor › Set up. Press Start on the monitor once (no need to wear the cuff). When bt flashes on its display, it appears on your phone: pick the one you just woke (usually the closest) and the app links it.",
      },
      {
        title: "It switches off",
        description: "Once it's linked, the app switches the monitor off for you. That's normal. Nothing is measured or saved during setup.",
      },
      {
        title: "Fit the cuff",
        description: "Wrap the cuff snugly around your bare upper left arm, 1–2cm above the elbow. The tube should run down the inside of your arm.",
        tip: "Sit with your arm at heart level, feet flat on the floor.",
      },
      {
        title: "First reading",
        description: "Sit comfortably and relax for 1 minute. Tap Measure in the app: it looks for your linked monitor automatically. Then press Start on the monitor, and the app connects and starts the measurement for you. Stay still and quiet until it's done, and your blood pressure and pulse land in the app.",
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
        description: "Plug Hydra One in with its USB-C cable. A full charge takes about 2 hours and lasts about 2 weeks.",
      },
      {
        title: "Pair",
        description: "Open SeeMyHealth and go to Devices › Hydra One › Set up. With Bluetooth on and the bottle plugged in right next to your phone, the app looks for it. Pick the closest bottle (it's the one plugged in next to your phone) and tap That's mine.",
        tip: "Not showing up? Give it 5 minutes plugged in: it might just be flat.",
      },
      {
        title: "Software update",
        description: "Once it's connected, the app checks for the latest software and installs any update straight from your phone. Keep your bottle charged to 50% or more, your phone close by and the app open until it's done, or finish setup and update later from your bottle page.",
      },
      {
        title: "Glow reminders",
        description: "Your bottle lights up when it's time for a sip. Pick a colour you'll notice and when it glows: Smart, only when you're behind your water goal for the time of day, or every hour. Tap Test the glow to see it.",
        tip: "Set a water goal in Goals so Smart knows your pace.",
      },
      {
        title: "Fill it up",
        description: "Fill it up and your first sips show in the app and in Nutrition, with no logging.",
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
        description: "Remove the Hema One meter, its 4 AAA batteries (included), 10 test strips, the lancing device, and 10 lancets.",
      },
      {
        title: "Batteries",
        description: "Put in the 4 AAA batteries, the right way round. Hema One runs on batteries, with nothing to charge.",
      },
      {
        title: "Pair",
        description: "Open SeeMyHealth and go to Devices › Hema One › Set up. When asked, press and hold the power button (no strip needed yet). When the Bluetooth sign flashes on its screen, it appears on your phone: pick the one you just turned on (usually the closest), tap That's mine, and the app links it.",
        tip: "Screen stays dark? Check the batteries are in the right way round.",
      },
      {
        title: "Just me or shared",
        description: "During setup, choose who uses it. Just me: your results save even when your phone isn't around and sync the next time you open the app. Shared: family use it too, and each person adds the same meter in their own SeeMyHealth app. Results then save only while you test in the app, so nobody else's land in your trends. Then give it a name if you like.",
        tip: "You can change this any time in the meter's settings.",
      },
      {
        title: "Prepare",
        description: "Wash your hands in warm water and dry them well. Take one strip and close the tube straight away, and have your lancing device ready. Each test has its own strips: Hema One reads the strip by NFC, so it knows which test it is.",
      },
      {
        title: "First test",
        description: "Tap Test in the app, then insert the strip, contacts end first: Hema One wakes, the app connects and the meter knows which test it is. Prick the side of a fingertip, gently squeeze until a round drop forms, and touch it to the strip's tip: it draws in by itself. Leave the strip in and keep the meter still. Glucose, haemoglobin and uric acid take about 5 seconds from a small drop; the cholesterol panel takes about 15 seconds and needs a bigger drop. Your result saves to Blood test trends.",
        tip: "Keep the app open until your result shows. For the cholesterol panel, fasting for 9–12 hours is best.",
      },
    ],
  },
};
