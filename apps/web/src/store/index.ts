import { configureStore } from '@reduxjs/toolkit';
import { cartReducer } from './slices/cart.slice';
import { authReducer } from './slices/auth.slice';
import wishlistReducer from './slices/wishlist.slice';
import { apiSlice } from './api.slice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    wishlist: wishlistReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
