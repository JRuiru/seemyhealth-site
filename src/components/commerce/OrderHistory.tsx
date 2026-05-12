import { useState, useEffect } from "react";
import { getCustomer, login, type Customer, type CustomerOrder } from "../../lib/shopify/auth-client";

function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    SUCCESS: { label: "Delivered", color: "#22c55e" },
    IN_TRANSIT: { label: "In Transit", color: "#3b82f6" },
    OUT_FOR_DELIVERY: { label: "Out for Delivery", color: "#8b5cf6" },
    ATTEMPTED_DELIVERY: { label: "Attempted", color: "#f59e0b" },
    CONFIRMED: { label: "Confirmed", color: "#06b6d4" },
  };
  const info = map[status] || { label: "Processing", color: "#f59e0b" };

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[1.5px] font-medium"
      style={{ color: info.color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: info.color }} />
      {info.label}
    </span>
  );
}

export default function OrderHistory() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomer()
      .then((c) => {
        if (!c) {
          login();
          return;
        }
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

  if (!customer) return null;

  const orders = customer.orders?.edges?.map((e) => e.node) || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <a
            href="/account"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[2px] text-brand-gray-500 hover:text-white transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Account
          </a>
          <h1 className="font-display text-4xl sm:text-5xl font-300 uppercase leading-[0.95]">
            Order <span className="font-500">History</span>
          </h1>
        </div>
        <p className="text-brand-gray-500 text-sm">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-brand-gray-900 border border-white/5">
          <svg className="w-16 h-16 mx-auto text-brand-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
          <p className="text-sm text-brand-gray-500 mb-6">Your order history will appear here after your first purchase</p>
          <a
            href="/shop"
            className="inline-flex items-center px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] font-medium text-brand-black bg-white rounded-full hover:bg-brand-gray-200 transition-colors"
          >
            Shop Devices
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="rounded-xl bg-brand-gray-900 border border-white/5 overflow-hidden"
            >
              <div className="flex items-center justify-between p-6">
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-white font-medium mb-0.5">Order #{order.number}</p>
                    <p className="text-[11px] text-brand-gray-500">
                      {new Date(order.processedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <OrderStatusBadge status={order.fulfillments?.[0]?.status || ""} />
                  <p className="text-white font-medium">
                    {new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: order.totalPrice.currencyCode,
                    }).format(parseFloat(order.totalPrice.amount))}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
