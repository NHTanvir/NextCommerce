import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Bundle Deals | NextCommerce',
  description: 'Save more with curated product bundles. Exclusive bundle discounts on top products.',
};

interface BundleDto {
  id: string;
  name: string;
  description: string | null;
  productIds: string[];
  discountPercent: number;
  startsAt: string | null;
  endsAt: string | null;
}

async function getActiveBundles(): Promise<BundleDto[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/bundles`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

function BundleCard({ bundle }: { bundle: BundleDto }) {
  const isExpiringSoon =
    bundle.endsAt &&
    new Date(bundle.endsAt).getTime() - Date.now() < 2 * 24 * 60 * 60 * 1000;

  return (
    <div className="bundle-card">
      <div className="bundle-discount">{bundle.discountPercent}% OFF</div>

      <h3 className="bundle-name">{bundle.name}</h3>
      {bundle.description && <p className="bundle-desc">{bundle.description}</p>}

      <div className="bundle-meta">
        <span className="bundle-products">{bundle.productIds.length} products included</span>
        {isExpiringSoon && bundle.endsAt && (
          <span className="bundle-expiry">
            Ends {new Date(bundle.endsAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>

      <Link href={`/search?bundleId=${bundle.id}`} className="bundle-cta">
        Shop Bundle →
      </Link>
    </div>
  );
}

export default async function BundlesPage() {
  const bundles = await getActiveBundles();

  return (
    <main className="container" style={{ padding: '2rem 1rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', margin: '0 0 0.5rem' }}>
          Bundle Deals
        </h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', margin: 0 }}>
          Save more when you shop our curated product bundles.
        </p>
      </div>

      {bundles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
          <p style={{ fontSize: '3rem', margin: '0 0 1rem' }}>🎁</p>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>No bundles right now</h2>
          <p>Check back soon for exclusive bundle deals.</p>
          <Link href="/products" className="btn btn--primary" style={{ marginTop: '1rem' }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {bundles.map((bundle) => (
            <BundleCard key={bundle.id} bundle={bundle} />
          ))}
        </div>
      )}

      <style>{`
        .bundle-card {
          background: var(--color-surface);
          border: 1px solid var(--color-border);
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          transition: border-color 0.15s;
        }
        .bundle-card:hover {
          border-color: var(--color-accent);
        }
        .bundle-discount {
          display: inline-flex;
          background: var(--color-accent);
          color: #fff;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 0.25rem 0.625rem;
          border-radius: 999px;
          width: fit-content;
          letter-spacing: 0.04em;
        }
        .bundle-name {
          font-size: 1.125rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.02em;
        }
        .bundle-desc {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin: 0;
          line-height: 1.5;
        }
        .bundle-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }
        .bundle-products {
          font-size: 0.8rem;
          color: var(--color-text-muted);
          background: var(--color-bg);
          border: 1px solid var(--color-border);
          border-radius: 999px;
          padding: 0.2rem 0.625rem;
        }
        .bundle-expiry {
          font-size: 0.775rem;
          font-weight: 600;
          color: #f59e0b;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.2);
          border-radius: 999px;
          padding: 0.2rem 0.625rem;
        }
        .bundle-cta {
          display: block;
          text-align: center;
          background: var(--color-accent);
          color: #fff;
          font-size: 0.9rem;
          font-weight: 700;
          padding: 0.75rem;
          border-radius: 0.625rem;
          text-decoration: none;
          margin-top: auto;
          transition: opacity 0.15s;
        }
        .bundle-cta:hover {
          opacity: 0.88;
        }
      `}</style>
    </main>
  );
}
