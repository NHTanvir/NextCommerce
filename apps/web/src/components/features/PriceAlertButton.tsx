'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  useGetAlertStatusQuery,
  useSubscribePriceAlertMutation,
  useUnsubscribePriceAlertMutation,
} from '@/store/api/price-alerts.api';
import styles from './PriceAlertButton.module.scss';

interface Props {
  productId: string;
  currentPriceCents: number;
}

export function PriceAlertButton({ productId, currentPriceCents }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  const [showForm, setShowForm] = useState(false);
  const [targetInput, setTargetInput] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const { data: status, isLoading: statusLoading } = useGetAlertStatusQuery(productId, {
    skip: !user,
  });

  const [subscribe, { isLoading: subscribing }] = useSubscribePriceAlertMutation();
  const [unsubscribe, { isLoading: unsubscribing }] = useUnsubscribePriceAlertMutation();

  if (!user) return null;
  if (statusLoading) return null;

  const hasAlert = status?.hasAlert ?? false;

  const handleSubscribe = async () => {
    const targetCents = targetInput
      ? Math.round(parseFloat(targetInput) * 100)
      : undefined;

    await subscribe({ productId, targetPriceCents: targetCents });
    setShowForm(false);
    setTargetInput('');
    setSuccessMsg('Alert set! We\'ll notify you when the price drops.');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  const handleUnsubscribe = async () => {
    await unsubscribe(productId);
    setSuccessMsg('Price alert removed.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (hasAlert) {
    return (
      <div className={styles.wrap}>
        <button
          className={styles.activeBtn}
          onClick={handleUnsubscribe}
          disabled={unsubscribing}
          title={
            status?.targetPriceCents
              ? `Alert set for $${(status.targetPriceCents / 100).toFixed(2)}`
              : 'Alert set for any price drop'
          }
        >
          🔔 Price Alert Active
        </button>
        {successMsg && <p className={styles.success}>{successMsg}</p>}
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      {!showForm ? (
        <button
          className={styles.setBtn}
          onClick={() => setShowForm(true)}
        >
          🔔 Set Price Alert
        </button>
      ) : (
        <div className={styles.form}>
          <p className={styles.formLabel}>
            Notify me when the price drops
            {currentPriceCents > 0 && (
              <span className={styles.currentPrice}>
                {' '}(now ${(currentPriceCents / 100).toFixed(2)})
              </span>
            )}
          </p>
          <div className={styles.inputRow}>
            <div className={styles.inputWrap}>
              <span className={styles.dollarSign}>$</span>
              <input
                type="number"
                className={styles.input}
                placeholder="Any drop"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                min="0.01"
                step="0.01"
              />
            </div>
            <button
              className="btn btn--primary btn--sm"
              onClick={handleSubscribe}
              disabled={subscribing}
            >
              {subscribing ? 'Setting…' : 'Set Alert'}
            </button>
            <button
              className="btn btn--ghost btn--sm"
              onClick={() => { setShowForm(false); setTargetInput(''); }}
            >
              Cancel
            </button>
          </div>
          <p className={styles.hint}>Leave blank to alert on any price drop.</p>
        </div>
      )}
      {successMsg && <p className={styles.success}>{successMsg}</p>}
    </div>
  );
}
