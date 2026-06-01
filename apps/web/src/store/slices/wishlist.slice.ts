import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

export interface WishlistItem {
  productId: string;
  slug: string;
  title: string;
  brand: string;
  basePriceCents: number;
  imageUrl?: string;
  addedAt: string;
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: [],
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist(state, action: PayloadAction<WishlistItem>) {
      const exists = state.items.find((i) => i.productId === action.payload.productId);
      if (!exists) {
        state.items.push(action.payload);
      }
    },
    removeFromWishlist(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },
    clearWishlist(state) {
      state.items = [];
    },
    toggleWishlist(state, action: PayloadAction<WishlistItem>) {
      const idx = state.items.findIndex((i) => i.productId === action.payload.productId);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(action.payload);
      }
    },
  },
});

export const { addToWishlist, removeFromWishlist, clearWishlist, toggleWishlist } =
  wishlistSlice.actions;

export const selectWishlistItems = (state: RootState) => state.wishlist.items;
export const selectWishlistCount = (state: RootState) => state.wishlist.items.length;
export const selectIsWishlisted = (productId: string) => (state: RootState) =>
  state.wishlist.items.some((i) => i.productId === productId);

export default wishlistSlice.reducer;
