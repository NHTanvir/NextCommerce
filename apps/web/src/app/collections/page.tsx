import Link from 'next/link';
import type { Metadata } from 'next';
import styles from './collections.module.scss';

export const metadata: Metadata = {
  title: 'Collections — NextCommerce',
  description: 'Shop curated collections of premium footwear with exclusive discounts.',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface CollectionDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bannerImageUrl: string | null;
  productIds: string[];
  discountPercent: number;
  isActive: boolean;
  endsAt: string | null;
}

async function fetchCollections(): Promise<CollectionDto[]> {
  try {
    const res = await fetch(`${API_URL}/api/collections`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CollectionsPage() {
  const collections = await fetchCollections();

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Collections</h1>
        <p className={styles.sub}>Curated groups with exclusive offers.</p>
      </div>

      {collections.length === 0 ? (
        <div className={styles.empty}>
          <p>No collections available right now. Check back soon!</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {collections.map((c) => (
            <Link key={c.id} href={`/collections/${c.slug}`} className={styles.card}>
              <div className={styles.cardImage}>
                {c.bannerImageUrl ? (
                  <img src={c.bannerImageUrl} alt={c.name} className={styles.bannerImg} />
                ) : (
                  <div className={styles.imagePlaceholder}>
                    <span>👟</span>
                  </div>
                )}
                {c.discountPercent > 0 && (
                  <span className={styles.discountBadge}>{c.discountPercent}% OFF</span>
                )}
              </div>
              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>{c.name}</h2>
                {c.description && <p className={styles.cardDesc}>{c.description}</p>}
                <div className={styles.cardMeta}>
                  <span className={styles.productCount}>{c.productIds.length} products</span>
                  {c.endsAt && (
                    <span className={styles.endsAt}>
                      Ends {new Date(c.endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
