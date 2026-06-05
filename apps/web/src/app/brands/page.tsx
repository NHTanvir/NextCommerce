'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useGetBrandsQuery } from '@/store/api/catalog.api';
import styles from './brands.module.scss';

const BRAND_EMOJIS: Record<string, string> = {
  Nike: '✔️',
  Adidas: '🏆',
  Jordan: '🏀',
  Puma: '🐆',
  Reebok: '💪',
  Vans: '🛹',
  Converse: '⭐',
  'New Balance': '🏃',
  Asics: '🌊',
  Saucony: '🦘',
  Brooks: '🌲',
  Salomon: '🏔️',
  Hoka: '🌈',
  'On Running': '⚡',
  Mizuno: '💎',
  Fila: '🎾',
  'Under Armour': '🦅',
  Balenciaga: '👑',
  Gucci: '🌹',
  'Off-White': '🤍',
};

function getBrandEmoji(brand: string): string {
  return BRAND_EMOJIS[brand] ?? '👟';
}

function getBrandLetter(brand: string): string {
  return brand.charAt(0).toUpperCase();
}

export default function BrandsPage() {
  const [search, setSearch] = useState('');
  const { data: brands = [], isLoading } = useGetBrandsQuery();

  const filtered = useMemo(() => {
    if (!search) return brands;
    return brands.filter((b) => b.brand.toLowerCase().includes(search.toLowerCase()));
  }, [brands, search]);

  const alphabetical = useMemo(() => {
    const sorted = [...filtered].sort((a, b) => a.brand.localeCompare(b.brand));
    const groups = new Map<string, typeof sorted>();
    for (const b of sorted) {
      const letter = getBrandLetter(b.brand);
      if (!groups.has(letter)) groups.set(letter, []);
      groups.get(letter)!.push(b);
    }
    return groups;
  }, [filtered]);

  const letters = Array.from(alphabetical.keys()).sort();
  const totalProducts = brands.reduce((sum, b) => sum + b.productCount, 0);

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>Shop by Brand</h1>
        <p className={styles.heroSub}>
          {isLoading ? '…' : `${brands.length} brands · ${totalProducts.toLocaleString()} products`}
        </p>
      </div>

      {/* Search + index nav */}
      <div className={styles.controls}>
        <input
          type="search"
          className={styles.searchInput}
          placeholder="Search brands…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {!search && (
          <div className={styles.alphaNav}>
            {letters.map((letter) => (
              <a key={letter} href={`#brand-${letter}`} className={styles.alphaLink}>
                {letter}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Brand groups */}
      <div className={styles.content}>
        {isLoading && (
          <div className={styles.loading}>
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className={styles.brandSkeleton} />
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className={styles.empty}>
            <p>No brands match "{search}"</p>
          </div>
        )}

        {!isLoading && !search && letters.map((letter) => (
          <section key={letter} id={`brand-${letter}`} className={styles.group}>
            <h2 className={styles.groupLetter}>{letter}</h2>
            <div className={styles.brandGrid}>
              {alphabetical.get(letter)!.map(({ brand, productCount }) => (
                <BrandCard key={brand} brand={brand} productCount={productCount} />
              ))}
            </div>
          </section>
        ))}

        {!isLoading && search && (
          <div className={styles.brandGrid}>
            {filtered.map(({ brand, productCount }) => (
              <BrandCard key={brand} brand={brand} productCount={productCount} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BrandCard({ brand, productCount }: { brand: string; productCount: number }) {
  return (
    <Link
      href={`/products?brand=${encodeURIComponent(brand)}`}
      className={styles.brandCard}
    >
      <span className={styles.brandEmoji}>{getBrandEmoji(brand)}</span>
      <span className={styles.brandName}>{brand}</span>
      <span className={styles.brandCount}>{productCount} products</span>
    </Link>
  );
}
