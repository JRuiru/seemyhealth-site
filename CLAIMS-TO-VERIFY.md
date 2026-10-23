# Claims to verify

Hardware and accuracy claims that are live on the device pages and have not been checked against
a datasheet, a certificate or the manufacturer. Each one needs a source, or a change of copy. When a
claim is confirmed, note the source beside it in the code (a comment in `src/data/products.ts` or
`src/data/product-content.ts`) and delete its line here; delete this file when nothing is left.

## Ring One

- [ ] **Materials:** "Non-allergenic shell, biocompatible resin" (`products.ts`, specs). Earlier copy
      said titanium. Which is it, and does "non-allergenic" hold up?
- [ ] **Weight:** "4-6g" (`products.ts`, SEO description).
- [ ] **Battery:** "Up to 7 days".
- [ ] **Water:** "IP68, 50m depth" and "waterproof to 50m".
- [ ] **Bluetooth 5.2**, **sizes 6-13**, and **skin temperature** among the measures (SEO description).
- [ ] **Prices:** Phantom Black $179, Aurora Gold $199 (SEO description, hard-coded).

## The Scale

- [ ] **14 measurements** and **4-point BIA**.
- [ ] **Accuracy:** "0-50kg ±300g, 51-100kg ±400g, 101-180kg ±500g".
- [ ] **Display:** hidden LED, auto shut-off after about 10 s. **Battery:** 3x AAA, included.
- [ ] **About 10 seconds** to a reading.

## The Scale Pro

- [ ] **32 measurements**, **multi-frequency BIA**, **8 electrodes** (4 feet, 4 hands).
- [ ] **The advanced metrics list:** visceral fat, subcutaneous fat, skeletal muscle, bone mass, body
      cell mass, protein ratio, intracellular and extracellular water, minerals, adiposity level.
- [ ] **Battery:** USB-C, about 2 hours to full, "several weeks" of use.

## BP Monitor

- [ ] **"FDA cleared, CE marked"** (`products.ts`, Certification). The most important one on the
      site: a regulatory claim needs the clearance number and the CE certificate.
- [ ] **Accuracy:** ±3 mmHg pressure, ±5% pulse.
- [ ] **Irregular heartbeat detection**, flagged by the monitor during a reading.
- [ ] **Cuff:** 22 to 42 cm. **About 30 seconds** a reading. **Bluetooth 5.0**.

## Hydra One

- [ ] **Battery:** up to 30 days on one USB-C charge.
- [ ] **Keeps drinks cold for up to 12 hours**, double-walled, **BPA-free Tritan** with a stainless steel lid.
- [ ] **12-LED progress ring** and **reminders** ("a soft glow when it's been a while"). Earlier copy
      said reminders adjust to activity and weather; that was removed, keep it out unless confirmed.
- [ ] **Every sip counted automatically.** In the app the bottle's pairing is still "Coming Soon"
      (its link protocol is a placeholder until the vendor's specification arrives), so check the
      page does not promise more than the app does today.

## Hema One

- [ ] **Seven markers:** total cholesterol, HDL, LDL, triglycerides, glucose, uric acid, haemoglobin.
- [ ] **Times and samples:** lipid panel 15 s (~13 μL); glucose, haemoglobin, uric acid 5 s (~3-4 μL).
- [ ] **The strip identifies its own test** ("Each strip tells Hema One what it's testing").
- [ ] **Accuracy:** earlier copy said ±2% against lab reference methods. It is off the page now;
      keep it off unless confirmed.
- [ ] **App pairing:** like the bottle, the analyser's pairing is "Coming Soon" in the app.

## Site-wide

- [ ] **Store links:** every App Store and Google Play button points to `#` until the listings are live.
- [ ] **Prices and the Premium trial** ($8 a month, $70 a year, first month free) are hard-coded on
      the app page and the shop; check them against the store listings at launch.
- [ ] **Data:** "encrypted in transit (TLS 1.3) and at rest (AES-256)" on the app page FAQ. The iOS
      app's own notes say the on-device Couchbase file is not encrypted at rest (it is kept out of
      backups instead), so "at rest" is true at most for the servers. Confirm the server side and
      word the answer to match.
