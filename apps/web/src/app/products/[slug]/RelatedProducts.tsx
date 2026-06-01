'use client';

import { useGetProductsQuery } from '@/store/api/catalog.api';
import { ProductCard, ProductCardSkeleton } from '@/components/ui/ProductCard';
import styles from './RelatedProducts.module.scss';

interface Props {
  categoryId?: string;
  currentSlug: string;
}

export function RelatedProducts({ categoryId, currentSlug }: Props) {
  const { data, isLoading } = useGetProductsQuery(
    { categoryId, limit: 5 },
    { skip: !categoryId }
  );

  const items = data?.items.filter((p) => p.slug !== currentSlug).slice(0, 4) ?? [];

  if (!isLoading && items.length === 0) return null;

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>You Might Also Like</h2>
      <div className={styles.grid}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : items.map((p) => <ProductCard key={p.id} product={p} />)
        }
      </div>
    </section>
  );
}
