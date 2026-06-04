'use client';

import { useAppSelector } from '@/store/hooks';
import {
  useGetVariantSubscriptionStatusQuery,
  useSubscribeBackInStockMutation,
  useUnsubscribeBackInStockMutation,
} from '@/store/api/back-in-stock.api';
import styles from './BackInStockButton.module.scss';

interface Props {
  variantId: string;
  productId: string;
}

export function BackInStockButton({ variantId, productId }: Props) {
  const user = useAppSelector((s) => s.auth.user);

  const { data: status, isLoading } = useGetVariantSubscriptionStatusQuery(variantId, {
    skip: !user,
  });

  const [subscribe, { isLoading: subscribing }] = useSubscribeBackInStockMutation();
  const [unsubscribe, { isLoading: unsubscribing }] = useUnsubscribeBackInStockMutation();

  if (!user) {
    return (
      <p className={styles.loginPrompt}>
        <a href="/auth/login">Sign in</a> to get notified when this item is back in stock.
      </p>
    );
  }

  if (isLoading) return null;

  const subscribed = status?.subscribed ?? false;

  if (subscribed) {
    return (
      <div className={styles.wrap}>
        <div className={styles.activeState}>
          <span className={styles.bellIcon}>🔔</span>
          <span className={styles.activeText}>You'll be notified when it's back!</span>
        </div>
        <button
          className={styles.removeBtn}
          onClick={() => unsubscribe(variantId)}
          disabled={unsubscribing}
        >
          Remove alert
        </button>
      </div>
    );
  }

  return (
    <button
      className={styles.notifyBtn}
      onClick={() => subscribe({ variantId, productId })}
      disabled={subscribing}
    >
      <span>🔔</span>
      {subscribing ? 'Setting up alert…' : 'Notify Me When Available'}
    </button>
  );
}
