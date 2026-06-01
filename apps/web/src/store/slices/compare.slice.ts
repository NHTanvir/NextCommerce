import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

const MAX_COMPARE = 4;

export interface CompareProduct {
  id: string;
  slug: string;
  title: string;
  brand: string;
  basePriceCents: number;
  imageUrl?: string;
  categoryName?: string;
}

interface CompareState {
  products: CompareProduct[];
  isDrawerOpen: boolean;
}

const initialState: CompareState = {
  products: [],
  isDrawerOpen: false,
};

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare(state, action: PayloadAction<CompareProduct>) {
      if (state.products.length >= MAX_COMPARE) return;
      const exists = state.products.find((p) => p.id === action.payload.id);
      if (!exists) {
        state.products.push(action.payload);
        state.isDrawerOpen = true;
      }
    },
    removeFromCompare(state, action: PayloadAction<string>) {
      state.products = state.products.filter((p) => p.id !== action.payload);
      if (state.products.length === 0) state.isDrawerOpen = false;
    },
    clearCompare(state) {
      state.products = [];
      state.isDrawerOpen = false;
    },
    toggleCompareDrawer(state) {
      state.isDrawerOpen = !state.isDrawerOpen;
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare, toggleCompareDrawer } =
  compareSlice.actions;

export const selectCompareProducts = (state: RootState) => state.compare.products;
export const selectCompareCount = (state: RootState) => state.compare.products.length;
export const selectIsComparing = (id: string) => (state: RootState) =>
  state.compare.products.some((p) => p.id === id);
export const selectCompareDrawerOpen = (state: RootState) => state.compare.isDrawerOpen;

export default compareSlice.reducer;
