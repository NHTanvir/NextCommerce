import Link from 'next/link';
import styles from './HomePage.module.scss';

const CATEGORIES = [
  { icon: '🏃', name: 'Running', slug: 'running' },
  { icon: '🏀', name: 'Basketball', slug: 'basketball' },
  { icon: '👟', name: 'Lifestyle', slug: 'lifestyle' },
  { icon: '⛰️', name: 'Trail', slug: 'trail' },
  { icon: '💪', name: 'Training', slug: 'training' },
  { icon: '🌊', name: 'Outdoor', slug: 'outdoor' },
];

const BRANDS = [
  { name: 'Nike', emoji: '✔️' },
  { name: 'Adidas', emoji: '🏆' },
  { name: 'New Balance', emoji: '🏃' },
  { name: 'Puma', emoji: '🐆' },
  { name: 'Reebok', emoji: '💪' },
  { name: 'Asics', emoji: '🌊' },
];

const FEATURES = [
  { icon: '🚚', title: 'Free Shipping', desc: 'On orders over $75' },
  { icon: '↩️', title: 'Easy Returns', desc: '30-day hassle-free returns' },
  { icon: '🔒', title: 'Secure Payment', desc: 'Your data is protected' },
  { icon: '⭐', title: 'Loyalty Points', desc: 'Earn rewards on every order' },
];

const TRENDING_COLLECTIONS = [
  { title: 'Summer Essentials', desc: 'Light, breathable, iconic', emoji: '☀️', color: '#e94560', href: '/collections' },
  { title: 'Performance Series', desc: 'Built for champions', emoji: '⚡', color: '#3b82f6', href: '/collections' },
  { title: 'Street Style', desc: 'Wear your identity', emoji: '🏙️', color: '#10b981', href: '/collections' },
];

async function getFeaturedProducts() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api'}/catalog/trending?limit=8`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.products ?? [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featured = await getFeaturedProducts();

  return (
    <>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <span className={styles.heroEyebrow}>
              <span>★</span> New Season Collection
            </span>
            <h1 className={styles.heroTitle}>
              Step Into<br />
              Your <span>Best</span><br />
              Performance
            </h1>
            <p className={styles.heroSubtitle}>
              Discover premium footwear engineered for athletes and trendsetters alike.
              Free shipping on orders over $75.
            </p>
            <div className={styles.heroCta}>
              <Link href="/products" className="btn btn--primary btn--lg">
                Shop Now
              </Link>
              <Link href="/new-arrivals" className="btn btn--outline btn--lg">
                New Arrivals
              </Link>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>200+</span>
                <span className={styles.statLabel}>Styles</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>50k+</span>
                <span className={styles.statLabel}>Customers</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>4.9★</span>
                <span className={styles.statLabel}>Rating</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.heroImgBg} />
            <div className={styles.heroImg}>👟</div>
          </div>
        </div>
      </section>

      {/* Feature bar */}
      <section className={styles.featuresBar}>
        <div className="container">
          <div className={styles.features}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureItem}>
                <span className={styles.featureIcon}>{f.icon}</span>
                <div>
                  <p className={styles.featureTitle}>{f.title}</p>
                  <p className={styles.featureDesc}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={styles.categoriesSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Shop by Category</h2>
            <Link href="/products" className={styles.sectionLink}>View all →</Link>
          </div>
          <div className={styles.categories}>
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/products?category=${cat.slug}`}
                className={styles.categoryCard}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryName}>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending collections */}
      <section className={styles.collectionsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Trending Now</h2>
            <Link href="/collections" className={styles.sectionLink}>All collections →</Link>
          </div>
          <div className={styles.collectionsGrid}>
            {TRENDING_COLLECTIONS.map((col) => (
              <Link key={col.title} href={col.href} className={styles.collectionCard} style={{ '--col-color': col.color } as React.CSSProperties}>
                <span className={styles.collectionEmoji}>{col.emoji}</span>
                <div className={styles.collectionBody}>
                  <h3 className={styles.collectionTitle}>{col.title}</h3>
                  <p className={styles.collectionDesc}>{col.desc}</p>
                </div>
                <span className={styles.collectionArrow}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured products */}
      {featured.length > 0 && (
        <section className={styles.featuredSection}>
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Featured Products</h2>
              <Link href="/products" className={styles.sectionLink}>Shop all →</Link>
            </div>
            <div className={styles.featuredGrid}>
              {featured.map((p: { id: string; slug: string; title: string; brand: string; basePriceCents: number }) => (
                <Link key={p.id} href={`/products/${p.slug}`} className={styles.featuredCard}>
                  <div className={styles.featuredCardImg}>
                    <span>👟</span>
                  </div>
                  <div className={styles.featuredCardBody}>
                    <p className={styles.featuredCardBrand}>{p.brand}</p>
                    <p className={styles.featuredCardTitle}>{p.title}</p>
                    <p className={styles.featuredCardPrice}>${(p.basePriceCents / 100).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Brands */}
      <section className={styles.brandsSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <p className={styles.brandsTitle}>Shop by Brand</p>
            <Link href="/brands" className={styles.sectionLink}>All brands →</Link>
          </div>
          <div className={styles.brands}>
            {BRANDS.map((b) => (
              <Link key={b.name} href={`/products?brand=${encodeURIComponent(b.name)}`} className={styles.brandChip}>
                <span>{b.emoji}</span>
                <span>{b.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className="container">
          <h2 className={styles.newsletterTitle}>Stay in the Loop</h2>
          <p className={styles.newsletterSub}>Get notified about new drops and exclusive deals.</p>
          <div className={styles.newsletterActions}>
            <Link href="/newsletter" className="btn btn--primary">
              Subscribe →
            </Link>
            <Link href="/deals" className="btn btn--outline">
              View Deals
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
