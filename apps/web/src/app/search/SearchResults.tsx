import Link from 'next/link';
import { ProductCard } from '@/components/ui/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import styles from './search.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface SearchResultsProps {
  query: string;
  page: number;
}

async function fetchSearchResults(query: string, page: number) {
  if (!query.trim()) return { data: [], total: 0, page, limit: 20, totalPages: 0 };
  const params = new URLSearchParams({
    search: query,
    page: String(page),
    limit: '20',
  });
  const res = await fetch(`${API_URL}/api/catalog/products?${params}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) return { data: [], total: 0, page, limit: 20, totalPages: 0 };
  return res.json();
}

export async function SearchResults({ query, page }: SearchResultsProps) {
  const results = await fetchSearchResults(query, page);

  if (!query.trim()) {
    return (
      <EmptyState
        title="What are you looking for?"
        description="Type in the search bar above to find your perfect pair."
        icon="🔍"
      />
    );
  }

  if (results.data.length === 0) {
    return (
      <EmptyState
        title={`No results for "${query}"`}
        description="Try a different search term or browse our full collection."
        icon="😕"
        action={{ label: 'Browse All Products', href: '/products' }}
      />
    );
  }

  return (
    <>
      <p className={styles.resultCount}>
        {results.total} {results.total === 1 ? 'result' : 'results'} for <strong>"{query}"</strong>
      </p>

      <div className={styles.grid}>
        {results.data.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {results.totalPages > 1 && (
        <div className={styles.pagination}>
          {page > 1 && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
              className="btn btn-secondary"
            >
              ← Previous
            </Link>
          )}
          <span className={styles.pageInfo}>
            Page {page} of {results.totalPages}
          </span>
          {page < results.totalPages && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
              className="btn btn-secondary"
            >
              Next →
            </Link>
          )}
        </div>
      )}
    </>
  );
}
