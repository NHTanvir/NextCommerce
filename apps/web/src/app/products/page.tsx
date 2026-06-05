'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetProductsQuery, useGetCategoriesQuery, useGetBrandsQuery } from '@/store/api/catalog.api';
import { ProductCard, ProductCardSkeleton } from '@/components/ui/ProductCard';
import styles from './products.module.scss';

const SORT_OPTIONS = [
  { value: '', label: 'Sort: Featured' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'newest', label: 'Newest' },
];

const MAX_PRICE_CENTS = 50000;

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, MAX_PRICE_CENTS]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    searchParams.get('category') || ''
  );
  const [selectedBrand, setSelectedBrand] = useState<string>(
    searchParams.get('brand') || ''
  );
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('');

  const { data: categories } = useGetCategoriesQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  const { data, isLoading, isFetching } = useGetProductsQuery({
    page,
    limit: 12,
    categoryId: selectedCategory || undefined,
    brand: selectedBrand || undefined,
    search: search || undefined,
    minPrice: priceRange[0] || undefined,
    maxPrice: priceRange[1] < MAX_PRICE_CENTS ? priceRange[1] : undefined,
  });

  const loading = isLoading || isFetching;

  const products = data?.data ?? [];

  const sortedProducts = useMemo(() => {
    if (!sort) return products;
    return [...products].sort((a, b) => {
      if (sort === 'price_asc') return a.basePriceCents - b.basePriceCents;
      if (sort === 'price_desc') return b.basePriceCents - a.basePriceCents;
      return 0;
    });
  }, [products, sort]);

  const topBrands = brands.slice(0, 10);

  function resetFilters() {
    setSelectedCategory('');
    setSelectedBrand('');
    setPriceRange([0, MAX_PRICE_CENTS]);
    setSearch('');
    setPage(1);
  }

  const hasActiveFilters = selectedCategory || selectedBrand || search || priceRange[0] > 0 || priceRange[1] < MAX_PRICE_CENTS;

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        {hasActiveFilters && (
          <button className={styles.clearFilters} onClick={resetFilters}>
            ✕ Clear all filters
          </button>
        )}

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

        {topBrands.length > 0 && (
          <div className={styles.filterGroup}>
            <h3 className={styles.filterTitle}>Brand</h3>
            <button
              className={`${styles.filterBtn} ${!selectedBrand ? styles.active : ''}`}
              onClick={() => { setSelectedBrand(''); setPage(1); }}
            >
              All Brands
            </button>
            {topBrands.map(({ brand }) => (
              <button
                key={brand}
                className={`${styles.filterBtn} ${selectedBrand === brand ? styles.active : ''}`}
                onClick={() => { setSelectedBrand(brand); setPage(1); }}
              >
                {brand}
              </button>
            ))}
          </div>
        )}

        <div className={styles.filterGroup}>
          <h3 className={styles.filterTitle}>Price Range</h3>
          <div className={styles.priceInputs}>
            <input
              type="number"
              placeholder="Min $"
              className={styles.priceInput}
              value={priceRange[0] / 100 || ''}
              onChange={(e) => { setPriceRange([Number(e.target.value) * 100, priceRange[1]]); setPage(1); }}
            />
            <span>—</span>
            <input
              type="number"
              placeholder="Max $"
              className={styles.priceInput}
              value={priceRange[1] < MAX_PRICE_CENTS ? priceRange[1] / 100 : ''}
              onChange={(e) => { setPriceRange([priceRange[0], Number(e.target.value) * 100 || MAX_PRICE_CENTS]); setPage(1); }}
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
              placeholder="Search products…"
              className={styles.searchInput}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <div className={styles.toolbarRight}>
            {data && (
              <span className={styles.resultCount}>
                {data.total.toLocaleString()} {data.total === 1 ? 'product' : 'products'}
              </span>
            )}
            <select className={styles.sortSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {selectedBrand && (
          <div className={styles.activeBrandBadge}>
            <span>Brand: <strong>{selectedBrand}</strong></span>
            <button onClick={() => { setSelectedBrand(''); setPage(1); }}>✕</button>
          </div>
        )}

        <div className={styles.grid}>
          {loading
            ? Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : sortedProducts.map((p) => <ProductCard key={p.id} product={p} />)
          }
        </div>

        {!loading && sortedProducts.length === 0 && (
          <div className={styles.empty}>
            <p>No products match your filters.</p>
            <button className="btn btn--ghost btn--sm" onClick={resetFilters}>Clear filters</button>
          </div>
        )}

        {data && data.totalPages > 1 && (
          <div className={styles.pagination}>
            <button
              className="btn btn--outline btn--sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            {Array.from({ length: Math.min(data.totalPages, 7) }, (_, i) => {
              const p = data.totalPages <= 7 ? i + 1
                : page <= 4 ? i + 1
                : page >= data.totalPages - 3 ? data.totalPages - 6 + i
                : page - 3 + i;
              return (
                <button
                  key={p}
                  className={`btn btn--sm ${p === page ? 'btn--primary' : 'btn--ghost'}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}
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
