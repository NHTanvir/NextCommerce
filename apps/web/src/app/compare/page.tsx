'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCompareProducts,
  removeFromCompare,
  clearCompare,
} from '@/store/slices/compare.slice';
import { formatPrice } from '@/lib/formatters';
import styles from './compare.module.scss';

const COMPARE_ATTRS: Array<{
  key: string;
  label: string;
  format?: (v: any) => string;
  highlight?: boolean;
}> = [
  { key: 'brand', label: 'Brand' },
  { key: 'categoryName', label: 'Category' },
  { key: 'basePriceCents', label: 'Price', format: (v) => formatPrice(v), highlight: true },
  { key: 'avgRating', label: 'Rating', format: (v) => v ? `${Number(v).toFixed(1)} ★` : '—' },
  { key: 'reviewCount', label: 'Reviews', format: (v) => v ? `${v} reviews` : '—' },
];

function getBestIndex(products: any[], key: string, lowIsBetter = false): number {
  const vals = products.map((p) => Number(p[key]) || 0);
  const best = lowIsBetter ? Math.min(...vals) : Math.max(...vals);
  const idx = vals.indexOf(best);
  return vals.every((v) => v === 0) ? -1 : idx;
}

export default function ComparePage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectCompareProducts);

  const bestPriceIdx = useMemo(() => getBestIndex(products, 'basePriceCents', true), [products]);
  const bestRatingIdx = useMemo(() => getBestIndex(products, 'avgRating', false), [products]);

  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>⚖️</div>
        <h2>Nothing to compare yet</h2>
        <p>Add up to 4 products from the catalogue to compare them side by side.</p>
        <Link href="/products" className="btn btn--primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Compare Products</h1>
          <p className={styles.subtitle}>{products.length} of 4 products selected</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/products" className="btn btn--ghost btn--sm">+ Add more</Link>
          <button className="btn btn--outline btn--sm" onClick={() => dispatch(clearCompare())}>
            Clear all
          </button>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.labelTh}>Feature</th>
              {products.map((product, i) => (
                <th key={product.id} className={styles.productTh}>
                  <div className={styles.productHeader}>
                    <button
                      className={styles.removeBtn}
                      onClick={() => dispatch(removeFromCompare(product.id))}
                      title="Remove"
                    >
                      ✕
                    </button>
                    <div className={styles.productImg}>
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.title} className={styles.image} />
                      ) : (
                        <span className={styles.imagePlaceholder}>👟</span>
                      )}
                    </div>
                    <Link href={`/products/${product.slug}`} className={styles.productName}>
                      {product.title}
                    </Link>
                    <span className={styles.productBrandSmall}>{product.brand}</span>
                  </div>
                </th>
              ))}
              {products.length < 4 && (
                <th className={styles.addTh}>
                  <Link href="/products" className={styles.addCell}>
                    <span className={styles.addPlus}>+</span>
                    <span className={styles.addLabel}>Add product</span>
                  </Link>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {COMPARE_ATTRS.map((attr) => (
              <tr key={attr.key}>
                <td className={styles.labelCell}>{attr.label}</td>
                {products.map((product, i) => {
                  const rawVal = (product as any)[attr.key];
                  const display = attr.format ? attr.format(rawVal) : String(rawVal ?? '—');
                  const isBest =
                    attr.key === 'basePriceCents' ? i === bestPriceIdx :
                    attr.key === 'avgRating' ? i === bestRatingIdx :
                    false;
                  return (
                    <td key={product.id} className={`${styles.valueCell} ${isBest ? styles.bestCell : ''}`}>
                      {display}
                      {isBest && <span className={styles.bestBadge}>Best</span>}
                    </td>
                  );
                })}
                {products.length < 4 && <td className={styles.emptyAddCell} />}
              </tr>
            ))}
            <tr>
              <td className={styles.labelCell}>Action</td>
              {products.map((product) => (
                <td key={product.id} className={styles.valueCell}>
                  <Link href={`/products/${product.slug}`} className="btn btn--primary btn--sm">
                    View Product
                  </Link>
                </td>
              ))}
              {products.length < 4 && <td className={styles.emptyAddCell} />}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
