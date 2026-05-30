'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/store/api/catalog.api';
import { ProductCard, ProductCardSkeleton } from '@/components/ui/ProductCard';
import styles from './products.module.scss';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || ''
  );
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('');

  const { data: categories } = useGetCategoriesQuery();
  const { data, isLoading, isFetching } = useGetProductsQuery({
    page,
    limit: 12,
    categoryId: selectedCategory || undefined,
    search: search || undefined,
    minPrice: priceRange[0] || undefined,
    maxPrice: priceRange[1] < 50000 ? priceRange[1] : undefined,
  });

  const loading = isLoading || isFetching;

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.filterGroup}>
          <h3 className={styles.filterTitle}>Categories</h3>
          <button
            className={`${styles.filterBtn} ${!selectedCategory ? styles.active : ''}`}
            onClick={() => { setSelectedCategory(''); setPage(1); }}
          >
            All
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.filterBtn} ${selectedCategory === cat.id ? styles.active : ''}`}
              onClick={() => { setSelectedCategory(cat.id); setPage(1); }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className={styles.filterGroup}>
          <h3 className={styles.filterTitle}>Price Range</h3>
          <div className={styles.priceInputs}>
            <input
              type="number"
              placeholder="Min"
              className={styles.priceInput}
              value={priceRange[0] / 100 || ''}
              onChange={(e) => setPriceRange([Number(e.target.value) * 100, priceRange[1]])}
            />
            <span>—</span>
            <input
              type="number"
              placeholder="Max"
              className={styles.priceInput}
              value={priceRange[1] < 50000 ? priceRange[1] / 100 : ''}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) * 100 || 50000])}
            />
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search products..."
              className={styles.searchInput}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className={styles.toolbarRight}>
            {data && (
              <span className={styles.resultCount}>
                {data.total} {data.total === 1 ? 'product' : 'products'}
              </span>
            )}
            <select className={styles.sortSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="">Sort: Featured</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </div>

        <div className={styles.grid}>
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : data?.items.map((p) => <ProductCard key={p.id} product={p} />)
          }
        </div>

        {data && data.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className="btn btn--outline btn--sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`btn btn--sm ${p === page ? 'btn--primary' : 'btn--ghost'}`}
                onClick={() => setPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="btn btn--outline btn--sm"
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
