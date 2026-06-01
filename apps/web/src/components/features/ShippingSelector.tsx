'use client';

import { useGetShippingRatesQuery } from '@/store/api/shipping.api';
import { formatPrice } from '@/lib/formatters';
import styles from './ShippingSelector.module.scss';

interface ShippingSelectorProps {
  orderTotalCents: number;
  selected?: string;
  onSelect: (rateId: string, priceCents: number) => void;
}

export function ShippingSelector({ orderTotalCents, selected, onSelect }: ShippingSelectorProps) {
  const { data, isLoading, isError } = useGetShippingRatesQuery({ total: orderTotalCents });

  if (isLoading) {
    return <div className={styles.loading}>Loading shipping options...</div>;
  }

  if (isError || !data) {
    return <div className={styles.error}>Failed to load shipping options.</div>;
  }

  return (
    <div className={styles.wrapper}>
      {data.rates.map((rate) => (
        <label key={rate.id} className={`${styles.option} ${selected === rate.id ? styles.selected : ''}`}>
          <input
            type="radio"
            name="shipping-rate"
            value={rate.id}
            checked={selected === rate.id}
            onChange={() => onSelect(rate.id, rate.priceCents)}
            className={styles.radio}
          />
          <div className={styles.info}>
            <div className={styles.top}>
              <span className={styles.name}>{rate.name}</span>
              <span className={styles.price}>
                {rate.isFree ? (
                  <span className={styles.free}>FREE</span>
                ) : (
                  formatPrice(rate.priceCents)
                )}
              </span>
            </div>
            <div className={styles.meta}>
              <span className={styles.carrier}>{rate.carrier}</span>
              <span className={styles.days}>{rate.deliveryDays}</span>
            </div>
          </div>
        </label>
      ))}
    </div>
  );
}
