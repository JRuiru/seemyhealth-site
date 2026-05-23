interface Review {
  name: string;
  rating: number;
  date: string;
  title: string;
  body: string;
  verified: boolean;
}

interface Props {
  productName: string;
  accentColor: string;
}

// Placeholder reviews — replace with real data from Judge.me / Shopify metafields
const reviewsByProduct: Record<string, Review[]> = {
  "ring-one": [
    { name: "James R.", rating: 5, date: "Apr 2026", title: "Replaced my Oura Ring", body: "The sleep tracking is incredibly accurate. I've been comparing it with my old Oura Ring 3 and the data is just as good — if not better on HRV. The titanium build feels premium.", verified: true },
    { name: "Sarah K.", rating: 5, date: "Mar 2026", title: "Forget you're wearing it", body: "It's so light I genuinely forget it's there. Battery lasts about 5 days for me. The app is clean and the stress detection nudges have been genuinely helpful.", verified: true },
    { name: "Mike T.", rating: 4, date: "Mar 2026", title: "Great ring, app needs polish", body: "Hardware is outstanding. The ring itself is beautiful and comfortable 24/7. App could use a few more customization options but data accuracy is solid.", verified: true },
  ],
  "scale": [
    { name: "Linda P.", rating: 5, date: "Apr 2026", title: "Way more than a scale", body: "Seeing my body fat and muscle mass trends over 3 months has been eye-opening. My weight barely changed but my composition improved dramatically.", verified: true },
    { name: "David W.", rating: 5, date: "Mar 2026", title: "Whole family uses it", body: "Works great with 4 profiles. Everyone connects through the app and gets their own private dashboard. Setup was painless.", verified: true },
    { name: "Emma L.", rating: 4, date: "Feb 2026", title: "Solid metrics", body: "Good accuracy on body fat compared to my DEXA scan. The trend analysis is what keeps me coming back to the app every morning.", verified: true },
  ],
  "bp-monitor": [
    { name: "Robert H.", rating: 5, date: "Apr 2026", title: "Doctor recommended this", body: "My cardiologist can see my readings in real time. No more writing numbers in a notebook. The accuracy matches the clinical-grade unit at my doctor's office.", verified: true },
    { name: "Patricia M.", rating: 5, date: "Mar 2026", title: "Simple and accurate", body: "One button, 30 seconds, done. The irregular heartbeat detection caught something I had no idea about. Grateful for this device.", verified: true },
    { name: "Thomas B.", rating: 4, date: "Feb 2026", title: "Great for daily monitoring", body: "AM/PM reminder feature keeps me consistent. The trend charts are exactly what my doctor was asking for.", verified: true },
  ],
  "hydra-one": [
    { name: "Alex N.", rating: 5, date: "Apr 2026", title: "Actually drink enough water now", body: "The LED ring is simple but effective. I find myself reaching for it throughout the day just to fill the ring. Battery lasts forever.", verified: true },
    { name: "Jessica F.", rating: 5, date: "Mar 2026", title: "Beautiful and functional", body: "Keeps my water cold all day. The auto-tracking is seamless — no tapping or logging. Pairs perfectly with the Ring One data.", verified: true },
    { name: "Chris D.", rating: 4, date: "Mar 2026", title: "Smart hydration tracking", body: "The correlation data with sleep and recovery is interesting. Would love an insulated option for hot drinks too.", verified: true },
  ],
  "hema-one": [
    { name: "Dr. Anil S.", rating: 5, date: "Apr 2026", title: "Game changer for patients", body: "I recommend this to patients who need regular blood work monitoring. The accuracy is impressive for a consumer device. Saves them frequent lab visits.", verified: true },
    { name: "Maria G.", rating: 5, date: "Mar 2026", title: "Worth every penny", body: "Tracking my hemoglobin and lipid profile monthly has helped me optimize my supplements. The trend detection caught a deficiency early.", verified: true },
    { name: "Kevin L.", rating: 4, date: "Feb 2026", title: "Convenient blood testing", body: "The fingertip prick is minimal. Getting glucose, full lipid profile, and uric acid readings at home is incredibly convenient. Results in seconds.", verified: true },
  ],
};

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i <= count ? "text-amber-400" : "text-brand-gray-800"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function CustomerReviews({ productName, accentColor }: Props) {
  // Find reviews by matching product name to key
  const slug = Object.keys(reviewsByProduct).find((k) =>
    productName.toLowerCase().includes(k.replace(/-/g, " ").replace("one", "one"))
  );
  const reviews = slug ? reviewsByProduct[slug] : reviewsByProduct["ring-one"];
  if (!reviews) return null;

  const avgRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);

  return (
    <section className="py-16 sm:py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10">
          <div>
            <p
              className="text-[11px] uppercase tracking-[4px] mb-4"
              style={{ color: accentColor }}
            >
              Customer Reviews
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-300 uppercase leading-[0.95]">
              What people <span className="font-500">are saying</span>
            </h2>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <Stars count={Math.round(parseFloat(avgRating))} />
            <span className="text-sm text-brand-gray-400">{avgRating} out of 5</span>
            <span className="text-[11px] text-brand-gray-600">({reviews.length} reviews)</span>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 sm:overflow-visible">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="shrink-0 w-[78vw] sm:w-auto p-6 rounded-2xl bg-white/[0.03] border border-white/5"
            >
              <div className="flex items-center justify-between mb-3">
                <Stars count={review.rating} />
                <span className="text-[10px] text-brand-gray-600">{review.date}</span>
              </div>
              <h3 className="text-sm font-medium text-white mb-2">{review.title}</h3>
              <p className="text-sm text-brand-gray-400 leading-relaxed mb-4">{review.body}</p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-brand-gray-500">{review.name}</span>
                {review.verified && (
                  <span className="text-[9px] uppercase tracking-[1px] px-1.5 py-0.5 rounded-full bg-green-500/10 text-green-400">
                    Verified
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
