'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGetTrendingProductsQuery, useGetFeaturedProductsQuery, useGetDealsQuery } from '@/store/api/catalog.api';
import { ProductCard, ProductCardSkeleton } from '@/components/ui/ProductCard';
import styles from './trending.module.scss';

const TABS = [
  { id: 'trending', label: 'Trending Now', icon: '🔥' },
  { id: 'featured', label: 'Featured Picks', icon: '⭐' },
  { id: 'deals', label: 'Hot Deals', icon: '💰' },
] as const;

type TabId = typeof TABS[number]['id'];

function DealCard({ product }: { product: any }) {
  const price = product.salePriceCents ?? product.basePriceCents;
  const imageUrl = product.images?.[0]?.url;

  return (
    <Link href={`/products/${product.slug}`} className={styles.dealCard}>
      <div className={styles.dealImage}>
        {imageUrl ? (
          <Image src={imageUrl} alt={product.title} fill sizes="(max-width: 768px) 100vw, 33vw" className={styles.dealImg} />
        ) : (
          <div className={styles.dealImgPlaceholder}>👟</div>
        )}
        {product.discountPct > 0 && (
          <span className={styles.dealBadge}>-{product.discountPct}%</span>
        )}
      </div>
      <div className={styles.dealBody}>
        {product.brand && <span className={styles.dealBrand}>{product.brand}</span>}
        <h3 className={styles.dealTitle}>{product.title}</h3>
        <div className={styles.dealPrices}>
          <span className={styles.dealSalePrice}>${(price / 100).toFixed(2)}</span>
          {product.salePriceCents && product.salePriceCents < product.basePriceCents && (
            <span className={styles.dealOriginalPrice}>${(product.basePriceCents / 100).toFixed(2)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default function TrendingPage() {
  const [activeTab, setActiveTab] = useState<TabId>('trending');

  const { data: trendingData, isLoading: tLoading } = useGetTrendingProductsQuery(24);
  const { data: featuredData, isLoading: fLoading } = useGetFeaturedProductsQuery(24);
  const { data: dealsData, isLoading: dLoading } = useGetDealsQuery({ limit: 24 });

  const trending = useMemo(() => trendingData?.products ?? [], [trendingData]);
  const featured = featuredData ?? [];
  const deals = useMemo(() => dealsData?.data ?? [], [dealsData]);

  const loading =
    (activeTab === 'trending' && tLoading) ||
    (activeTab === 'featured' && fLoading) ||
    (activeTab === 'deals' && dLoading);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.heroBadge}>What's Hot</span>
          <h1 className={styles.heroTitle}>Trending</h1>
          <p className={styles.heroSub}>
            The most popular styles right now — curated from sales, views, and wishlist saves.
          </p>
        </div>
      </div>

      <div className={`container ${styles.content}`}>
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.grid}>
            {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : activeTab === 'deals' ? (
          <>
            <div className={styles.dealsGrid}>
              {deals.map((p) => <DealCard key={p.id} product={p} />)}
            </div>
            {deals.length === 0 && (
              <div className={styles.empty}>
                <span>💰</span>
                <p>No active deals right now. Check back soon!</p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className={styles.grid}>
              {(activeTab === 'trending' ? trending : featured).map((p: any) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {(activeTab === 'trending' ? trending : featured).length === 0 && (
              <div className={styles.empty}>
                <span>✨</span>
                <p>Nothing to show right now.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
