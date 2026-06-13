import { Provider } from 'react-redux';
import { configureStore, type PreloadedState } from '@reduxjs/toolkit';
import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { cartReducer } from '@/store/slices/cart.slice';
import { authReducer } from '@/store/slices/auth.slice';
import wishlistReducer from '@/store/slices/wishlist.slice';
import compareReducer from '@/store/slices/compare.slice';
import recentlyViewedReducer from '@/store/slices/recentlyViewed.slice';
import { apiSlice } from '@/store/api.slice';
import type { RootState } from '@/store/index';

function makeStore(preloadedState?: PreloadedState<RootState>) {
  return configureStore({
    reducer: {
      cart: cartReducer,
      auth: authReducer,
      wishlist: wishlistReducer,
      compare: compareReducer,
      recentlyViewed: recentlyViewedReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
    preloadedState,
  });
}

export function renderWithStore(
  ui: ReactElement,
  preloadedState?: PreloadedState<RootState>,
): RenderResult & { store: ReturnType<typeof makeStore> } {
  const store = makeStore(preloadedState);
  const utils = render(<Provider store={store}>{ui}</Provider>);
  return { store, ...utils };
}
