'use client';

import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { setCredentials } from '@/store/slices/auth.slice';
import { setAnonymousToken, hydrateCart, loadStoredCart } from '@/store/slices/cart.slice';
import { nanoid } from '@reduxjs/toolkit';

function AuthHydrator() {
  const hydrated = useRef(false);

  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;

    const token = localStorage.getItem('nc_token');
    const userRaw = localStorage.getItem('nc_user');
    if (token && userRaw) {
      try {
        const user = JSON.parse(userRaw);
        store.dispatch(setCredentials({ token, user }));
      } catch {
        localStorage.removeItem('nc_token');
        localStorage.removeItem('nc_user');
      }
    }

    let anonToken = localStorage.getItem('nc_anon');
    if (!anonToken) {
      anonToken = nanoid();
      localStorage.setItem('nc_anon', anonToken);
    }
    store.dispatch(setAnonymousToken(anonToken));

    // The cart lives in Redux, which is memory only, so without this a
    // reload emptied it.
    const storedCart = loadStoredCart();
    if (storedCart.length > 0) {
      store.dispatch(hydrateCart(storedCart));
    }
  }, []);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthHydrator />
      {children}
    </Provider>
  );
}
