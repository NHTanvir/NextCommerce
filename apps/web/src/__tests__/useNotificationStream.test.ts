import { renderHook } from '@testing-library/react';
import React, { type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from '../store/api.slice';
import { useNotificationStream } from '../hooks/useNotificationStream';

class FakeEventSource {
  static instances: FakeEventSource[] = [];
  onmessage: ((e: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  closed = false;
  url: string;

  constructor(url: string) {
    this.url = url;
    FakeEventSource.instances.push(this);
  }

  close() {
    this.closed = true;
  }
}

function wrapper(store: ReturnType<typeof configureStore>) {
  return ({ children }: { children: ReactNode }) =>
    React.createElement(Provider, { store }, children);
}

describe('useNotificationStream', () => {
  beforeEach(() => {
    FakeEventSource.instances = [];
    (global as any).EventSource = FakeEventSource;
  });

  afterEach(() => {
    delete (global as any).EventSource;
  });

  it('opens an EventSource scoped to the auth token', () => {
    const store = configureStore({
      reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
      middleware: (gdm) => gdm().concat(apiSlice.middleware),
    });

    renderHook(() => useNotificationStream('the-jwt'), { wrapper: wrapper(store) });

    expect(FakeEventSource.instances).toHaveLength(1);
    expect(FakeEventSource.instances[0].url).toContain('/api/notifications/stream');
    expect(FakeEventSource.instances[0].url).toContain('token=the-jwt');
  });

  it('does nothing when token is null', () => {
    const store = configureStore({
      reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
      middleware: (gdm) => gdm().concat(apiSlice.middleware),
    });

    renderHook(() => useNotificationStream(null), { wrapper: wrapper(store) });

    expect(FakeEventSource.instances).toHaveLength(0);
  });

  it('closes the EventSource on unmount', () => {
    const store = configureStore({
      reducer: { [apiSlice.reducerPath]: apiSlice.reducer },
      middleware: (gdm) => gdm().concat(apiSlice.middleware),
    });

    const { unmount } = renderHook(() => useNotificationStream('jwt'), {
      wrapper: wrapper(store),
    });

    const src = FakeEventSource.instances[0];
    unmount();
    expect(src.closed).toBe(true);
  });
});
