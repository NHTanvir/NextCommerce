import Link from 'next/link';
import Image from 'next/image';
import { Reveal } from '@/components/ui/Reveal';
import styles from './HomePage.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface HomeProduct {
  id: string;
  slug: string;
  title: string;
  brand: string;
  basePriceCents: number;
  salePriceCents: number | null;
  discountPct: number;
  categoryName?: string;
  images: { url: string; alt?: string }[];
}

const CATEGORY_COPY: Record<string, { label: string; line: string }> = {
  running: { label: 'Running', line: 'Road, track and race day' },
  lifestyle: { label: 'Lifestyle', line: 'Everyday silhouettes' },
  basketball: { label: 'Basketball', line: 'Court-ready traction' },
  trail: { label: 'Trail', line: 'Grip for rough ground' },
};

/**
 * Line icons rather than emoji: emoji render as a different typeface on
 * every platform, cannot take the accent colour, and were the reason this
 * strip looked like a placeholder.
 */
const ICONS = {
  truck:
    'M3 7a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v8H3V7Zm11 3h3.1a1 1 0 0 1 .82.43L20 13v2h-6v-5ZM7 18.5A1.75 1.75 0 1 0 7 15a1.75 1.75 0 0 0 0 3.5Zm10 0a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z',
  rotate: 'M4 12a8 8 0 1 1 2.4 5.7M4 12V7m0 5h5',
  shield: 'M12 3l7 3v5.5c0 4.2-2.9 7.9-7 9-4.1-1.1-7-4.8-7-9V6l7-3Zm-2.5 8.8 1.9 1.9 3.6-3.9',
  star: 'M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.7l5.8-.8L12 3.6Z',
} as const;

const FEATURES: { icon: keyof typeof ICONS; title: string; desc: string }[] = [
  { icon: 'truck', title: 'Free shipping', desc: 'On every order over $75, anywhere we ship.' },
  { icon: 'rotate', title: '30-day returns', desc: 'Send them back unworn, no questions asked.' },
  { icon: 'shield', title: 'Secure checkout', desc: 'Card details never touch our servers.' },
  { icon: 'star', title: 'Loyalty points', desc: 'Earned on everything, spent on anything.' },
];

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICONS[name]} />
    </svg>
  );
}

const COLLECTIONS = [
  {
    title: 'Summer Essentials',
    desc: 'Light, breathable, iconic',
    slug: 'summer-essentials',
    tint: 'var(--color-accent)',
  },
  {
    title: 'Performance Series',
    desc: 'Built for race day',
    slug: 'performance-series',
    tint: 'var(--color-accent-2)',
  },
  { title: 'Street Style', desc: 'Wear your identity', slug: 'street-style', tint: '#f472b6' },
];

/** Unsplash serves whatever width the query asks for; the seed asks for 600. */
function atWidth(url: string | undefined, width: number): string | undefined {
  return url?.replace(/([?&]w=)\d+/, `$1${width}`);
}

