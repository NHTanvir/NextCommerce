'use client';

import { useEffect } from 'react';
import { apiSlice } from '@/store/api.slice';
import { useAppDispatch } from '@/store/hooks';

const STREAM_URL = '/api/notifications/stream';

/**
 * Subscribes the page to the SSE stream of new notifications and
 * invalidates the RTK Query notifications cache on every event so
 * the list refetches and the new item appears live.
 *
 * Falls back to a noop if the browser has no EventSource (older mobile
 * webviews); the polling-by-RTK-Query path keeps working in that case.
 */
export function useNotificationStream(token: string | null): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!token) return;
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const url = `${apiBase}${STREAM_URL}?token=${encodeURIComponent(token)}`;
    const source = new EventSource(url);

    source.onmessage = () => {
      dispatch(
        apiSlice.util.invalidateTags([
          { type: 'User', id: 'notifications' },
          { type: 'User', id: 'notifications-count' },
        ]),
      );
    };

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, [token, dispatch]);
}
