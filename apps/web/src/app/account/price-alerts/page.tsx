'use client';

import Link from 'next/link';
import { useGetMyAlertsQuery, useUnsubscribePriceAlertMutation } from '@/store/api/price-alerts.api';
import { formatPrice } from '@/lib/formatters';
import styles from './price-alerts.module.scss';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
}

export default function PriceAlertsPage() {
  const { data: alerts = [], isLoading } = useGetMyAlertsQuery();
  const [unsubscribe] = useUnsubscribePriceAlertMutation();

  const handleRemove = async (productId: string) => {
    if (!confirm('Remove this price alert?')) return;
    await unsubscribe(productId);
  };

  const activeAlerts = alerts.filter((a) => a.isActive);
  const triggeredAlerts = alerts.filter((a) => a.lastTriggeredAt);

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <Link href="/account" className={styles.backLink}>← My Account</Link>
        <h1 className={styles.title}>Price Alerts</h1>
        <p className={styles.sub}>
          Get notified when products drop to your target price.
        </p>
      </div>

      {isLoading && (
        <div className={styles.loading}>
          {[...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      )}

      {!isLoading && alerts.length === 0 && (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📉</span>
          <p>You don&apos;t have any price alerts set up.</p>
          <p className={styles.emptyHint}>
            Visit any product page and click &ldquo;Set Price Alert&rdquo; to get notified when the price drops.
          </p>
          <Link href="/products" className="btn btn-primary">Browse Products</Link>
        </div>
      )}

      {!isLoading && activeAlerts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Active Alerts</h2>
            <span className={styles.badge}>{activeAlerts.length}</span>
          </div>
          <div className={styles.alertList}>
            {activeAlerts.map((alert) => (
              <div key={alert.id} className={styles.alertCard}>
                <div className={styles.alertIcon}>📉</div>
                <div className={styles.alertBody}>
                  <p className={styles.alertProductId}>
                    Product <span className={styles.mono}>{alert.productId.slice(-8).toUpperCase()}</span>
                  </p>
                  {alert.targetPriceCents ? (
                    <p className={styles.alertTarget}>
                      Alert when price drops below{' '}
                      <strong className={styles.price}>{formatPrice(alert.targetPriceCents)}</strong>
                    </p>
                  ) : (
                    <p className={styles.alertTarget}>Alert on any price drop</p>
                  )}
                  <p className={styles.alertMeta}>Set {timeAgo(alert.createdAt)}</p>
                </div>
                <div className={styles.alertActions}>
                  <Link
                    href={`/products?id=${alert.productId}`}
                    className={styles.viewBtn}
                  >
                    View Product
                  </Link>
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(alert.productId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!isLoading && triggeredAlerts.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Recently Triggered</h2>
            <span className={`${styles.badge} ${styles.badgeGreen}`}>{triggeredAlerts.length}</span>
          </div>
          <div className={styles.alertList}>
            {triggeredAlerts.map((alert) => (
              <div key={alert.id} className={`${styles.alertCard} ${styles.alertCardTriggered}`}>
                <div className={styles.alertIcon}>✅</div>
                <div className={styles.alertBody}>
                  <p className={styles.alertProductId}>
                    Product <span className={styles.mono}>{alert.productId.slice(-8).toUpperCase()}</span>
                  </p>
                  <p className={styles.alertTarget}>Price alert triggered</p>
                  <p className={styles.alertMeta}>
                    Triggered {alert.lastTriggeredAt ? timeAgo(alert.lastTriggeredAt) : ''}
                  </p>
                </div>
                <div className={styles.alertActions}>
                  <Link
                    href={`/products?id=${alert.productId}`}
                    className={styles.viewBtn}
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!isLoading && alerts.length > 0 && (
        <div className={styles.tipBox}>
          <span>💡</span>
          <p>
            Price alerts check every hour. You&apos;ll receive a notification at your registered email
            when a product reaches your target price.
          </p>
        </div>
      )}
    </div>
  );
}
