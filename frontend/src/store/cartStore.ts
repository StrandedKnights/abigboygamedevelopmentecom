import { persistentAtom } from '@nanostores/persistent';
import { action } from 'nanostores';

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
export const addToCart = action(cartItems, 'add', (store, product: CartItem) => {
  const current = store.get();
  
  // Prevent duplicate additions since each item is unique (likely for an ecom/game shop)
  if (current.some(item => item.id === product.id)) return;

  // Validation: Must have stock
  if (product.stock <= 0) {
    console.warn("Cannot add out of stock item to cart");
    return;
  }

  store.set([...current, product]);
});

// Remove from Cart
export const removeFromCart = action(cartItems, 'remove', (store, productId: string) => {
  const current = store.get();
  store.set(current.filter(item => item.id !== productId));
});

// Clear Cart
export const clearCart = action(cartItems, 'clear', (store) => {
  store.set([]);
});
