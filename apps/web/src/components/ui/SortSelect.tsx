'use client';

import styles from './SortSelect.module.scss';

export type SortOption = {
  value: string;
  label: string;
};

const DEFAULT_OPTIONS: SortOption[] = [
  { value: '', label: 'Featured' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Top Rated' },
];

interface Props {
  value: string;
  onChange: (value: string) => void;
  options?: SortOption[];
}

export function SortSelect({ value, onChange, options = DEFAULT_OPTIONS }: Props) {
  return (
    <div className={styles.wrapper}>
      <label className={styles.label} htmlFor="sort-select">Sort by</label>
      <select
        id="sort-select"
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
