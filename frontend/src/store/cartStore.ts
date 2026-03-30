import { persistentAtom } from '@nanostores/persistent';

export interface CartItem {
  id: string;
  title: string;
  priceInCents: number;
  imageUrl: string;
  platform: string;
  stock: number;
}

// Persistent Store using LocalStorage
export const cartItems = persistentAtom<CartItem[]>('cart', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Helper to check if a product is in the cart
export const isItemInCart = (id: string) => {
  return cartItems.get().some(item => item.id === id);
};

// Add to Cart with Validation
export const addToCart = (product: CartItem) => {
  const current = cartItems.get();
  
  // Prevent duplicate additions since each item is unique (likely for an ecom/game shop)
  if (current.some(item => item.id === product.id)) return;

  // Validation: Must have stock
  if (product.stock <= 0) {
    console.warn("Cannot add out of stock item to cart");
    return;
  }

  cartItems.set([...current, product]);
};

// Remove from Cart
export const removeFromCart = (productId: string) => {
  const current = cartItems.get();
  cartItems.set(current.filter(item => item.id !== productId));
};

// Clear Cart
export const clearCart = () => {
  cartItems.set([]);
};
