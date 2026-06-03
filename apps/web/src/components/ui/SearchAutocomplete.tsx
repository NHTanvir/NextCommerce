'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './SearchAutocomplete.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export function SearchAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) { setSuggestions([]); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_URL}/api/search/autocomplete?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data: string[] = await res.json();
          setSuggestions(data);
          setOpen(data.length > 0);
        }
      } catch {
        // silently ignore network errors
      }
    }, 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const submit = (q: string) => {
    setOpen(false);
    setQuery(q);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx((i) => Math.max(i - 1, -1)); }
    else if (e.key === 'Enter') {
      if (activeIdx >= 0) { submit(suggestions[activeIdx]); }
      else { submit(query); }
    }
    else if (e.key === 'Escape') { setOpen(false); setActiveIdx(-1); }
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={styles.inputWrap}>
        <span className={styles.icon}>🔍</span>
        <input
          className={styles.input}
          type="search"
          placeholder="Search shoes, brands…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActiveIdx(-1); }}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
        />
        {query && (
          <button className={styles.clear} onClick={() => { setQuery(''); setSuggestions([]); setOpen(false); }}>
            ×
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <ul className={styles.dropdown} role="listbox">
          {suggestions.map((s, i) => (
            <li
              key={s}
              className={`${styles.item} ${i === activeIdx ? styles.active : ''}`}
              role="option"
              aria-selected={i === activeIdx}
              onMouseDown={() => submit(s)}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <span className={styles.searchIcon}>🔍</span>
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
