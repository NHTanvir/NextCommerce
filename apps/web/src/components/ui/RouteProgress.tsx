'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef, useState } from 'react';
import styles from './RouteProgress.module.scss';

/**
 * A thin bar across the top while the router moves between routes.
 *
 * App Router transitions keep the document, so the browser shows nothing
 * at all while the next route's payload is in flight — which reads as a
 * frozen page. This gives that wait a visible shape without pretending to
 * know the progress: it eases towards 90% and completes on arrival.
 */
function Bar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const first = useRef(true);

  // Start on any click that will change the route.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const link = (e.target as HTMLElement)?.closest?.('a');
      if (!link) return;
      const href = link.getAttribute('href');
      if (!href || link.target === '_blank' || href.startsWith('http') || href.startsWith('#'))
        return;
      if (href === window.location.pathname + window.location.search) return;
      setVisible(true);
      setProgress(8);
    }
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  // Creep forward while it is showing.
  useEffect(() => {
    if (!visible) return;
    const id = window.setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.max(1, (90 - p) * 0.12)));
    }, 120);
    return () => window.clearInterval(id);
  }, [visible]);

  // The new route rendering is the completion signal.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setProgress(100);
    const id = window.setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 320);
    return () => window.clearTimeout(id);
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div className={styles.track} role="presentation">
      <div
        className={`${styles.bar} ${progress === 100 ? styles.done : ''}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function RouteProgress() {
  // useSearchParams needs a Suspense boundary to keep the rest of the tree
  // statically renderable.
  return (
    <Suspense fallback={null}>
      <Bar />
    </Suspense>
  );
}
