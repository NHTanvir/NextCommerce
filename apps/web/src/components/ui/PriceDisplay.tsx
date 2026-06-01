import { formatPrice } from '@/lib/formatters';
import styles from './PriceDisplay.module.scss';

interface PriceDisplayProps {
  priceCents: number;
  originalPriceCents?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSavings?: boolean;
}

export function PriceDisplay({
  priceCents,
  originalPriceCents,
  size = 'md',
  showSavings = false,
}: PriceDisplayProps) {
  const hasDiscount = originalPriceCents !== undefined && originalPriceCents > priceCents;
  const savingsCents = hasDiscount ? originalPriceCents - priceCents : 0;
  const discountPct = hasDiscount
    ? Math.round((savingsCents / originalPriceCents) * 100)
    : 0;

  return (
    <div className={`${styles.wrapper} ${styles[size]}`}>
      <span className={styles.price}>{formatPrice(priceCents)}</span>
      {hasDiscount && (
        <>
          <span className={styles.original}>{formatPrice(originalPriceCents)}</span>
          <span className={styles.badge}>-{discountPct}%</span>
        </>
      )}
      {showSavings && hasDiscount && (
        <span className={styles.savings}>Save {formatPrice(savingsCents)}</span>
      )}
    </div>
  );
}
