'use client';

import { useState, useMemo } from 'react';
import { useGetNewArrivalsQuery, useGetCategoriesQuery } from '@/store/api/catalog.api';
import { ProductCard, ProductCardSkeleton } from '@/components/ui/ProductCard';
import styles from './new-arrivals.module.scss';

const DAY_OPTIONS = [
  { value: 7, label: 'Last 7 days' },
  { value: 14, label: 'Last 2 weeks' },
  { value: 30, label: 'Last 30 days' },
  { value: 60, label: 'Last 60 days' },
  { value: 90, label: 'Last 3 months' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function NewArrivalsPage() {
  const [days, setDays] = useState(30);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sort, setSort] = useState('newest');

  const { data: categories } = useGetCategoriesQuery();
  const { data: allProducts = [], isLoading, isFetching } = useGetNewArrivalsQuery(
    { days, limit: 100 },
  );

  const loading = isLoading || isFetching;

  const filtered = useMemo(() => {
    let list = allProducts;
    if (selectedCategory) {
      list = list.filter((p) => p.categoryId === selectedCategory);
    }
    return [...list].sort((a, b) => {
      if (sort === 'price_asc') return a.basePriceCents - b.basePriceCents;
      if (sort === 'price_desc') return b.basePriceCents - a.basePriceCents;
      const aDate = new Date(a.createdAt ?? 0).getTime();
      const bDate = new Date(b.createdAt ?? 0).getTime();
      return bDate - aDate;
    });
  }, [allProducts, selectedCategory, sort]);

  const categoryCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    allProducts.forEach((p) => {
      if (p.categoryId) map[p.categoryId] = (map[p.categoryId] ?? 0) + 1;
    });
    return map;
  }, [allProducts]);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.heroBadge}>Just Dropped</span>
        <h1 className={styles.heroTitle}>New Arrivals</h1>
        <p className={styles.heroSub}>
          The latest additions to our collection, fresh from the brands you love.
        </p>

        <div className={styles.dayFilter}>
          {DAY_OPTIONS.map((o) => (
            <button
              key={o.value}
              className={`${styles.dayBtn} ${days === o.value ? styles.dayBtnActive : ''}`}
              onClick={() => { setDays(o.value); setSelectedCategory(''); }}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.layout}>
        <aside className={styles.sidebar}>
          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>Category</h3>
            <div className={styles.filterBtns}>
              <button
                className={`${styles.filterBtn} ${!selectedCategory ? styles.filterBtnActive : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                All Categories
                <span className={styles.filterCount}>{allProducts.length}</span>
              </button>
              {categories?.filter((cat) => categoryCountMap[cat.id]).map((cat) => (
                <button
                  key={cat.id}
                  className={`${styles.filterBtn} ${selectedCategory === cat.id ? styles.filterBtnActive : ''}`}
                  onClick={() => setSelectedCategory(cat.id)}
                >
                  {cat.name}
                  <span className={styles.filterCount}>{categoryCountMap[cat.id] ?? 0}</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className={styles.main}>
          <div className={styles.toolbar}>
            <p className={styles.count}>
              {loading ? '…' : `${filtered.length} product${filtered.length !== 1 ? 's' : ''} added in the ${DAY_OPTIONS.find((o) => o.value === days)?.label.toLowerCase()}`}
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
              : filtered.map((product) => <ProductCard key={product.id} product={product} />)
            }
          </div>

          {!loading && filtered.length === 0 && (
            <div className={styles.empty}>
              <span>📦</span>
              <p>No new arrivals found. Try expanding the date range.</p>
              <button className="btn btn--ghost btn--sm" onClick={() => { setDays(90); setSelectedCategory(''); }}>
                View last 3 months
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
