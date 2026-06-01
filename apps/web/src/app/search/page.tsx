import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SearchResults } from './SearchResults';
import styles from './search.module.scss';

export const metadata: Metadata = {
  title: 'Search — NextCommerce',
  description: 'Search our collection of premium footwear',
};

interface Props {
  searchParams: { q?: string; page?: string };
}

export default function SearchPage({ searchParams }: Props) {
  const query = searchParams.q ?? '';
  const page = Number(searchParams.page ?? '1');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {query ? (
            <>Search results for <span>"{query}"</span></>
          ) : (
            'Search Products'
          )}
        </h1>
      </div>

      <Suspense fallback={<SearchResultsSkeleton />}>
        <SearchResults query={query} page={page} />
      </Suspense>
    </div>
  );
}

function SearchResultsSkeleton() {
  return (
    <div className={styles.skeletonGrid}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonText} />
          <div className={styles.skeletonTextShort} />
        </div>
      ))}
    </div>
  );
}
