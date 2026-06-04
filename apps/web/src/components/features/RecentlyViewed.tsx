'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectRecentlyViewed, clearHistory } from '@/store/slices/recentlyViewed.slice';
import styles from './RecentlyViewed.module.scss';

function formatPrice(cents: number) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function RecentlyViewed() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectRecentlyViewed);

  if (items.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>Recently Viewed</h3>
        <button className={styles.clearBtn} onClick={() => dispatch(clearHistory())}>
          Clear history
        </button>
      </div>

      <div className={styles.grid}>
        {items.map((product) => (
          <Link key={product.id} href={`/products/${product.slug}`} className={styles.card}>
            <div className={styles.imageWrap}>
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                  className={styles.image}
                />
              ) : (
                <div className={styles.placeholder}>
                  <span>{product.title[0]}</span>
                </div>
              )}
            </div>
            <div className={styles.info}>
              {product.brand && <p className={styles.brand}>{product.brand}</p>}
              <p className={styles.name}>{product.title}</p>
              <p className={styles.price}>{formatPrice(product.basePriceCents)}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
