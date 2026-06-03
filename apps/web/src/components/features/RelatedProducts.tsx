'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useGetRelatedProductsQuery } from '@/store/api/catalog.api';
import { formatPrice } from '@/lib/formatters';
import styles from './RelatedProducts.module.scss';

interface Props {
  productId: string;
  limit?: number;
}

export function RelatedProducts({ productId, limit = 6 }: Props) {
  const { data, isLoading } = useGetRelatedProductsQuery({ id: productId, limit });

  if (isLoading) {
    return (
      <div className={styles.section}>
        <h2 className={styles.heading}>You May Also Like</h2>
        <div className={styles.grid}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonImg} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonTextSm} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.products.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>You May Also Like</h2>
      <div className={styles.grid}>
        {data.products.map((p) => (
          <Link key={p.id} href={`/products/${p.slug}`} className={styles.card}>
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
    </section>
  );
}