function price(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

async function getCatalog(): Promise<HomeProduct[]> {
  try {
    const res = await fetch(`${API_URL}/api/catalog/products?limit=40`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? []) as HomeProduct[];
  } catch {
    // The storefront is still worth serving without a catalog behind it.
    return [];
  }
}

export default async function HomePage() {
  const products = await getCatalog();
  const withImages = products.filter((p) => p.images?.[0]?.url);

  // An editorial pick for the hero collage: these three photograph well
  // against the gradient. Anything missing from the catalogue is topped up
  // in catalogue order, so the hero is never empty.
  const HERO_SLUGS = ['ultra-boost-elite', 'air-force-1-07', 'endorphin-speed-4'];
  const heroPicked = HERO_SLUGS.map((slug) => withImages.find((p) => p.slug === slug)).filter(
    (p): p is HomeProduct => Boolean(p),
  );
  const hero = [...heroPicked, ...withImages.filter((p) => !heroPicked.includes(p))].slice(0, 3);
  const featured = [...withImages].sort((a, b) => b.discountPct - a.discountPct).slice(0, 8);

  const categories = [...new Set(withImages.map((p) => p.categoryName).filter(Boolean))].map(
    (name) => ({
      name: name as string,
      ...(CATEGORY_COPY[name as string] ?? { label: name as string, line: 'Shop the range' }),
      image: withImages.find((p) => p.categoryName === name)?.images[0]?.url,
      count: withImages.filter((p) => p.categoryName === name).length,
    }),
  );

  const brandCounts = new Map<string, number>();
  for (const p of withImages) brandCounts.set(p.brand, (brandCounts.get(p.brand) ?? 0) + 1);
  const brands = [...brandCounts.entries()].sort((a, b) => b[1] - a[1]).map(([brand]) => brand);

  return (
    <>
      {/* ---------- Hero ---------- */}
      <section className={styles.hero}>
        <div className={styles.aurora} aria-hidden="true">
          <span className={styles.auroraOne} />
          <span className={styles.auroraTwo} />
          <span className={styles.grid} />
        </div>

        <div className={`container ${styles.heroInner}`}>
          <Reveal className={styles.heroCopy}>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowDot} /> New season · FW26 drop
            </span>
            <h1 className={styles.title}>
              Footwear that
              <br />
              <span className={styles.titleAccent}>keeps up</span> with you
            </h1>
            <p className={styles.lede}>
              {withImages.length || 30} pairs from the brands that define running, court and street.
              Free shipping over $75, and thirty days to change your mind.
            </p>
            <div className={styles.heroCtas}>
              <Link href="/products" className={`btn btn--primary btn--lg ${styles.ctaPrimary}`}>
                Shop the catalogue
              </Link>
              <Link href="/deals" className={`btn btn--outline btn--lg`}>
                See what&rsquo;s on sale
              </Link>
            </div>
            <dl className={styles.stats}>
              <div>
                <dt>Styles in stock</dt>
                <dd>{withImages.length || 30}</dd>
              </div>
              <div>
                <dt>Brands</dt>
                <dd>{brands.length || 14}</dd>
              </div>
              <div>
                <dt>Average rating</dt>
                <dd>4.9★</dd>
              </div>
            </dl>
          </Reveal>

          <Reveal className={styles.heroArt} delay={120}>
            {hero[0] ? (
              <div className={styles.stage}>
                <Link href={`/products/${hero[0].slug}`} className={styles.stageMain}>
                  <Image
                    src={atWidth(hero[0].images[0].url, 1200) ?? hero[0].images[0].url}
                    alt={hero[0].title}
                    fill
                    priority
                    sizes="(max-width: 980px) 90vw, 46vw"
                    className={styles.stageImg}
                  />
                  <span className={styles.stageTag}>
                    <strong>{hero[0].title}</strong>
                    <em>{price(hero[0].salePriceCents ?? hero[0].basePriceCents)}</em>
                  </span>
                </Link>
                {hero.slice(1, 3).map((p, i) => (
                  <Link
                    key={p.id}
                    href={`/products/${p.slug}`}
                    className={`${styles.stageChip} ${i === 0 ? styles.chipOne : styles.chipTwo}`}
                  >
                    <Image
                      src={p.images[0].url}
                      alt={p.title}
                      fill
                      sizes="160px"
                      className={styles.chipImg}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className={styles.stageEmpty} aria-hidden="true" />
            )}
          </Reveal>
        </div>
      </section>

      {/* ---------- Categories ---------- */}
      {categories.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <Reveal className={styles.head}>
              <div>
                <p className={styles.kicker}>Browse</p>
                <h2 className={styles.heading}>Shop by category</h2>
              </div>
              <Link href="/products" className={styles.headLink}>
                All products <span aria-hidden="true">→</span>
              </Link>
            </Reveal>

            <div className={styles.catGrid}>
              {categories.map((c, i) => (
                <Reveal key={c.name} delay={i * 70}>
                  <Link href={`/products?category=${c.name}`} className={styles.catCard}>
                    {c.image && (
                      <Image
                        src={c.image}
                        alt=""
                        fill
                        sizes="(max-width: 700px) 50vw, 25vw"
                        className={styles.catImg}
                      />
                    )}
                    <span className={styles.catBody}>
                      <strong>{c.label}</strong>
                      <small>{c.line}</small>
                      <em>{c.count} styles</em>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Featured ---------- */}
      {featured.length > 0 && (
        <section className={styles.section}>
          <div className="container">
            <Reveal className={styles.head}>
              <div>
                <p className={styles.kicker}>This week</p>
                <h2 className={styles.heading}>Featured drops</h2>
              </div>
              <Link href="/products" className={styles.headLink}>
                Shop all <span aria-hidden="true">→</span>
              </Link>
            </Reveal>

            <div className={styles.productGrid}>
              {featured.map((p, i) => (
                <Reveal key={p.id} delay={(i % 4) * 70}>
                  <Link href={`/products/${p.slug}`} className={styles.product}>
                    <span className={styles.productMedia}>
                      <Image
                        src={p.images[0].url}
                        alt={p.title}
                        fill
                        sizes="(max-width: 700px) 50vw, 25vw"
                        className={styles.productImg}
                      />
                      {p.discountPct > 0 && <span className={styles.off}>−{p.discountPct}%</span>}
                    </span>
                    <span className={styles.productBody}>
                      <small>{p.brand}</small>
                      <strong>{p.title}</strong>
                      <span className={styles.priceRow}>
                        <b>{price(p.salePriceCents ?? p.basePriceCents)}</b>
                        {p.salePriceCents && <s>{price(p.basePriceCents)}</s>}
                      </span>
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- Collections ---------- */}
      <section className={styles.section}>
        <div className="container">
          <Reveal className={styles.head}>
            <div>
              <p className={styles.kicker}>Curated</p>
              <h2 className={styles.heading}>Collections</h2>
            </div>
            <Link href="/collections" className={styles.headLink}>
              All collections <span aria-hidden="true">→</span>
            </Link>
          </Reveal>

          <div className={styles.colGrid}>
            {COLLECTIONS.map((c, i) => (
              <Reveal key={c.slug} delay={i * 80}>
                <Link
                  href={`/collections/${c.slug}`}
                  className={styles.colCard}
                  style={{ '--tint': c.tint } as React.CSSProperties}
                >
                  {withImages[i * 4 + 3]?.images[0]?.url && (
                    <Image
                      src={withImages[i * 4 + 3].images[0].url}
                      alt=""
                      fill
                      sizes="(max-width: 900px) 100vw, 33vw"
                      className={styles.colImg}
                    />
                  )}
                  <span className={styles.colBody}>
                    <strong>{c.title}</strong>
                    <small>{c.desc}</small>
                    <em>
                      Explore <span aria-hidden="true">→</span>
                    </em>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Why shop here ---------- */}
      <section className={styles.promise}>
        <div className="container">
          <Reveal className={styles.promiseHead}>
            <p className={styles.kicker}>Every order</p>
            <h2 className={styles.heading}>What you get, as standard</h2>
          </Reveal>

          <div className={styles.promiseGrid}>
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 90}>
                <article className={styles.promiseCard}>
                  <span className={styles.promiseIcon}>
                    <Icon name={f.icon} />
                  </span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                  <span className={styles.promiseLine} aria-hidden="true" />
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
