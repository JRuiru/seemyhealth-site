interface Props {
  productName: string;
  items: string[];
  accentColor: string;
}

export default function WhatsInTheBox({ productName, items, accentColor }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <section className="py-16 sm:py-20 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="max-w-2xl">
          <p
            className="text-[11px] uppercase tracking-[4px] mb-4"
            style={{ color: accentColor }}
          >
            What's in the Box
          </p>
          <h2 className="font-display text-2xl sm:text-3xl font-300 uppercase leading-[0.95] mb-8">
            Everything you need to <span className="font-500">get started</span>
          </h2>
          <ul className="space-y-3">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 shrink-0"
                  style={{ color: accentColor }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm text-brand-gray-300">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
