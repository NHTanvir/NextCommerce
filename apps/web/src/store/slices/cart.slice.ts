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

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  anonymousToken: string | null;
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
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.variantId !== action.payload);
    },
    clearCart(state) {
      state.items = [];
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
  addItem, updateQuantity, removeItem,
  clearCart, toggleCart, setCartOpen, setAnonymousToken,
} = cartSlice.actions;
export const cartReducer = cartSlice.reducer;

export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
