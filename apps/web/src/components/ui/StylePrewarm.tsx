'use client';

import { useEffect } from 'react';

/**
 * Pulls the route stylesheets into the browser cache once the page is idle.
 *
 * Next inserts a route's CSS when you navigate to it, and React commits the
 * new markup as soon as it has the payload — so between the commit and the
 * stylesheet landing, the page is live with no route styles on it. The
 * chunks are small and there are only a few dozen; fetching them while the
 * visitor is reading means a click has nothing left to wait for.
 *
 * Deliberately after first paint and at idle, so it never competes with the
 * content, and silent on failure — this is an optimisation, not a feature.
 */
export function StylePrewarm() {
  useEffect(() => {
    let cancelled = false;

    const warm = async () => {
      try {
        const res = await fetch('/css-manifest.json', { priority: 'low' } as RequestInit);
        if (!res.ok || cancelled) return;
        const hrefs: string[] = await res.json();

        const have = new Set(
          [
            ...document.querySelectorAll<HTMLLinkElement>(
              'link[rel="stylesheet"],link[rel="preload"][as="style"]',
            ),
          ].map((l) => new URL(l.href, location.origin).pathname),
        );

        for (const href of hrefs) {
          if (cancelled || have.has(href)) continue;
          const link = document.createElement('link');
          link.rel = 'preload';
          link.as = 'style';
          link.href = href;
          document.head.appendChild(link);
        }
      } catch {
        // cache warming is best-effort
      }
    };

    const idle =
      window.requestIdleCallback ??
      ((cb: IdleRequestCallback) =>
        window.setTimeout(() => cb({ didTimeout: false, timeRemaining: () => 0 }), 1200));
    const handle = idle(() => warm(), { timeout: 4000 });

    return () => {
      cancelled = true;
      window.cancelIdleCallback?.(handle as number);
    };
  }, []);

  return null;
}
