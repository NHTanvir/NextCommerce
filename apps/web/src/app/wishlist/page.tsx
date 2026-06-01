'use client';

import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectWishlistItems, removeFromWishlist, clearWishlist } from '@/store/slices/wishlist.slice';
import { formatPrice } from '@/lib/formatters';
import styles from './wishlist.module.scss';

export default function WishlistPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectWishlistItems);

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>♡</div>
        <h2>Your wishlist is empty</h2>
        <p>Save items you love to revisit them later.</p>
        <Link href="/products" className="btn btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Wishlist <span>({items.length})</span></h1>
        <button className={styles.clearBtn} onClick={() => dispatch(clearWishlist())}>
          Clear all
        </button>
      </div>

      <div className={styles.grid}>
        {items.map((item) => (
          <div key={item.productId} className={styles.card}>
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
            </div>

            <div className={styles.actions}>
              <Link href={`/products/${item.slug}`} className="btn btn-primary btn-sm">
                View Product
              </Link>
              <button
                className={styles.removeBtn}
                onClick={() => dispatch(removeFromWishlist(item.productId))}
                aria-label="Remove from wishlist"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
