'use client';

import { useState } from 'react';
import { useValidateCouponMutation } from '@/store/api/coupons.api';
import styles from './CouponInput.module.scss';

interface CouponInputProps {
  orderTotalCents: number;
  onApply: (discountCents: number, couponId: string, code: string) => void;
  onRemove: () => void;
  appliedCode?: string;
}

export function CouponInput({ orderTotalCents, onApply, onRemove, appliedCode }: CouponInputProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [validateCoupon, { isLoading }] = useValidateCouponMutation();

  const handleApply = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setError('');

    try {
      const result = await validateCoupon({ code: trimmed, orderTotalCents }).unwrap();
      if (result.valid) {
        onApply(result.discountCents, result.couponId, trimmed);
        setCode('');
      } else {
        setError(result.message ?? 'Invalid coupon code');
      }
    } catch {
      setError('Failed to validate coupon. Please try again.');
    }
  };

  if (appliedCode) {
    return (
      <div className={styles.applied}>
        <div className={styles.appliedCode}>
          <span className={styles.tag}>🏷️</span>
          <span>{appliedCode}</span>
        </div>
        <button className={styles.removeBtn} onClick={onRemove} type="button">
          Remove
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.row}>
        <input
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError('');
          }}
          onKeyDown={(e) => e.key === 'Enter' && handleApply()}
          placeholder="Enter coupon code"
          disabled={isLoading}
        />
        <button
          className={styles.applyBtn}
          onClick={handleApply}
          disabled={isLoading || !code.trim()}
          type="button"
        >
          {isLoading ? '...' : 'Apply'}
        </button>
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
