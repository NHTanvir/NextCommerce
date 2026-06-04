'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCompareProducts,
  selectCompareCount,
  removeFromCompare,
  clearCompare,
} from '@/store/slices/compare.slice';
import styles from './CompareBar.module.scss';

export function CompareBar() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectCompareProducts);
  const count = useAppSelector(selectCompareCount);

  if (count === 0) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.products}>
          {products.map((p) => (
            <div key={p.id} className={styles.product}>
              <div className={styles.thumb}>
                {p.imageUrl ? (
                  <Image src={p.imageUrl} alt={p.title} fill sizes="48px" className={styles.img} />
                ) : (
                  <span className={styles.initial}>{p.title[0]}</span>
                )}
              </div>
              <span className={styles.name}>{p.title}</span>
              <button
                className={styles.removeBtn}
                onClick={() => dispatch(removeFromCompare(p.id))}
                aria-label={`Remove ${p.title}`}
              >
                ×
              </button>
            </div>
          ))}

          {count < 4 &&
            Array.from({ length: 4 - count }).map((_, i) => (
              <div key={i} className={styles.empty}>
                <span className={styles.emptyIcon}>+</span>
                <span className={styles.emptyLabel}>Add product</span>
              </div>
            ))}
        </div>

        <div className={styles.actions}>
          <button
            className={styles.clearBtn}
            onClick={() => dispatch(clearCompare())}
          >
            Clear
          </button>
          <Link href="/compare" className="btn btn--primary btn--sm">
            Compare {count}
          </Link>
        </div>
      </div>
    </div>
  );
}
