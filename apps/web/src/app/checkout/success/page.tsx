'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useAppDispatch } from '@/store/hooks';
import { clearCart } from '@/store/slices/cart.slice';
import styles from './success.module.scss';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(clearCart());
  }, [dispatch]);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <div className={styles.icon}>✓</div>
        </div>

        <h1 className={styles.title}>Order Placed!</h1>
        <p className={styles.sub}>
          Thank you for your purchase. We'll send you a confirmation email shortly.
        </p>

        {orderId && (
          <div className={styles.orderIdBox}>
            <span className={styles.orderIdLabel}>Order ID</span>
            <span className={styles.orderId}>#{orderId.slice(-8).toUpperCase()}</span>
          </div>
        )}

        <div className={styles.steps}>
          <div className={styles.step}>
            <span className={styles.stepIcon}>📧</span>
            <div className={styles.stepText}>
              <p className={styles.stepTitle}>Confirmation email</p>
              <p className={styles.stepDesc}>We've sent a receipt to your email address.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepIcon}>⚙️</span>
            <div className={styles.stepText}>
              <p className={styles.stepTitle}>Processing</p>
              <p className={styles.stepDesc}>Your order is being prepared for shipment.</p>
            </div>
          </div>
          <div className={styles.step}>
            <span className={styles.stepIcon}>🚚</span>
            <div className={styles.stepText}>
              <p className={styles.stepTitle}>Shipping notification</p>
              <p className={styles.stepDesc}>We'll email your tracking number when it ships.</p>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          {orderId && (
            <Link href={`/account/orders/${orderId}`} className="btn btn--primary">
              View Order Details
            </Link>
          )}
          <Link href="/products" className="btn btn--outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
