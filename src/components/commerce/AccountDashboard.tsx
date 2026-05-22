import { useState, useEffect } from "react";
import { getCustomer, login, logout, type Customer } from "../../lib/shopify/auth-client";

const CF_IMG = "https://imagedelivery.net/NnC2JvU8j4bgBbmedVhjJg";

const devices = [
  { name: "Ring One", slug: "ring-one", image: `${CF_IMG}/ring-hero-hands/public`, color: "#F97316", tagline: "Health clarity on your finger" },
  { name: "The Scale", slug: "scale", image: `${CF_IMG}/scale-white-bathroom/public`, color: "#3B82F6", tagline: "Beyond weight" },
  { name: "Scale Pro", slug: "scale-pro", image: `${CF_IMG}/scale-pro-black-bathroom/public`, color: "#3B82F6", tagline: "Segment by segment" },
  { name: "BP Monitor", slug: "bp-monitor", image: `${CF_IMG}/bp-white-desk-display/public`, color: "#EF4444", tagline: "Accuracy you trust" },
  { name: "Hydra One", slug: "hydra-one", image: `${CF_IMG}/bottle-white-kitchen/public`, color: "#06B6D4", tagline: "Drink smarter" },
  { name: "Hema One", slug: "hema-one", image: `${CF_IMG}/hema-orange-kitchen-v2/public`, color: "#A855F7", tagline: "No lab visit needed" },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function AccountDashboard() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      setAuthError(error);
      setLoading(false);
      return;
    }

    getCustomer()
      .then((c) => {
        if (!c) {
          const lastAttempt = sessionStorage.getItem("smh_login_attempt");
          const now = Date.now();
          if (lastAttempt && now - parseInt(lastAttempt) < 30000) {
            setAuthError("login_failed");
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
        <svg className="w-12 h-12 mx-auto text-brand-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <h2 className="text-lg font-medium text-white mb-2">Something went wrong</h2>
        <p className="text-sm text-brand-gray-500 mb-6">
          We couldn't sign you in this time. Let's try that again.
        </p>
        <button
          onClick={() => {
            sessionStorage.removeItem("smh_login_attempt");
            login();
          }}
          className="inline-flex items-center px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] font-medium text-brand-black bg-white rounded-full hover:bg-brand-gray-200 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!customer) return null;

  const orders = customer.orders?.edges?.map((e) => e.node) || [];
  const recentOrders = orders.slice(0, 5);
  const initials = `${customer.firstName?.[0] || ""}${customer.lastName?.[0] || ""}`;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome hero */}
      <div className="mb-14">
        <div className="flex items-center gap-5 mb-5">
          <div className="relative">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-xl sm:text-2xl font-medium text-white border border-white/10">
              {initials}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-emerald-500 border-2 border-brand-black" title="Online" />
          </div>
          <div>
            <h1 className="font-display text-3xl sm:text-5xl font-300 uppercase leading-[0.95]">
              {getGreeting()}, <span className="font-500">{customer.firstName}</span>
            </h1>
            <p className="text-brand-gray-500 text-sm mt-1.5">
              {customer.emailAddress?.emailAddress}
            </p>
          </div>
        </div>
        <p className="text-brand-gray-400 text-base max-w-xl">
          This is your space. Track orders, explore new devices, and keep your health journey on course.
        </p>
      </div>

      {/* Info cards row */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
        {/* Profile card */}
        <div className="group rounded-2xl bg-brand-gray-900 border border-white/5 p-6 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-5">
            <svg className="w-5 h-5 text-brand-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <p className="text-[10px] uppercase tracking-[2px] text-brand-gray-500">Your Profile</p>
          </div>
          <p className="text-white font-medium mb-0.5">{customer.firstName} {customer.lastName}</p>
          <p className="text-sm text-brand-gray-500 mb-4">Part of the family</p>
          {customer.defaultAddress ? (
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-[2px] text-brand-gray-600 mb-2">Shipping Address</p>
              <p className="text-sm text-brand-gray-400 leading-relaxed">
                {customer.defaultAddress.address1}<br />
                {customer.defaultAddress.city}, {customer.defaultAddress.province} {customer.defaultAddress.zip}<br />
                {customer.defaultAddress.country}
              </p>
            </div>
          ) : (
            <div className="pt-4 border-t border-white/5">
              <p className="text-sm text-brand-gray-600">No shipping address yet</p>
            </div>
          )}
        </div>

        {/* Orders card */}
        <div className="group rounded-2xl bg-brand-gray-900 border border-white/5 p-6 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-5">
            <svg className="w-5 h-5 text-brand-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <p className="text-[10px] uppercase tracking-[2px] text-brand-gray-500">Your Orders</p>
          </div>
          <p className="text-4xl font-display font-400 text-white mb-1">{orders.length}</p>
          <p className="text-sm text-brand-gray-500">
            {orders.length === 0 ? "Your first order is waiting" : orders.length === 1 ? "order placed" : "orders placed"}
          </p>
          {orders.length > 0 && (
            <a
              href="/account/orders"
              className="inline-flex items-center gap-1.5 mt-5 text-[11px] uppercase tracking-[1.5px] text-brand-gray-400 hover:text-white transition-colors"
            >
              View all
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>

        {/* Quick actions card */}
        <div className="group rounded-2xl bg-brand-gray-900 border border-white/5 p-6 hover:border-white/10 transition-colors sm:col-span-2 lg:col-span-1">
          <div className="flex items-center gap-3 mb-5">
            <svg className="w-5 h-5 text-brand-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            <p className="text-[10px] uppercase tracking-[2px] text-brand-gray-500">Quick Actions</p>
          </div>
          <div className="space-y-3">
            <a
              href="/shop"
              className="flex items-center gap-3 text-sm text-brand-gray-400 hover:text-white transition-colors group/link"
            >
              <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/link:bg-white/10 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </span>
              Explore Devices
            </a>
            <a
              href="/support"
              className="flex items-center gap-3 text-sm text-brand-gray-400 hover:text-white transition-colors group/link"
            >
              <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/link:bg-white/10 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
              </span>
              Need a hand?
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-3 text-sm text-brand-gray-400 hover:text-white transition-colors group/link w-full"
            >
              <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center group-hover/link:bg-white/10 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
              </span>
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-300 uppercase">Your Journey So Far</h2>
            <a
              href="/account/orders"
              className="text-[11px] uppercase tracking-[1.5px] text-brand-gray-500 hover:text-white transition-colors"
            >
              View All
            </a>
          </div>

          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-5 rounded-xl bg-brand-gray-900 border border-white/5 hover:border-white/10 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white">Order #{order.number}</p>
                  <p className="text-[11px] text-brand-gray-500 mt-0.5">
                    {new Date(order.processedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: order.totalPrice.currencyCode,
                    }).format(parseFloat(order.totalPrice.amount))}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{
                    color: order.fulfillments?.edges?.[0]?.node?.status === "SUCCESS" ? "#22c55e" : "#f59e0b"
                  }}>
                    {order.fulfillments?.edges?.[0]?.node?.status === "SUCCESS" ? "Delivered" : "Processing"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* App CTA banner */}
      <div className="mb-14">
        <a
          href="/app"
          className="group relative block rounded-2xl overflow-hidden border border-white/5 hover:border-white/15 transition-colors"
        >
          <div className="relative grid sm:grid-cols-2 items-center">
            {/* Left: lifestyle image */}
            <div className="relative h-48 sm:h-64 overflow-hidden">
              <img
                src={`${CF_IMG}/lifestyle-sun-portrait/public`}
                alt="Living your healthiest life"
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-brand-black sm:block hidden" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black to-transparent sm:hidden" />
            </div>
            {/* Right: app content */}
            <div className="relative p-6 sm:p-8 -mt-8 sm:mt-0">
              <p className="text-[10px] uppercase tracking-[2px] text-brand-gray-500 mb-3">The C-MyHealth App</p>
              <h3 className="font-display text-xl sm:text-2xl font-300 uppercase text-white leading-tight mb-2">
                Get More From<br /><span className="font-500">Every Device</span>
              </h3>
              <p className="text-sm text-brand-gray-400 leading-relaxed mb-4 max-w-sm">
                Track trends, set goals, share reports with your doctor, and discover insights you'd never see on your own. All your health data, one beautiful dashboard.
              </p>
              <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[1.5px] text-white group-hover:gap-3 transition-all">
                Discover the app
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </span>
            </div>
          </div>
        </a>
      </div>

      {/* Ecosystem CTA — always shown */}
      <div className="mb-14">
        <div className="mb-6">
          <h2 className="font-display text-2xl font-300 uppercase">
            {orders.length === 0 ? "Start Your Health Journey" : "Explore More Devices"}
          </h2>
          <p className="text-sm text-brand-gray-500 mt-1">
            {orders.length === 0
              ? "Six devices, one app, nothing hidden. Pick the one that fits your life."
              : "Every device adds a new layer to your health picture."
            }
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {devices.map((device) => (
            <a
              key={device.slug}
              href={`/products/${device.slug}`}
              className="group relative rounded-2xl bg-brand-gray-900 border border-white/5 overflow-hidden hover:border-white/15 transition-all"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={device.image}
                  alt={device.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div
                  className="w-1.5 h-1.5 rounded-full mb-2"
                  style={{ backgroundColor: device.color }}
                />
                <p className="text-sm font-medium text-white">{device.name}</p>
                <p className="text-[11px] text-brand-gray-500 mt-0.5">{device.tagline}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Lifestyle strip */}
      <div className="grid grid-cols-3 gap-3 rounded-2xl overflow-hidden">
        <div className="aspect-[3/2] overflow-hidden">
          <img src={`${CF_IMG}/lifestyle-athlete/public`} alt="Active lifestyle" loading="lazy" className="w-full h-full object-cover" />
        </div>
        <div className="aspect-[3/2] overflow-hidden">
          <img src={`${CF_IMG}/lifestyle-friends-bar/public`} alt="Living well together" loading="lazy" className="w-full h-full object-cover" />
        </div>
        <div className="aspect-[3/2] overflow-hidden">
          <img src={`${CF_IMG}/scale-pro-lifestyle/public`} alt="Health at home" loading="lazy" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
