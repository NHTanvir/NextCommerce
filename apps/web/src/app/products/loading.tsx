import { ProductCardSkeleton } from '@/components/ui/ProductCard';
import styles from './products.module.scss';

export default function ProductsLoading() {
  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 32, borderRadius: 6 }} />
          ))}
        </div>
      </aside>
      <div className={styles.main}>
        <div className={styles.grid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
