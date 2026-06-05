'use client';

import { useState, useMemo } from 'react';
import { useGetProductsQuery, useGetCategoriesQuery } from '@/store/api/catalog.api';
import { ProductCard, ProductCardSkeleton } from '@/components/ui/ProductCard';
import styles from './deals.module.scss';

const DISCOUNT_TIERS = [
  { label: 'All Deals', value: 0 },
  { label: '10%+ Off', value: 10 },
  { label: '20%+ Off', value: 20 },
  { label: '30%+ Off', value: 30 },
  { label: '50%+ Off', value: 50 },
];

const SORT_OPTIONS = [
  { value: 'discount_desc', label: 'Biggest Discount' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
];

function getDiscountPct(base: number, sale: number) {
  if (!sale || sale >= base) return 0;
  return Math.round(((base - sale) / base) * 100);
}

export default function DealsPage() {
  const [page, setPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minDiscount, setMinDiscount] = useState(0);
  const [sort, setSort] = useState('discount_desc');

  const { data: categories } = useGetCategoriesQuery();
  const { data, isLoading, isFetching } = useGetProductsQuery({
    page,
    limit: 24,
    categoryId: selectedCategory || undefined,
  });

  const loading = isLoading || isFetching;
  const products = data?.data ?? [];

  const dealsProducts = useMemo(() => {
    return products.filter((p) => {
      const salePriceCents = (p as any).salePriceCents;
      const pct = getDiscountPct(p.basePriceCents, salePriceCents);
      return pct >= minDiscount;
    });
  }, [products, minDiscount]);

  const sorted = useMemo(() => {
    return [...dealsProducts].sort((a, b) => {
      const aPct = getDiscountPct(a.basePriceCents, (a as any).salePriceCents);
      const bPct = getDiscountPct(b.basePriceCents, (b as any).salePriceCents);
      if (sort === 'discount_desc') return bPct - aPct;
      if (sort === 'price_asc') return a.basePriceCents - b.basePriceCents;
      if (sort === 'price_desc') return b.basePriceCents - a.basePriceCents;
      return 0;
    });
  }, [dealsProducts, sort]);

  const totalSavings = useMemo(() => {
    return sorted.reduce((acc, p) => {
      const sale = (p as any).salePriceCents;
      return acc + (sale ? Math.max(0, p.basePriceCents - sale) : 0);
    }, 0);
  }, [sorted]);

  const handleCategoryChange = (id: string) => {
    setSelectedCategory(id);
    setPage(1);
  };

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroBadge}>Limited Time</span>
          <h1 className={styles.heroTitle}>
            Deals &amp; <span className={styles.heroAccent}>Offers</span>
          </h1>
          <p className={styles.heroSub}>Massive savings on top brands. New deals added daily.</p>
          {!loading && sorted.length > 0 && (
            <div className={styles.heroCounts}>
              <span>{sorted.length} deals found</span>
              <span className={styles.heroDivider}>·</span>
              <span>Up to ${(totalSavings / 100).toFixed(0)} in savings</span>
            </div>
          )}
        </div>
        <div className={styles.heroDecor} aria-hidden="true" />
      </div>

      {/* Discount tier chips */}
      <div className={styles.tierBar}>
        <div className={styles.tierScroll}>
          {DISCOUNT_TIERS.map((tier) => (
            <button
              key={tier.value}
              className={`${styles.tierBtn} ${minDiscount === tier.value ? styles.tierBtnActive : ''}`}
              onClick={() => { setMinDiscount(tier.value); setPage(1); }}
            >
              {tier.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.layout}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>Category</h3>
            <div className={styles.filterBtns}>
              <button
                className={`${styles.filterBtn} ${!selectedCategory ? styles.filterBtnActive : ''}`}
                onClick={() => handleCategoryChange('')}
              >
                All Categories
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.filterBtn} ${selectedCategory === cat.id ? styles.filterBtnActive : ''}`}
                  onClick={() => handleCategoryChange(cat.id)}
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
              {loading ? '…' : `${sorted.length} deals`}
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
              : sorted.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
          </div>

          {!loading && sorted.length === 0 && (
            <div className={styles.empty}>
              <span>🏷️</span>
              <p>No deals match your filters right now.</p>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => { setMinDiscount(0); setSelectedCategory(''); }}
              >
                Clear filters
              </button>
            </div>
          )}

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
