import { useState, useEffect } from "react";
import { getCustomer, login, type Customer, type CustomerOrder } from "../../lib/shopify/auth-client";

const CF_IMG = "https://imagedelivery.net/NnC2JvU8j4bgBbmedVhjJg";

const statusMap: Record<string, { label: string; color: string; icon: string }> = {
  SUCCESS: { label: "Delivered", color: "#22c55e", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
  IN_TRANSIT: { label: "In Transit", color: "#3b82f6", icon: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" },
  OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "#8b5cf6", icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" },
  ATTEMPTED_DELIVERY: { label: "Attempted", color: "#f59e0b", icon: "M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" },
  CONFIRMED: { label: "Confirmed", color: "#06b6d4", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
};

function OrderStatusBadge({ status }: { status: string }) {
  const info = statusMap[status] || { label: "Processing", color: "#f59e0b", icon: "M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase tracking-[1.5px] font-medium"
      style={{ color: info.color, backgroundColor: `${info.color}15` }}
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={info.icon} />
      </svg>
      {info.label}
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatPrice(amount: string, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(parseFloat(amount));
}

function OrderCard({ order }: { order: CustomerOrder }) {
  const [expanded, setExpanded] = useState(false);
  const fulfillment = order.fulfillments?.edges?.[0]?.node;
  const fulfillmentStatus = fulfillment?.status || "";
  const tracking = fulfillment?.trackingInformation?.[0];
  const lineItems = order.lineItems?.edges?.map((e) => e.node) || [];

  const progress = fulfillmentStatus === "SUCCESS" ? 3
    : fulfillmentStatus === "IN_TRANSIT" || fulfillmentStatus === "OUT_FOR_DELIVERY" ? 2
    : 1;

  return (
    <div className="group rounded-2xl bg-brand-gray-900 border border-white/5 hover:border-white/10 transition-colors overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left p-5 sm:p-6"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <p className="text-white font-medium">Order #{order.number}</p>
              <OrderStatusBadge status={fulfillmentStatus} />
            </div>
            <p className="text-[11px] text-brand-gray-500">{formatDate(order.processedAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <p className="text-lg font-display font-400 text-white">
              {formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
            </p>
            <svg
              className={`w-4 h-4 text-brand-gray-500 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {/* Item thumbnails preview — collapsed */}
        {!expanded && lineItems.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {lineItems.slice(0, 4).map((item, i) => (
              <div key={i} className="w-10 h-10 rounded-lg bg-white/5 overflow-hidden flex-shrink-0">
                {item.image ? (
                  <img src={item.image.url} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            {lineItems.length > 4 && (
              <span className="text-[11px] text-brand-gray-500">+{lineItems.length - 4} more</span>
            )}
            <span className="text-[11px] text-brand-gray-600 ml-auto">
              {lineItems.length} item{lineItems.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-white/5">
          {/* Line items */}
          <div className="p-5 sm:p-6 space-y-4">
            {lineItems.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white/5 overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image.url} alt={item.image.altText || item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-gray-600">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{item.title}</p>
                  {item.variantTitle && (
                    <p className="text-[11px] text-brand-gray-500 mt-0.5">{item.variantTitle}</p>
                  )}
                  <p className="text-[11px] text-brand-gray-600 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm text-brand-gray-400 flex-shrink-0">
                  {formatPrice(item.price.amount, item.price.currencyCode)}
                </p>
              </div>
            ))}
          </div>

          {/* Progress + tracking */}
          <div className="px-5 sm:px-6 pb-5 sm:pb-6">
            {/* Progress bar */}
            <div className="flex items-center gap-1 mb-4">
              {["Confirmed", "In Transit", "Delivered"].map((step, stepIdx) => {
                const active = stepIdx < progress;
                return (
                  <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
                    <div
                      className="w-full h-1 rounded-full transition-colors"
                      style={{ backgroundColor: active ? "#22c55e" : "rgba(255,255,255,0.05)" }}
                    />
                    <span className={`text-[9px] uppercase tracking-[1px] ${active ? "text-brand-gray-400" : "text-brand-gray-700"}`}>
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Tracking link */}
            {tracking?.url && (
              <a
                href={tracking.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[1.5px] text-brand-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Track package {tracking.number ? `(${tracking.number})` : ""}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function OrderHistory() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    getCustomer()
      .then((c) => {
        if (!c) {
          const lastAttempt = sessionStorage.getItem("smh_login_attempt");
          const now = Date.now();
          if (lastAttempt && now - parseInt(lastAttempt) < 30000) {
            setAuthError(true);
            setLoading(false);
            return;
          }
          sessionStorage.setItem("smh_login_attempt", now.toString());
          login();
          return;
        }
        sessionStorage.removeItem("smh_login_attempt");
        setCustomer(c);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="text-center py-16 rounded-2xl bg-brand-gray-900 border border-white/5 max-w-lg mx-auto">
        <h2 className="text-lg font-medium text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-brand-gray-500 mb-6">We couldn't load your orders. Let's try again.</p>
        <button
          onClick={() => { sessionStorage.removeItem("smh_login_attempt"); login(); }}
          className="inline-flex items-center px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] font-medium text-brand-black bg-white rounded-full hover:bg-brand-gray-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!customer) return null;

  const orders = customer.orders?.edges?.map((e) => e.node) || [];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <a
          href="/account"
          className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[2px] text-brand-gray-500 hover:text-white transition-colors mb-5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Account
        </a>
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-display text-3xl sm:text-5xl font-300 uppercase leading-[0.95]">
              Your <span className="font-500">Orders</span>
            </h1>
            <p className="text-brand-gray-500 text-sm mt-2">
              {orders.length === 0
                ? "Your journey starts with the first step."
                : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`
              }
            </p>
          </div>
          {orders.length > 0 && (
            <a
              href="/support"
              className="hidden sm:inline-flex items-center gap-2 text-[11px] uppercase tracking-[1.5px] text-brand-gray-500 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              Need help with an order?
            </a>
          )}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="space-y-10">
          {/* Hero banner */}
          <div className="relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0">
              <img
                src={`${CF_IMG}/lifestyle-athlete/public`}
                alt=""
                className="w-full h-full object-cover"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/80 to-brand-black/30" />
            </div>
            <div className="relative py-16 sm:py-24 px-6 sm:px-10 max-w-lg">
              <p className="text-[10px] uppercase tracking-[3px] text-brand-gray-400 mb-4">Your Health Journey</p>
              <h2 className="font-display text-3xl sm:text-4xl font-300 uppercase leading-[0.95] text-white mb-3">
                It Starts With<br /><span className="font-500">One Device</span>
              </h2>
              <p className="text-brand-gray-300 text-sm leading-relaxed mb-6">
                Pick the one that fits your life. Every device connects to one app, building a picture of your health that gets clearer over time.
              </p>
              <a
                href="/shop"
                className="inline-flex items-center px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] font-medium text-brand-black bg-white rounded-full hover:bg-brand-gray-200 transition-colors"
              >
                Explore the Ecosystem
              </a>
            </div>
          </div>

          {/* Featured devices */}
          <div>
            <p className="text-[10px] uppercase tracking-[3px] text-brand-gray-500 mb-5">Most Popular</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { name: "Ring One", slug: "ring-one", image: `${CF_IMG}/ring-hero-hands/public`, price: "$179", tagline: "24/7 health clarity on your finger", color: "#F97316" },
                { name: "The Scale", slug: "scale", image: `${CF_IMG}/scale-white-bathroom/public`, price: "$99", tagline: "13+ body metrics in 10 seconds", color: "#3B82F6" },
                { name: "BP Monitor", slug: "bp-monitor", image: `${CF_IMG}/bp-white-desk-display/public`, price: "$89", tagline: "Trusted readings, every time", color: "#EF4444" },
              ].map((device) => (
                <a
                  key={device.slug}
                  href={`/products/${device.slug}`}
                  className="group rounded-2xl bg-brand-gray-900 border border-white/5 hover:border-white/15 overflow-hidden transition-all"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={device.image}
                      alt={device.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: device.color }} />
                      <p className="text-sm font-medium text-white">{device.name}</p>
                    </div>
                    <p className="text-[11px] text-brand-gray-500 mb-3">{device.tagline}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white font-medium">{device.price}</p>
                      <span className="text-[10px] uppercase tracking-[1.5px] text-brand-gray-500 group-hover:text-white transition-colors flex items-center gap-1">
                        View
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* More devices row */}
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1">
            {[
              { name: "Scale Pro", slug: "scale-pro", image: `${CF_IMG}/scale-pro-black-bathroom/public`, price: "$179", color: "#3B82F6" },
              { name: "Hydra One", slug: "hydra-one", image: `${CF_IMG}/bottle-white-kitchen/public`, price: "$79", color: "#06B6D4" },
              { name: "Hema One", slug: "hema-one", image: `${CF_IMG}/hema-orange-kitchen-v2/public`, price: "$159", color: "#A855F7" },
            ].map((device) => (
              <a
                key={device.slug}
                href={`/products/${device.slug}`}
                className="group flex items-center gap-3 flex-shrink-0 rounded-xl bg-brand-gray-900 border border-white/5 hover:border-white/15 p-3 pr-5 transition-colors"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img src={device.image} alt={device.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1 h-1 rounded-full" style={{ backgroundColor: device.color }} />
                    <p className="text-sm text-white">{device.name}</p>
                  </div>
                  <p className="text-[11px] text-brand-gray-500">{device.price}</p>
                </div>
              </a>
            ))}
          </div>

          {/* Testimonial */}
          <div className="rounded-2xl bg-brand-gray-900 border border-white/5 p-6 sm:p-8">
            <svg className="w-8 h-8 text-brand-gray-700 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
            </svg>
            <p className="text-brand-gray-300 leading-relaxed mb-5">
              "The sleep insights alone have changed how I plan my mornings. Watching the data come together across the Ring, the Scale, and the app... it just clicked."
            </p>
            <div>
              <p className="text-sm text-white font-medium">Sarah M.</p>
              <p className="text-[11px] text-brand-gray-500">Early Tester</p>
            </div>
          </div>

          {/* Final CTA */}
          <div className="text-center py-6">
            <p className="text-brand-gray-500 text-sm mb-4">Six devices. One app. Nothing hidden.</p>
            <a
              href="/shop"
              className="inline-flex items-center gap-2 px-10 py-4 text-[12px] uppercase tracking-[1.5px] font-medium text-brand-black bg-white rounded-full hover:bg-brand-gray-200 transition-colors"
            >
              Shop All Devices
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </a>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}

      {/* Post-purchase CTAs */}
      {orders.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4 mt-10">
          {/* Gift / spread the love */}
          <a
            href="/shop"
            className="group relative rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-colors"
          >
            <div className="absolute inset-0">
              <img
                src={`${CF_IMG}/lifestyle-friends-bar/public`}
                alt=""
                className="w-full h-full object-cover opacity-25 group-hover:opacity-30 transition-opacity"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/70 to-brand-black/50" />
            </div>
            <div className="relative p-6 sm:p-8">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-brand-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-1">Spread the Love</h3>
              <p className="text-sm text-brand-gray-400 leading-relaxed mb-4">
                Know someone who'd love this? Gift a device to a friend or family member.
              </p>
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[1.5px] text-white group-hover:gap-3 transition-all">
                Shop for someone special
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </span>
            </div>
          </a>

          {/* Expand ecosystem */}
          <a
            href="/shop"
            className="group relative rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-colors"
          >
            <div className="absolute inset-0">
              <img
                src={`${CF_IMG}/ring-one-sunset-meditation/public`}
                alt=""
                className="w-full h-full object-cover opacity-25 group-hover:opacity-30 transition-opacity"
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/70 to-brand-black/50" />
            </div>
            <div className="relative p-6 sm:p-8">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-brand-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-1">Grow Your Ecosystem</h3>
              <p className="text-sm text-brand-gray-400 leading-relaxed mb-4">
                Every new device adds another layer to your health picture. What's next for you?
              </p>
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[1.5px] text-white group-hover:gap-3 transition-all">
                Explore devices
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </span>
            </div>
          </a>
        </div>
      )}

      {/* Help link on mobile */}
      {orders.length > 0 && (
        <div className="mt-8 text-center sm:hidden">
          <a
            href="/support"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[1.5px] text-brand-gray-500 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
            </svg>
            Need help with an order?
          </a>
        </div>
      )}
    </div>
  );
}
