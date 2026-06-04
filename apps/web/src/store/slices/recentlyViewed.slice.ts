import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';

const MAX_ITEMS = 12;
const STORAGE_KEY = 'nc_recently_viewed';

export interface RecentProduct {
  id: string;
  slug: string;
  title: string;
  brand: string;
  basePriceCents: number;
  imageUrl?: string;
  categoryName?: string;
  viewedAt: number;
}

function loadFromStorage(): RecentProduct[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RecentProduct[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: RecentProduct[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // quota exceeded — silently ignore
  }
}

interface RecentlyViewedState {
  items: RecentProduct[];
}

const initialState: RecentlyViewedState = {
  items: loadFromStorage(),
};

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState,
  reducers: {
    trackView(state, action: PayloadAction<Omit<RecentProduct, 'viewedAt'>>) {
      const filtered = state.items.filter((i) => i.id !== action.payload.id);
      const updated = [{ ...action.payload, viewedAt: Date.now() }, ...filtered].slice(
        0,
        MAX_ITEMS,
      );
      state.items = updated;
      saveToStorage(updated);
    },
    clearHistory(state) {
      state.items = [];
      saveToStorage([]);
    },
  },
});

export const { trackView, clearHistory } = recentlyViewedSlice.actions;

export const selectRecentlyViewed = (state: RootState) => state.recentlyViewed.items;
export const selectRecentlyViewedCount = (state: RootState) => state.recentlyViewed.items.length;

export default recentlyViewedSlice.reducer;
