// Frontend Shopify integration — talks to BFF Worker, never directly to Shopify
export {
  addToCart,
  updateLineItem,
  removeLineItem,
  getCart,
  getStoredCartId,
  goToCheckout,
  type CartResponse,
} from "./cart-client";
