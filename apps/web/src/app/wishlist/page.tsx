'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectWishlistItems, removeFromWishlist, clearWishlist } from '@/store/slices/wishlist.slice';
import { addItem, setCartOpen } from '@/store/slices/cart.slice';
import { formatPrice } from '@/lib/formatters';
import styles from './wishlist.module.scss';

const SORT_OPTIONS = [
  { label: 'Recently Added', value: 'date_desc' },
  { label: 'Oldest First', value: 'date_asc' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Name A–Z', value: 'name_asc' },
];

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlistItems);
  const [sort, setSort] = useState('date_desc');
  const [movedIds, setMovedIds] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => {
    const list = [...items];
    switch (sort) {
      case 'date_asc':  return list.sort((a, b) => a.addedAt.localeCompare(b.addedAt));
      case 'price_asc': return list.sort((a, b) => a.basePriceCents - b.basePriceCents);
      case 'price_desc': return list.sort((a, b) => b.basePriceCents - a.basePriceCents);
      case 'name_asc': return list.sort((a, b) => a.title.localeCompare(b.title));
      default: return list.sort((a, b) => b.addedAt.localeCompare(a.addedAt));
    }
  }, [items, sort]);

  const totalValue = useMemo(
    () => items.reduce((s, i) => s + i.basePriceCents, 0),
    [items],
  );

  const handleMoveToCart = (item: (typeof items)[0]) => {
    dispatch(addItem({
      variantId: item.productId,
      productId: item.productId,
      title: item.title,
      slug: item.slug,
      size: 0,
      color: '',
      priceCents: item.basePriceCents,
      quantity: 1,
      imageUrl: item.imageUrl ?? '',
    }));
    dispatch(removeFromWishlist(item.productId));
    dispatch(setCartOpen(true));
    setMovedIds((prev) => new Set([...prev, item.productId]));
  };

  const handleMoveAllToCart = () => {
    items.forEach((item) => {
      dispatch(addItem({
        variantId: item.productId,
        productId: item.productId,
        title: item.title,
        slug: item.slug,
        size: 0,
        color: '',
        priceCents: item.basePriceCents,
        quantity: 1,
        imageUrl: item.imageUrl ?? '',
      }));
    });
    dispatch(clearWishlist());
    dispatch(setCartOpen(true));
  };

  if (items.length === 0) {
    return (
      <div className={`container ${styles.emptyWrap}`}>
        <div className={styles.emptyIcon}>♡</div>
        <h2 className={styles.emptyTitle}>Your wishlist is empty</h2>
        <p className={styles.emptyDesc}>Save items you love to revisit and buy later.</p>
        <Link href="/products" className="btn btn--primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Wishlist</h1>
          <p className={styles.subtitle}>{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
        </div>
        <div className={styles.headerActions}>
          <select
            className={styles.sortSelect}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button className="btn btn--ghost btn--sm" onClick={handleMoveAllToCart}>
            Move All to Cart
          </button>
          <button className="btn btn--outline btn--sm" onClick={() => dispatch(clearWishlist())}>
            Clear All
          </button>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statItem}>
          <span className={styles.statNum}>{items.length}</span>
          <span className={styles.statLabel}>Items Saved</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum} style={{ color: 'var(--color-accent)' }}>
            {formatPrice(totalValue)}
          </span>
          <span className={styles.statLabel}>Total Value</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNum} style={{ color: '#3fb950' }}>
            {formatPrice(Math.round(totalValue * 0.1))}
          </span>
          <span className={styles.statLabel}>Est. Savings at 10% Off</span>
        </div>
      </div>

      <div className={styles.grid}>
        {sorted.map((item) => (
          <div key={item.productId} className={styles.card}>
            <button
              className={styles.removeBtn}
              onClick={() => dispatch(removeFromWishlist(item.productId))}
              aria-label="Remove from wishlist"
              title="Remove"
            >
              ✕
            </button>

            <Link href={`/products/${item.slug}`} className={styles.imageWrap}>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.title} className={styles.image} />
              ) : (
                <div className={styles.imagePlaceholder}>👟</div>
              )}
            </Link>

            <div className={styles.info}>
              <p className={styles.brand}>{item.brand}</p>
              <Link href={`/products/${item.slug}`} className={styles.name}>
                {item.title}
              </Link>
              <p className={styles.price}>{formatPrice(item.basePriceCents)}</p>
              <p className={styles.addedDate}>
                Added {new Date(item.addedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </p>
            </div>

            <div className={styles.cardActions}>
              <button
                className={`btn btn--primary btn--sm ${styles.moveBtn}`}
                onClick={() => handleMoveToCart(item)}
              >
                🛒 Add to Cart
              </button>
              <Link href={`/products/${item.slug}`} className={`btn btn--ghost btn--sm ${styles.viewBtn}`}>
                View
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
