import { useState, useEffect, useRef } from "react";
import { getCustomer, login, logout, type Customer } from "../../lib/shopify/auth-client";

export default function AccountMenu() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getCustomer()
      .then(setCustomer)
      .finally(() => setLoading(false));
  }, []);

  // Close on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse" />
    );
  }

  // Not logged in — show sign in icon
  if (!customer) {
    return (
      <button
        onClick={login}
        className="p-2 text-brand-gray-400 hover:text-white transition-colors"
        aria-label="Sign in"
        title="Sign in"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
      </button>
    );
  }

  // Logged in — show avatar with dropdown
  const initials = `${customer.firstName?.[0] || ""}${customer.lastName?.[0] || ""}`.toUpperCase() || "U";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-medium text-white hover:bg-white/20 transition-colors"
        aria-label="Account menu"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-brand-gray-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-white/5">
            <p className="text-sm font-medium text-white truncate">
              {customer.firstName} {customer.lastName}
            </p>
            <p className="text-[11px] text-brand-gray-500 truncate">
              {customer.emailAddress?.emailAddress}
            </p>
          </div>

          {/* Links */}
          <div className="py-1">
            <a
              href="/account"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              My Account
            </a>
            <a
              href="/account/orders"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Orders
            </a>
          </div>

          {/* Logout */}
          <div className="border-t border-white/5 py-1">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-brand-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
