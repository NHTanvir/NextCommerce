import Link from 'next/link';
import styles from './HomePage.module.scss';

const CATEGORIES = [
  { icon: '🏃', name: 'Running', slug: 'running', count: 48 },
  { icon: '🏀', name: 'Basketball', slug: 'basketball', count: 32 },
  { icon: '👟', name: 'Lifestyle', slug: 'lifestyle', count: 64 },
  { icon: '⛰️', name: 'Trail', slug: 'trail', count: 24 },
];

const BRANDS = ['Nike', 'Adidas', 'New Balance', 'Puma', 'Reebok', 'Asics'];

export default function HomePage() {
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
              <Link href="/products?category=new-arrivals" className="btn btn--outline btn--lg">
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
                <span className={styles.categoryCount}>{cat.count} styles</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className={styles.brandsSection}>
        <div className="container">
          <p className={styles.brandsTitle}>Trusted Brands</p>
          <div className={styles.brands}>
            {BRANDS.map((b) => (
              <span key={b} className={styles.brandName}>{b}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className={styles.newsletter}>
        <div className="container">
          <h2 className={styles.newsletterTitle}>Stay in the Loop</h2>
          <p className={styles.newsletterSub}>Get notified about new drops and exclusive deals.</p>
          <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="your@email.com"
              className={styles.emailInput}
              aria-label="Email address"
            />
            <button type="submit" className="btn btn--primary">Subscribe</button>
          </form>
        </div>
      </section>
    </>
  );
}
