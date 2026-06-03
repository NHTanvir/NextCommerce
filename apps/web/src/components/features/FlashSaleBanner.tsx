'use client';

import { useState, useEffect } from 'react';
import { useGetActivePromotionsQuery } from '@/store/api/promotions.api';
import styles from './FlashSaleBanner.module.scss';

function useCountdown(endsAt: string) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const tick = () => {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);

  return timeLeft;
}

function CountdownBadge({ endsAt }: { endsAt: string }) {
  const time = useCountdown(endsAt);
  return <span className={styles.countdown}>{time}</span>;
}

export function FlashSaleBanner() {
  const { data: promotions = [] } = useGetActivePromotionsQuery();
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = promotions.filter((p) => !dismissed.has(p.id));

  if (visible.length === 0) return null;

  const top = visible[0];

  return (
    <div className={styles.banner}>
      <span className={styles.badge}>SALE</span>
      <span className={styles.name}>{top.name}</span>
      <span className={styles.discount}>
        {top.discountType === 'percentage' ? `${top.discountValue}% OFF` : `$${top.discountValue} OFF`}
      </span>
      <span className={styles.sep}>·</span>
      <span className={styles.timer}>Ends in <CountdownBadge endsAt={top.endsAt} /></span>
      {top.minimumOrderAmount && (
        <span className={styles.min}>on orders over ${top.minimumOrderAmount}</span>
      )}
      <button
        className={styles.dismiss}
        onClick={() => setDismissed((prev) => new Set([...prev, top.id]))}
        aria-label="Dismiss banner"
      >
        ×
      </button>
    </div>
  );
}
