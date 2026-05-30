'use client';

import Link from 'next/link';
import Image from 'next/image';
import type { ProductDto } from '@nextcommerce/shared';
import styles from './ProductCard.module.scss';

interface Props {
  product: ProductDto;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function getMinPrice(product: ProductDto) {
  if (!product.variants?.length) return 0;
  return Math.min(...product.variants.map((v) => v.priceCents));
}

export function ProductCard({ product }: Props) {
  const price = getMinPrice(product);
  const imageUrl = product.images?.[0]?.url;

  return (
    <Link href={`/products/${product.slug}`} className={styles.card}>
      <div className={styles.imageWrap}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 25vw"
            className={styles.image}
          />
        ) : (
          <div className={styles.imagePlaceholder}>👟</div>
        )}
        {product.variants?.some((v) => v.stockQty === 0) && (
          <span className={`badge badge--warning ${styles.badge}`}>Low Stock</span>
        )}
      </div>

      <div className={styles.body}>
        {product.brand && <span className={styles.brand}>{product.brand}</span>}
        <h3 className={styles.title}>{product.title}</h3>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(price)}</span>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonImg} />
      <div className={styles.skeletonBody}>
        <div className={styles.skeletonLine} style={{ width: '40%' }} />
        <div className={styles.skeletonLine} style={{ width: '80%' }} />
        <div className={styles.skeletonLine} style={{ width: '30%' }} />
      </div>
    </div>
  );
}
