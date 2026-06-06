'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectRecentlyViewed, clearHistory } from '@/store/slices/recentlyViewed.slice';
import { formatPrice } from '@/lib/formatters';
import styles from './recently-viewed.module.scss';

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  if (m > 0) return `${m}m ago`;
  return 'Just now';
}

export default function RecentlyViewedPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectRecentlyViewed);

  const grouped = useMemo(() => {
    const now = Date.now();
    const today: typeof items = [];
    const yesterday: typeof items = [];
    const older: typeof items = [];

    for (const item of items) {
      const age = now - item.viewedAt;
      if (age < 86400000) today.push(item);
      else if (age < 172800000) yesterday.push(item);
      else older.push(item);
    }
    return { today, yesterday, older };
  }, [items]);

  if (items.length === 0) {
    return (
      <div className={`container ${styles.emptyWrap}`}>
        <div className={styles.emptyIcon}>👁️</div>
        <h2 className={styles.emptyTitle}>No recently viewed products</h2>
        <p className={styles.emptyDesc}>Products you browse will appear here so you can find them again easily.</p>
        <Link href="/products" className="btn btn--primary">Start Browsing</Link>
      </div>
    );
  }

  function renderGroup(label: string, group: typeof items) {
    if (group.length === 0) return null;
    return (
      <div className={styles.group} key={label}>
        <h2 className={styles.groupLabel}>{label}</h2>
        <div className={styles.grid}>
          {group.map((item) => (
            <Link key={item.id} href={`/products/${item.slug}`} className={styles.card}>
              <div className={styles.imageWrap}>
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.title} className={styles.image} />
                ) : (
                  <span className={styles.imagePlaceholder}>👟</span>
                )}
              </div>
              <div className={styles.info}>
                {item.brand && <p className={styles.brand}>{item.brand}</p>}
                <p className={styles.title}>{item.title}</p>
                {item.categoryName && <p className={styles.category}>{item.categoryName}</p>}
                <div className={styles.bottom}>
                  <span className={styles.price}>{formatPrice(item.basePriceCents)}</span>
                  <span className={styles.time}>{timeAgo(item.viewedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Recently Viewed</h1>
          <p className={styles.subtitle}>{items.length} product{items.length !== 1 ? 's' : ''} in your history</p>
        </div>
        <button
          className="btn btn--outline btn--sm"
          onClick={() => dispatch(clearHistory())}
        >
          Clear History
        </button>
      </div>

      {renderGroup('Today', grouped.today)}
      {renderGroup('Yesterday', grouped.yesterday)}
      {renderGroup('Older', grouped.older)}
    </div>
  );
}
