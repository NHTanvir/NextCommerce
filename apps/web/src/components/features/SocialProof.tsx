import styles from './SocialProof.module.scss';

const STATS = [
  { value: '50K+', label: 'Happy Customers', icon: '😊' },
  { value: '1,200+', label: 'Products', icon: '👟' },
  { value: '4.8★', label: 'Average Rating', icon: '⭐' },
  { value: '24/7', label: 'Customer Support', icon: '💬' },
];

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah M.',
    location: 'New York, NY',
    rating: 5,
    text: 'Amazing selection and super fast shipping. My Nike Air Max arrived in 2 days and they fit perfectly!',
    product: 'Nike Air Max 90',
  },
  {
    id: 2,
    name: 'James K.',
    location: 'Los Angeles, CA',
    rating: 5,
    text: 'Best prices I\'ve found anywhere. The quality is exactly as described. Will definitely order again.',
    product: 'Adidas Ultraboost',
  },
  {
    id: 3,
    name: 'Priya R.',
    location: 'Chicago, IL',
    rating: 4,
    text: 'Great experience from browsing to delivery. Easy returns process too. Highly recommend!',
    product: 'Jordan 1 High',
  },
];

export function SocialProof() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.stats}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statIcon}>{s.icon}</span>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.testimonials}>
          <h2 className={styles.heading}>What Our Customers Say</h2>
          <div className={styles.grid}>
            {TESTIMONIALS.map((t) => (
              <div key={t.id} className={styles.card}>
                <div className={styles.stars}>
                  {'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}
                </div>
                <p className={styles.text}>"{t.text}"</p>
                <div className={styles.author}>
                  <div className={styles.avatar}>{t.name[0]}</div>
                  <div>
                    <div className={styles.name}>{t.name}</div>
                    <div className={styles.location}>{t.location} · {t.product}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
