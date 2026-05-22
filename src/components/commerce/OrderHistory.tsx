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
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[1.5px] font-medium"
      style={{ color: info.color, backgroundColor: `${info.color}15` }}
    >
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
        /* Empty state */
        <div className="relative rounded-2xl overflow-hidden border border-white/5">
          <div className="absolute inset-0">
            <img
              src={`${CF_IMG}/lifestyle-athlete/public`}
              alt=""
              className="w-full h-full object-cover opacity-20"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/80 to-brand-black/60" />
          </div>
          <div className="relative text-center py-20 px-6">
            <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-white/5 flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-white mb-2">Your first order is waiting</h3>
            <p className="text-sm text-brand-gray-400 mb-8 max-w-md mx-auto">
              Once you find the device that fits your life, your order details and tracking will show up right here.
            </p>
            <a
              href="/shop"
              className="inline-flex items-center px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] font-medium text-brand-black bg-white rounded-full hover:bg-brand-gray-200 transition-colors"
            >
              Explore Devices
            </a>
          </div>
        </div>
      ) : (
        /* Order list */
        <div className="space-y-4">
          {orders.map((order, i) => {
            const fulfillmentStatus = order.fulfillments?.edges?.[0]?.node?.status || "";

            return (
              <div
                key={order.id}
                className="group rounded-2xl bg-brand-gray-900 border border-white/5 hover:border-white/10 transition-colors overflow-hidden"
              >
                <div className="p-5 sm:p-6">
                  {/* Top row: order number + status */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <p className="text-white font-medium">Order #{order.number}</p>
                        <OrderStatusBadge status={fulfillmentStatus} />
                      </div>
                      <p className="text-[11px] text-brand-gray-500">
                        {formatDate(order.processedAt)}
                      </p>
                    </div>
                    <p className="text-lg font-display font-400 text-white">
                      {formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
                    </p>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center gap-1">
                      {["Confirmed", "In Transit", "Delivered"].map((step, stepIdx) => {
                        const progress = fulfillmentStatus === "SUCCESS" ? 3
                          : fulfillmentStatus === "IN_TRANSIT" || fulfillmentStatus === "OUT_FOR_DELIVERY" ? 2
                          : 1;
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
                  </div>
                </div>
              </div>
            );
          })}
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
