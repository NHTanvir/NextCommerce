import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ProductCard } from '@/components/ui/ProductCard';
import styles from '../collections.module.scss';
import detailStyles from './collection-detail.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface CollectionDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  bannerImageUrl: string | null;
  productIds: string[];
  discountPercent: number;
  endsAt: string | null;
}

async function fetchCollection(slug: string): Promise<CollectionDto | null> {
  try {
    const res = await fetch(`${API_URL}/api/collections/${slug}`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchProducts(ids: string[]): Promise<any[]> {
  if (!ids.length) return [];
  try {
    const params = new URLSearchParams({ ids: ids.join(','), limit: '50' });
    const res = await fetch(`${API_URL}/api/catalog/products?${params}`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? data ?? [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const collection = await fetchCollection(params.slug);
  return {
    title: collection ? `${collection.name} — NextCommerce` : 'Collection Not Found',
    description: collection?.description ?? undefined,
  };
}

export default async function CollectionDetailPage({ params }: { params: { slug: string } }) {
  const collection = await fetchCollection(params.slug);
  if (!collection) notFound();

  const products = await fetchProducts(collection.productIds);

  return (
    <div className={`container ${detailStyles.page}`}>
      {collection.bannerImageUrl && (
        <div className={detailStyles.banner}>
          <img src={collection.bannerImageUrl} alt={collection.name} className={detailStyles.bannerImg} />
          <div className={detailStyles.bannerOverlay}>
            <h1 className={detailStyles.bannerTitle}>{collection.name}</h1>
          </div>
        </div>
      )}

      <div className={detailStyles.header}>
        <div>
          <Link href="/collections" className={detailStyles.back}>← All Collections</Link>
          {!collection.bannerImageUrl && (
            <h1 className={detailStyles.title}>{collection.name}</h1>
          )}
          {collection.description && (
            <p className={detailStyles.desc}>{collection.description}</p>
          )}
        </div>
        <div className={detailStyles.meta}>
          {collection.discountPercent > 0 && (
            <span className={detailStyles.discountBadge}>{collection.discountPercent}% OFF EVERYTHING</span>
          )}
          {collection.endsAt && (
            <span className={detailStyles.endsAt}>
              Ends {new Date(collection.endsAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {products.length === 0 ? (
        <div className={styles.empty}>
          <p>No products in this collection yet.</p>
        </div>
      ) : (
        <div className={detailStyles.grid}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
