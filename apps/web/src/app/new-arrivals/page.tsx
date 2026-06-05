'use client';

import { useState } from 'react';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/store/api/catalog.api';
import { ProductCard, ProductCardSkeleton } from '@/components/ui/ProductCard';
import styles from './new-arrivals.module.scss';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function NewArrivalsPage() {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('newest');

  const { data: categories } = useGetCategoriesQuery();
  const { data, isLoading, isFetching } = useGetProductsQuery({
    page,
    limit: 16,
    categoryId: selectedCategory || undefined,
  });

  const loading = isLoading || isFetching;
  const products = data?.data ?? [];
  const total = data?.total ?? 0;

  const sortedProducts = [...products].sort((a, b) => {
    if (sort === 'price_asc') return a.basePriceCents - b.basePriceCents;
    if (sort === 'price_desc') return b.basePriceCents - a.basePriceCents;
    return 0;
  });

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <span className={styles.heroBadge}>Just Dropped</span>
        <h1 className={styles.heroTitle}>New Arrivals</h1>
        <p className={styles.heroSub}>The latest additions to our collection, fresh from the brands you love.</p>
      </div>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>Category</h3>
            <div className={styles.filterBtns}>
              <button
                className={`${styles.filterBtn} ${!selectedCategory ? styles.filterBtnActive : ''}`}
                onClick={() => { setSelectedCategory(''); setPage(1); }}
              >
                All Categories
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.filterBtn} ${selectedCategory === cat.id ? styles.filterBtnActive : ''}`}
                  onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <div className={styles.main}>
          <div className={styles.toolbar}>
            <p className={styles.count}>
              {loading ? '…' : `${total.toLocaleString()} products`}
            </p>
            <select
              className={styles.sortSelect}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.grid}>
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>

          {!loading && sortedProducts.length === 0 && (
            <div className={styles.empty}>
              <span>📦</span>
              <p>No new arrivals in this category yet.</p>
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Previous
              </button>
              <span className={styles.pageInfo}>Page {page} of {data.totalPages}</span>
              <button
                className={styles.pageBtn}
                disabled={page === data.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
