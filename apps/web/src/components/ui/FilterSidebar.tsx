'use client';

import styles from './FilterSidebar.module.scss';

export interface FilterState {
  category: string;
  brand: string;
  minPrice: number | null;
  maxPrice: number | null;
  sizes: string[];
}

interface FilterSidebarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  categories?: string[];
  brands?: string[];
  sizes?: string[];
}

const DEFAULT_SIZES = ['US 6', 'US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12', 'US 13'];

export function FilterSidebar({
  filters,
  onChange,
  categories = [],
  brands = [],
  sizes = DEFAULT_SIZES,
}: FilterSidebarProps) {
  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleSize = (size: string) => {
    const next = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    update('sizes', next);
  };

  const handleReset = () => {
    onChange({ category: '', brand: '', minPrice: null, maxPrice: null, sizes: [] });
  };

  const hasActive =
    filters.category || filters.brand || filters.minPrice || filters.maxPrice || filters.sizes.length > 0;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Filters</span>
        {hasActive && (
          <button className={styles.resetBtn} onClick={handleReset}>
            Clear all
          </button>
        )}
      </div>

      {categories.length > 0 && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Category</h4>
          <div className={styles.radioGroup}>
            <label className={styles.radio}>
              <input
                type="radio"
                name="category"
                value=""
                checked={!filters.category}
                onChange={() => update('category', '')}
              />
              All
            </label>
            {categories.map((cat) => (
              <label key={cat} className={styles.radio}>
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={filters.category === cat}
                  onChange={() => update('category', cat)}
                />
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </label>
            ))}
          </div>
        </section>
      )}

      {brands.length > 0 && (
        <section className={styles.section}>
          <h4 className={styles.sectionTitle}>Brand</h4>
          <div className={styles.radioGroup}>
            <label className={styles.radio}>
              <input
                type="radio"
                name="brand"
                value=""
                checked={!filters.brand}
                onChange={() => update('brand', '')}
              />
              All Brands
            </label>
            {brands.map((brand) => (
              <label key={brand} className={styles.radio}>
                <input
                  type="radio"
                  name="brand"
                  value={brand}
                  checked={filters.brand === brand}
                  onChange={() => update('brand', brand)}
                />
                {brand}
              </label>
            ))}
          </div>
        </section>
      )}

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Price Range</h4>
        <div className={styles.priceInputs}>
          <input
            type="number"
            className={styles.priceInput}
            placeholder="Min $"
            value={filters.minPrice ?? ''}
            onChange={(e) => update('minPrice', e.target.value ? Number(e.target.value) : null)}
            min={0}
          />
          <span className={styles.priceSep}>–</span>
          <input
            type="number"
            className={styles.priceInput}
            placeholder="Max $"
            value={filters.maxPrice ?? ''}
            onChange={(e) => update('maxPrice', e.target.value ? Number(e.target.value) : null)}
            min={0}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h4 className={styles.sectionTitle}>Size</h4>
        <div className={styles.sizeGrid}>
          {sizes.map((size) => (
            <button
              key={size}
              className={`${styles.sizeBtn} ${filters.sizes.includes(size) ? styles.sizeBtnActive : ''}`}
              onClick={() => toggleSize(size)}
              type="button"
            >
              {size.replace('US ', '')}
            </button>
          ))}
        </div>
      </section>
    </aside>
  );
}
