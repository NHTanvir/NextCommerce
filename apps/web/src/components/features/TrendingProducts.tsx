'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useGetTrendingProductsQuery } from '@/store/api/catalog.api';
import { formatPrice } from '@/lib/formatters';
import styles from './TrendingProducts.module.scss';

export function TrendingProducts() {
  const { data, isLoading } = useGetTrendingProductsQuery(8);

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.heading}>Trending Now</h2>
          <Link href="/products" className="btn btn--ghost btn--sm">View All</Link>
        </div>

        {isLoading ? (
          <div className={styles.grid}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={styles.skeleton}>
                <div className={styles.skeletonImg} />
                <div className={styles.skeletonInfo}>
                  <div className={styles.skeletonLine} />
                  <div className={styles.skeletonLineSm} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {(data?.products ?? []).map((p, idx) => (
              <Link key={p.id} href={`/products/${p.slug}`} className={styles.card}>
                <div className={styles.rank}>{idx + 1}</div>
                <div className={styles.imgWrap}>
                  {p.imageUrl ? (
                    <Image src={p.imageUrl} alt={p.title} fill className={styles.img} sizes="200px" />
                  ) : (
                    <div className={styles.placeholder}>👟</div>
                  )}
                </div>
                <div className={styles.info}>
                  <p className={styles.brand}>{p.brand}</p>
                  <p className={styles.title}>{p.title}</p>
                  <p className={styles.price}>{formatPrice(p.basePriceCents)}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
