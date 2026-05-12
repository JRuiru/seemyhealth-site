import { useState, useEffect } from "react";
import { getCustomer, login, logout, type Customer } from "../../lib/shopify/auth-client";

export default function AccountDashboard() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomer()
      .then((c) => {
        if (!c) {
          // Not logged in — redirect to login
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

  if (!customer) return null; // Redirecting to login

  const orders = customer.orders?.edges?.map((e) => e.node) || [];
  const recentOrders = orders.slice(0, 5);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome header */}
      <div className="mb-12">
        <h1 className="font-display text-4xl sm:text-5xl font-300 uppercase leading-[0.95] mb-3">
          Welcome back, <span className="font-500">{customer.firstName}</span>
        </h1>
        <p className="text-brand-gray-400">
          {customer.emailAddress?.emailAddress}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* Profile card */}
        <div className="rounded-2xl bg-brand-gray-900 border border-white/5 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-lg font-medium text-white">
              {customer.firstName?.[0]}{customer.lastName?.[0]}
            </div>
            <div>
              <p className="text-white font-medium">{customer.firstName} {customer.lastName}</p>
              <p className="text-[11px] text-brand-gray-500 uppercase tracking-wider">Member</p>
            </div>
          </div>
          {customer.defaultAddress && (
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] uppercase tracking-[2px] text-brand-gray-600 mb-2">Shipping Address</p>
              <p className="text-sm text-brand-gray-400">
                {customer.defaultAddress.address1}<br />
                {customer.defaultAddress.city}, {customer.defaultAddress.province} {customer.defaultAddress.zip}<br />
                {customer.defaultAddress.country}
              </p>
            </div>
          )}
        </div>

        {/* Orders summary card */}
        <div className="rounded-2xl bg-brand-gray-900 border border-white/5 p-6">
          <p className="text-[10px] uppercase tracking-[2px] text-brand-gray-600 mb-2">Orders</p>
          <p className="text-3xl font-display font-400 text-white mb-1">{orders.length}</p>
          <p className="text-sm text-brand-gray-500">Total orders placed</p>
          {orders.length > 0 && (
            <a
              href="/account/orders"
              className="inline-flex items-center gap-1 mt-4 text-[11px] uppercase tracking-[1.5px] text-brand-gray-400 hover:text-white transition-colors"
            >
              View all
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>

        {/* Quick actions card */}
        <div className="rounded-2xl bg-brand-gray-900 border border-white/5 p-6">
          <p className="text-[10px] uppercase tracking-[2px] text-brand-gray-600 mb-4">Quick Actions</p>
          <div className="space-y-3">
            <a
              href="/shop"
              className="flex items-center gap-3 text-sm text-brand-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Shop Devices
            </a>
            <a
              href="/support"
              className="flex items-center gap-3 text-sm text-brand-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
              </svg>
              Get Support
            </a>
            <button
              onClick={logout}
              className="flex items-center gap-3 text-sm text-brand-gray-400 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      {recentOrders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-300 uppercase">Recent Orders</h2>
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
                className="flex items-center justify-between p-5 rounded-xl bg-brand-gray-900 border border-white/5"
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
                    color: order.fulfillments?.[0]?.status === "SUCCESS" ? "#22c55e" : "#f59e0b"
                  }}>
                    {order.fulfillments?.[0]?.status === "SUCCESS" ? "Delivered" : "Processing"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="text-center py-16 rounded-2xl bg-brand-gray-900 border border-white/5">
          <svg className="w-16 h-16 mx-auto text-brand-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
          <h3 className="text-lg font-medium text-white mb-2">No orders yet</h3>
          <p className="text-sm text-brand-gray-500 mb-6">Start building your health ecosystem</p>
          <a
            href="/shop"
            className="inline-flex items-center px-8 py-3.5 text-[12px] uppercase tracking-[1.5px] font-medium text-brand-black bg-white rounded-full hover:bg-brand-gray-200 transition-colors"
          >
            Shop Devices
          </a>
        </div>
      )}
    </div>
  );
}
