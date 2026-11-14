import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  variantId: string;
  productId: string;
  title: string;
  slug: string;
  size: number;
  color: string;
  priceCents: number;
  quantity: number;
  imageUrl: string;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  anonymousToken: string | null;
}

const STORAGE_KEY = 'nc_cart';

/**
 * Read the saved cart. Call this from an effect after mount, never from
 * initialState: the store module is evaluated during SSR too, so seeding
 * initial state from storage makes the server HTML and the first client
 * render disagree and React throws a hydration mismatch on every page that
 * shows the cart badge.
 */
export function loadStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function persist(items: readonly CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Quota exceeded, or storage blocked in private mode. The cart still
    // works for this tab; it just will not survive a reload.
  }
}

const initialState: CartState = {
  items: [],
  isOpen: false,
  anonymousToken: null,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find((i) => i.variantId === action.payload.variantId);
      if (existing) {
        existing.quantity += action.payload.quantity;
      } else {
        state.items.push(action.payload);
      }
      persist(state.items);
    },
    updateQuantity(state, action: PayloadAction<{ variantId: string; quantity: number }>) {
      const item = state.items.find((i) => i.variantId === action.payload.variantId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.variantId !== action.payload.variantId);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
      persist(state.items);
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.variantId !== action.payload);
      persist(state.items);
    },
    clearCart(state) {
      state.items = [];
      persist(state.items);
    },

    /** Replaces the cart with what was saved. Does not write back. */
    hydrateCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
    },
    toggleCart(state) {
      state.isOpen = !state.isOpen;
    },
    setCartOpen(state, action: PayloadAction<boolean>) {
      state.isOpen = action.payload;
    },
    setAnonymousToken(state, action: PayloadAction<string>) {
      state.anonymousToken = action.payload;
    },
  },
});

export const {
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  hydrateCart,
  toggleCart,
  setCartOpen,
  setAnonymousToken,
} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;

export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
