'use client';

import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { useClickOutside } from '@/hooks/useClickOutside';
import styles from './SearchBar.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface QuickResult {
  id: string;
  slug: string;
  title: string;
  brand: string;
  basePriceCents: number;
}

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QuickResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false));

  const debouncedQuery = useDebounce(query, 300);

  const search = async (q: string) => {
    if (!q.trim() || q.length < 2) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/catalog/products?search=${encodeURIComponent(q)}&limit=5`,
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.data ?? []);
      }
    } finally {
      setLoading(false);
    }
  };

  // Trigger search when debounced query changes
  if (debouncedQuery !== undefined) {
    search(debouncedQuery as string);
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery('');
    }
  };

  const handleSelect = (slug: string) => {
    router.push(`/products/${slug}`);
    setOpen(false);
    setQuery('');
  };

  return (
    <div ref={containerRef} className={styles.wrapper}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <button type="submit" className={styles.searchIcon} aria-label="Search">
          🔍
        </button>
        <input
          className={styles.input}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search shoes..."
          aria-label="Search products"
        />
        {query && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => { setQuery(''); setResults([]); }}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </form>

      {open && (query.length >= 2) && (
        <div className={styles.dropdown}>
          {loading && <div className={styles.dropdownLoading}>Searching...</div>}
          {!loading && results.length === 0 && query.length >= 2 && (
            <div className={styles.dropdownEmpty}>No results for "{query}"</div>
          )}
          {results.map((r) => (
            <button
              key={r.id}
              type="button"
              className={styles.result}
              onClick={() => handleSelect(r.slug)}
            >
              <div className={styles.resultInfo}>
                <span className={styles.resultBrand}>{r.brand}</span>
                <span className={styles.resultTitle}>{r.title}</span>
              </div>
              <span className={styles.resultPrice}>
                ${(r.basePriceCents / 100).toFixed(2)}
              </span>
            </button>
          ))}
          {results.length > 0 && (
            <button
              type="button"
              className={styles.viewAll}
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(query)}`);
                setOpen(false);
              }}
            >
              View all results for "{query}" →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
