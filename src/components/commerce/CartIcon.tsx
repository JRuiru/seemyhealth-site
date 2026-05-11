import { useState, useEffect } from "react";

export default function CartIcon() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const onCount = (e: Event) => {
      setCount((e as CustomEvent).detail as number);
    };
    window.addEventListener("cart:count", onCount);
    return () => window.removeEventListener("cart:count", onCount);
  }, []);

  return (
    <button
      onClick={() => window.dispatchEvent(new Event("cart:toggle"))}
      className="relative w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
      aria-label="Open cart"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-white text-brand-black text-[10px] font-bold rounded-full flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
