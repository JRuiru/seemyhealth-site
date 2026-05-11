interface Props {
  open: boolean;
  onClose: () => void;
  accentColor: string;
  onSelectSize: (size: string) => void;
}

const SIZES = [
  { size: "6",  diameter: 16.5, circumference: 51.8 },
  { size: "7",  diameter: 17.3, circumference: 54.4 },
  { size: "8",  diameter: 18.1, circumference: 56.9 },
  { size: "9",  diameter: 18.9, circumference: 59.5 },
  { size: "10", diameter: 19.8, circumference: 62.1 },
  { size: "11", diameter: 20.6, circumference: 64.6 },
  { size: "12", diameter: 21.4, circumference: 67.2 },
  { size: "13", diameter: 22.2, circumference: 69.7 },
];

const TIPS = [
  { title: "Measure in the evening", body: "Fingers are largest after a full day of activity. Morning measurements can be half a size smaller." },
  { title: "Warm your hands first", body: "Cold fingers shrink. Warm up for a few minutes before measuring for the most accurate fit." },
  { title: "Make a fist test", body: "With the sizer on, make a fist. If there's a visible gap between ring and finger, go one size down." },
  { title: "If between sizes, go smaller", body: "Ring One's smooth inner curve means a snug fit stays comfortable. A loose ring will spin and disrupt sensor contact." },
  { title: "Wear it for 24 hours", body: "Your finger size changes throughout the day. Wear the sizing ring for a full day before deciding." },
];

export default function RingSizeGuide({ open, onClose, accentColor, onSelectSize }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-brand-gray-950 border border-white/10 rounded-t-3xl sm:rounded-3xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-brand-gray-950/95 backdrop-blur-sm border-b border-white/5">
          <div>
            <p className="text-[10px] uppercase tracking-[3px] mb-1" style={{ color: accentColor }}>
              Ring One
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-400 uppercase">
              Size Guide
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-brand-gray-400 hover:text-white hover:border-white/20 transition-all"
            aria-label="Close size guide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-6 space-y-8">

          {/* Sizing Kit CTA */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 shrink-0 rounded-xl flex items-center justify-center" style={{ background: `${accentColor}15` }}>
                <svg className="w-6 h-6" style={{ color: accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-medium text-white mb-1">Need a Sizing Kit?</h3>
                <p className="text-[13px] text-brand-gray-400 leading-relaxed mb-3">
                  Not sure of your size? Order a sizing kit with 8 precision sizer rings (sizes 6–13) to find your perfect fit before committing to your Ring One.
                </p>
                <a
                  href="/shop"
                  className="text-[11px] uppercase tracking-[1.5px] font-medium underline underline-offset-2 hover:opacity-80 transition-opacity"
                  style={{ color: accentColor }}
                >
                  Buy Sizing Kit
                </a>
              </div>
            </div>
          </div>

          {/* Size Chart */}
          <div>
            <h3 className="text-[11px] uppercase tracking-[3px] text-brand-gray-400 mb-4">Size Chart</h3>
            <div className="rounded-xl border border-white/5 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[2px] text-brand-gray-500 font-medium">Size</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[2px] text-brand-gray-500 font-medium">Inner Diameter</th>
                    <th className="text-left px-4 py-3 text-[10px] uppercase tracking-[2px] text-brand-gray-500 font-medium">Circumference</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {SIZES.map((s) => (
                    <tr key={s.size} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-white font-medium">{s.size}</td>
                      <td className="px-4 py-3 text-brand-gray-400">{s.diameter.toFixed(1)} mm</td>
                      <td className="px-4 py-3 text-brand-gray-400">{s.circumference.toFixed(1)} mm</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => { onSelectSize(s.size); onClose(); }}
                          className="text-[10px] uppercase tracking-[1.5px] font-medium hover:opacity-80 transition-opacity"
                          style={{ color: accentColor }}
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* How to Measure at Home */}
          <div>
            <h3 className="text-[11px] uppercase tracking-[3px] text-brand-gray-400 mb-4">How to Measure at Home</h3>
            <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-medium" style={{ background: `${accentColor}20`, color: accentColor }}>
                  1
                </div>
                <div>
                  <p className="text-sm text-white font-medium mb-0.5">String or paper method</p>
                  <p className="text-[13px] text-brand-gray-400 leading-relaxed">
                    Wrap a thin strip of paper or string around the base of your finger. Mark where the ends meet, then measure the length in millimeters. Match to the circumference column above.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-[11px] font-medium" style={{ background: `${accentColor}20`, color: accentColor }}>
                  2
                </div>
                <div>
                  <p className="text-sm text-white font-medium mb-0.5">Existing ring method</p>
                  <p className="text-[13px] text-brand-gray-400 leading-relaxed">
                    Place a ring that fits well on a ruler. Measure the inside diameter in millimeters. Match to the diameter column above.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sizing Tips */}
          <div>
            <h3 className="text-[11px] uppercase tracking-[3px] text-brand-gray-400 mb-4">Sizing Tips</h3>
            <div className="space-y-3">
              {TIPS.map((tip, i) => (
                <div key={i} className="flex items-start gap-3">
                  <svg className="w-4 h-4 shrink-0 mt-0.5" style={{ color: accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <div>
                    <span className="text-sm text-white font-medium">{tip.title}</span>
                    <span className="text-sm text-brand-gray-500"> — {tip.body}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended finger */}
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-5">
            <h3 className="text-sm font-medium text-white mb-2">Which finger?</h3>
            <p className="text-[13px] text-brand-gray-400 leading-relaxed">
              Ring One works best on your <strong className="text-white">index finger</strong> — it provides the most consistent sensor contact. Middle and ring fingers also work well. Avoid the thumb and pinky, where blood flow patterns are less reliable for health tracking.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
