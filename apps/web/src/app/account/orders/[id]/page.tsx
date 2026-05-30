'use client';

import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { useGetOrderQuery } from '@/store/api/orders.api';
import styles from './order-detail.module.scss';

const STATUS_STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const justPlaced = searchParams.get('placed') === 'true';
  const { data: order, isLoading } = useGetOrderQuery(id);

  if (isLoading) {
    return (
      <div className={`container ${styles.page}`}>
        <div className={styles.skeleton} style={{ height: 300, borderRadius: 12 }} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className={`container ${styles.page}`}>
        <h1>Order not found</h1>
        <Link href="/account/orders" className="btn btn--outline">← Back to Orders</Link>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className={`container ${styles.page}`}>
      {justPlaced && (
        <div className={styles.successBanner}>
          <span>✓</span> Order placed successfully! You&apos;ll receive a confirmation email shortly.
        </div>
      )}

      <div className={styles.header}>
        <div>
          <Link href="/account/orders" className={styles.backLink}>← My Orders</Link>
          <h1 className={styles.title}>Order #{id.slice(-8).toUpperCase()}</h1>
          <p className={styles.date}>
            Placed {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className={styles.totalBadge}>${(order.totalCents / 100).toFixed(2)}</div>
      </div>

      {/* Progress */}
      {order.status !== 'cancelled' && order.status !== 'refunded' && (
        <div className={styles.progress}>
          {STATUS_STEPS.map((step, i) => (
            <div
              key={step}
              className={`${styles.progressStep} ${i <= currentStep ? styles.done : ''} ${i === currentStep ? styles.current : ''}`}
            >
              <div className={styles.progressDot} />
              <span className={styles.progressLabel}>{step}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.layout}>
        {/* Items */}
        <div className={styles.itemsSection}>
          <h2 className={styles.sectionTitle}>Items</h2>
          <div className={styles.items}>
            {order.items?.map((item, i) => (
              <div key={i} className={styles.item}>
                <div className={styles.itemIcon}>👟</div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemTitle}>{item.productTitle}</p>
                  <p className={styles.itemMeta}>Size {item.size} · {item.color}</p>
                </div>
                <div className={styles.itemRight}>
                  <span className={styles.itemQty}>×{item.quantity}</span>
                  <span className={styles.itemPrice}>${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Address */}
        {order.address && (
          <div className={styles.addressSection}>
            <h2 className={styles.sectionTitle}>Shipping To</h2>
            <div className={styles.addressCard}>
              <p>{order.address.line1}</p>
              {order.address.line2 && <p>{order.address.line2}</p>}
              <p>{order.address.city}, {order.address.postalCode}</p>
              <p>{order.address.country}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
