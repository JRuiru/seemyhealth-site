import { useState, useEffect, useCallback } from "react";
import {
  getCart,
  updateLineItem,
  removeLineItem,
  goToCheckout,
  type CartResponse,
} from "../../lib/shopify/cart-client";

type Cart = CartResponse["cart"];
type LineNode = Cart["lines"]["edges"][number]["node"];

function formatMoney(amount: string, currencyCode: string): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
  }).format(parseFloat(amount));
}

export default function CartDrawer() {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    const c = await getCart();
    setCart(c);
  }, []);

  // Listen for cart updates and toggle events
  useEffect(() => {
    const onUpdate = (e: Event) => {
      const detail = (e as CustomEvent).detail as Cart;
      setCart(detail);
      setOpen(true);
    };
    const onToggle = () => setOpen((prev) => !prev);

    window.addEventListener("cart:updated", onUpdate);
    window.addEventListener("cart:toggle", onToggle);
    fetchCart();

    return () => {
      window.removeEventListener("cart:updated", onUpdate);
      window.removeEventListener("cart:toggle", onToggle);
    };
  }, [fetchCart]);

  // Update navbar cart count
  useEffect(() => {
    const count = cart?.totalQuantity || 0;
    window.dispatchEvent(new CustomEvent("cart:count", { detail: count }));
  }, [cart]);

  const handleQuantity = async (line: LineNode, delta: number) => {
    const newQty = line.quantity + delta;
    setLoading(true);
    try {
      if (newQty <= 0) {
        const updated = await removeLineItem(line.id);
        setCart(updated);
      } else {
        const updated = await updateLineItem(line.id, newQty);
        setCart(updated);
      }
    } catch {
      // silently fail
    }
    setLoading(false);
  };

  const handleCheckout = () => {
    if (cart?.checkoutUrl) goToCheckout(cart.checkoutUrl);
  };

  const lines = cart?.lines.edges.map((e) => e.node) || [];
  const subtotal = cart?.cost.subtotalAmount;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[998] transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-md bg-brand-dark border-l border-white/10
          z-[999] transform transition-transform duration-300 ease-out
          flex flex-col
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <h2 className="text-[12px] uppercase tracking-[3px] font-medium">
            Your Cart {cart?.totalQuantity ? `(${cart.totalQuantity})` : ""}
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="w-8 h-8 flex items-center justify-center text-brand-gray-400 hover:text-white transition-colors"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {lines.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg className="w-16 h-16 text-brand-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-brand-gray-500 text-sm">Your cart is empty</p>
              <button
                onClick={() => setOpen(false)}
                className="mt-4 text-[11px] uppercase tracking-[2px] text-white border border-white/20 px-5 py-2.5 rounded-full hover:border-white/40 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {lines.map((line) => (
                <div key={line.id} className="flex gap-4">
                  {/* Thumbnail — prefer variant image, fall back to product featured image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-brand-gray-900 shrink-0">
                    {(line.merchandise.image || line.merchandise.product.featuredImage) ? (
                      <img
                        src={(line.merchandise.image || line.merchandise.product.featuredImage).url}
                        alt={(line.merchandise.image || line.merchandise.product.featuredImage).altText || ""}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-brand-gray-700">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {line.merchandise.product.title}
                    </p>
                    <p className="text-[11px] text-brand-gray-500 mt-0.5">
                      {line.merchandise.selectedOptions
                        .filter((o) => o.name !== "Title")
                        .map((o) => o.value)
                        .join(" / ")}
                    </p>
                    <p className="text-sm text-white mt-1">
                      {formatMoney(line.cost.totalAmount.amount, line.cost.totalAmount.currencyCode)}
                    </p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-2">
                      <button
                        onClick={() => handleQuantity(line, -1)}
                        disabled={loading}
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-white/15 text-brand-gray-400 hover:text-white hover:border-white/30 transition-colors text-sm"
                      >
                        −
                      </button>
                      <span className="text-sm text-white w-5 text-center">{line.quantity}</span>
                      <button
                        onClick={() => handleQuantity(line, 1)}
                        disabled={loading}
                        className="w-7 h-7 flex items-center justify-center rounded-full border border-white/15 text-brand-gray-400 hover:text-white hover:border-white/30 transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleQuantity(line, -line.quantity)}
                    disabled={loading}
                    className="text-brand-gray-600 hover:text-red-400 transition-colors self-start"
                    aria-label="Remove item"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {lines.length > 0 && (
          <div className="px-6 py-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] uppercase tracking-[2px] text-brand-gray-400">Subtotal</span>
              <span className="text-lg font-medium text-white">
                {subtotal ? formatMoney(subtotal.amount, subtotal.currencyCode) : "$0.00"}
              </span>
            </div>
            <p className="text-[10px] text-brand-gray-500 mb-4">
              Shipping & taxes calculated at checkout
            </p>
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-4 bg-white text-brand-black text-[13px] uppercase tracking-[1.5px] font-medium rounded-full hover:bg-brand-gray-200 transition-colors"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
