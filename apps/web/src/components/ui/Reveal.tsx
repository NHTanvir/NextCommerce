'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import styles from './Reveal.module.scss';

interface RevealProps {
  children: ReactNode;
  /** Stagger within a group, in milliseconds. */
  delay?: number;
  className?: string;
}

/**
 * Fades its children in when they first scroll into view.
 *
 * Nothing is hidden in the markup itself: the hidden class is added on
 * mount, so with JavaScript off — or if the observer never fires — the
 * content is simply there. `prefers-reduced-motion` is handled globally,
 * which collapses the transition to nothing.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const timers: number[] = [];
    const reveal = () => setShown(true);

    if (typeof IntersectionObserver === 'undefined') {
      reveal();
      return;
    }

    setArmed(true);

    // Already on screen at mount (the hero, and anything above the fold):
    // show it straight away rather than waiting on a scroll that may never
    // come.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
      timers.push(window.setTimeout(reveal, 30));
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal();
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
    observer.observe(el);

    // Last resort. An observer that never fires — a browser quirk, a
    // prerender, a tab that was never scrolled — must not be able to leave
    // the page's own content invisible.
    timers.push(window.setTimeout(reveal, 1500));

    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, []);

  const classes = [className, armed ? styles.armed : '', shown ? styles.shown : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      style={{ '--reveal-delay': `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
