'use client';

import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectCompareProducts,
  removeFromCompare,
  clearCompare,
} from '@/store/slices/compare.slice';
import { formatPrice } from '@/lib/formatters';
import styles from './compare.module.scss';

const COMPARE_ATTRS = [
  { key: 'brand', label: 'Brand' },
  { key: 'categoryName', label: 'Category' },
  { key: 'basePriceCents', label: 'Price', format: (v: any) => formatPrice(v) },
];

export default function ComparePage() {
  const dispatch = useAppDispatch();
  const products = useAppSelector(selectCompareProducts);

  if (products.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>⚖️</div>
        <h2>Nothing to compare yet</h2>
        <p>Add up to 4 products from the catalogue to compare them side by side.</p>
        <Link href="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Compare Products</h1>
        <button className={styles.clearBtn} onClick={() => dispatch(clearCompare())}>
          Clear all
        </button>
      </div>

      <div className={styles.table}>
        <div className={styles.attrCol}>
          <div className={styles.attrHeader} />
          <div className={styles.attrImageRow} />
          <div className={styles.attrNameRow}>Product</div>
          {COMPARE_ATTRS.map((attr) => (
            <div key={attr.key} className={styles.attrRow}>{attr.label}</div>
          ))}
        </div>

        {products.map((product) => (
          <div key={product.id} className={styles.productCol}>
            <div className={styles.removeRow}>
              <button
                className={styles.removeBtn}
                onClick={() => dispatch(removeFromCompare(product.id))}
                aria-label="Remove"
              >
                ✕
              </button>
            </div>

            <div className={styles.imageRow}>
              <Link href={`/products/${product.slug}`}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.title} className={styles.image} />
                ) : (
                  <div className={styles.imagePlaceholder}>👟</div>
                )}
              </Link>
            </div>

            <div className={styles.nameRow}>
              <Link href={`/products/${product.slug}`} className={styles.productName}>
                {product.title}
              </Link>
            </div>

            {COMPARE_ATTRS.map((attr) => {
              const rawVal = (product as any)[attr.key];
              const display = attr.format ? attr.format(rawVal) : String(rawVal ?? '—');
              return (
                <div key={attr.key} className={styles.valueRow}>{display}</div>
              );
            })}
          </div>
        ))}

        {products.length < 4 && (
          <div className={styles.addCol}>
            <div className={styles.addColInner}>
              <span className={styles.addIcon}>+</span>
              <Link href="/products" className={styles.addLink}>Add product</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
