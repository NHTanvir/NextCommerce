'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './tags.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

const TAG_COLORS = [
  '#e94560', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ef4444', '#22c55e', '#a855f7', '#f97316',
  '#14b8a6', '#6366f1', '#ec4899', '#84cc16', '#0ea5e9',
];

function getTagColor(tag: string): string {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export default function TagsPage() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/tags`)
      .then((r) => r.json())
      .then((data) => setTags(Array.isArray(data) ? data : []))
      .catch(() => setTags([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? tags.filter((t) => t.toLowerCase().includes(search.toLowerCase()))
    : tags;

  const tagsByLetter = filtered.reduce<Record<string, string[]>>((acc, tag) => {
    const letter = tag[0]?.toUpperCase() ?? '#';
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(tag);
    return acc;
  }, {});

  const letters = Object.keys(tagsByLetter).sort();

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Browse by Tag</h1>
        <p className={styles.subtitle}>
          Discover products by style, feature, and activity.
        </p>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🏷️</span>
          <input
            type="text"
            placeholder="Filter tags…"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={`container ${styles.body}`}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Loading tags…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <span>🏷️</span>
            <p>{search ? `No tags matching "${search}"` : 'No tags available yet.'}</p>
          </div>
        ) : (
          <>
            {/* Tag cloud */}
            <section className={styles.cloudSection}>
              <h2 className={styles.sectionTitle}>Tag Cloud</h2>
              <div className={styles.cloud}>
                {filtered.map((tag) => {
                  const color = getTagColor(tag);
                  return (
                    <Link
                      key={tag}
                      href={`/products?tag=${encodeURIComponent(tag)}`}
                      className={styles.tagChip}
                      style={{
                        borderColor: color + '60',
                        background: color + '15',
                        color,
                      }}
                    >
                      {tag}
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Alphabetical index */}
            <section className={styles.alphaSection}>
              <h2 className={styles.sectionTitle}>A–Z Index</h2>
              <div className={styles.letterNav}>
                {letters.map((l) => (
                  <a key={l} href={`#letter-${l}`} className={styles.letterLink}>{l}</a>
                ))}
              </div>
              <div className={styles.alphaGroups}>
                {letters.map((letter) => (
                  <div key={letter} id={`letter-${letter}`} className={styles.letterGroup}>
                    <h3 className={styles.letterHeading}>{letter}</h3>
                    <ul className={styles.tagList}>
                      {tagsByLetter[letter].map((tag) => (
                        <li key={tag}>
                          <Link
                            href={`/products?tag=${encodeURIComponent(tag)}`}
                            className={styles.tagLink}
                          >
                            <span
                              className={styles.tagDot}
                              style={{ background: getTagColor(tag) }}
                            />
                            {tag}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
