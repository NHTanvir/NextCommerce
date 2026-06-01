'use client';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleWishlist, selectIsWishlisted, WishlistItem } from '@/store/slices/wishlist.slice';
import styles from './WishlistButton.module.scss';

interface Props {
  product: {
    id: string;
    slug: string;
    title: string;
    brand: string;
    basePriceCents: number;
    imageUrl?: string;
  };
  className?: string;
}

export function WishlistButton({ product, className }: Props) {
  const dispatch = useAppDispatch();
  const isWishlisted = useAppSelector(selectIsWishlisted(product.id));

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const item: WishlistItem = {
      productId: product.id,
      slug: product.slug,
      title: product.title,
      brand: product.brand,
      basePriceCents: product.basePriceCents,
      imageUrl: product.imageUrl,
      addedAt: new Date().toISOString(),
    };
    dispatch(toggleWishlist(item));
  };

  return (
    <button
      onClick={handleToggle}
      className={`${styles.btn} ${isWishlisted ? styles.active : ''} ${className ?? ''}`}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
