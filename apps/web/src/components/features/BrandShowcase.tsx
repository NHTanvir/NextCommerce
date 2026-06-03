import styles from './BrandShowcase.module.scss';

const BRANDS = [
  { name: 'Nike', tagline: 'Just Do It' },
  { name: 'Adidas', tagline: 'Impossible Is Nothing' },
  { name: 'Puma', tagline: 'Forever Faster' },
  { name: 'Converse', tagline: 'Since 1908' },
  { name: 'New Balance', tagline: 'Fearlessly Independent' },
  { name: 'Reebok', tagline: 'Be More Human' },
  { name: 'Vans', tagline: 'Off the Wall' },
  { name: 'Jordan', tagline: 'The Air' },
];

export function BrandShowcase() {
  return (
    <section className={styles.section}>
      <div className="container">
        <h2 className={styles.heading}>Top Brands</h2>
        <div className={styles.grid}>
          {BRANDS.map((brand) => (
            <div key={brand.name} className={styles.brand}>
              <div className={styles.logo}>{brand.name[0]}</div>
              <div className={styles.info}>
                <span className={styles.name}>{brand.name}</span>
                <span className={styles.tagline}>{brand.tagline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
