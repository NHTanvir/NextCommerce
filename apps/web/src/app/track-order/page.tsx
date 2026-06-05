'use client';

import { useState } from 'react';
import styles from './track-order.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface OrderTracking {
  id: string;
  status: string;
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  placedAt: string;
  totalCents: number;
  items: Array<{ productTitle: string; quantity: number }>;
  events?: Array<{ status: string; timestamp: string; location?: string }>;
}

const STATUS_STEPS = ['pending', 'paid', 'processing', 'shipped', 'delivered'];

const STATUS_COLORS: Record<string, string> = {
  pending:   '#f59e0b',
  paid:      '#58a6ff',
  processing:'#8957e5',
  shipped:   '#06b6d4',
  delivered: '#3fb950',
  cancelled: '#e94560',
  refunded:  '#6b7280',
};

const STATUS_ICONS: Record<string, string> = {
  pending:    '🕐',
  paid:       '💳',
  processing: '⚙️',
  shipped:    '🚚',
  delivered:  '✅',
  cancelled:  '❌',
  refunded:   '↩️',
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderTracking | null>(null);
  const [error, setError] = useState('');

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`${API_URL}/orders/${orderId.trim()}/public`, {
        headers: email ? { 'x-order-email': email } : {},
      });
      if (!res.ok) {
        if (res.status === 404) {
          setError('Order not found. Please check your order ID and try again.');
        } else {
          setError('Unable to retrieve order. Please try again later.');
        }
        return;
      }
      const data = await res.json();
      setOrder(data);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const statusIdx = order ? STATUS_STEPS.indexOf(order.status) : -1;

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Track Your Order</h1>
        <p className={styles.sub}>Enter your order ID to check the status of your delivery.</p>
      </div>

      <div className={styles.formCard}>
        <form className={styles.form} onSubmit={handleTrack}>
          <div className={styles.field}>
            <label className={styles.label}>Order ID</label>
            <input
              type="text"
              className={styles.input}
              placeholder="e.g. abc12345-1234-..."
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              required
              autoComplete="off"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email (optional)</label>
            <input
              type="email"
              className={styles.input}
              placeholder="Order confirmation email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="btn btn--primary"
            disabled={loading || !orderId.trim()}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {loading ? 'Searching…' : 'Track Order'}
          </button>
        </form>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {order && (
        <div className={styles.result}>
          {/* Header */}
          <div className={styles.resultHeader}>
            <div>
              <p className={styles.orderId}>Order #{order.id.slice(-8).toUpperCase()}</p>
              <p className={styles.orderDate}>
                Placed on {new Date(order.placedAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
            </div>
            <div
              className={styles.statusBadge}
              style={{
                backgroundColor: `${STATUS_COLORS[order.status]}22`,
                color: STATUS_COLORS[order.status],
                borderColor: STATUS_COLORS[order.status],
              }}
            >
              {STATUS_ICONS[order.status]} {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>

          {/* Progress tracker */}
          {statusIdx >= 0 && (
            <div className={styles.tracker}>
              {STATUS_STEPS.map((step, i) => (
                <div key={step} className={styles.trackerStep}>
                  <div className={styles.trackerStepTop}>
                    <div
                      className={`${styles.trackerDot} ${i <= statusIdx ? styles.trackerDotActive : ''}`}
                    >
                      {i <= statusIdx && '✓'}
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={`${styles.trackerLine} ${i < statusIdx ? styles.trackerLineActive : ''}`}
                      />
                    )}
                  </div>
                  <p className={`${styles.trackerLabel} ${i <= statusIdx ? styles.trackerLabelActive : ''}`}>
                    {step.charAt(0).toUpperCase() + step.slice(1)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tracking info */}
          {(order.carrier || order.trackingNumber) && (
            <div className={styles.trackingCard}>
              <p className={styles.trackingTitle}>Shipping Details</p>
              {order.carrier && (
                <div className={styles.trackingRow}>
                  <span className={styles.trackingKey}>Carrier</span>
                  <span className={styles.trackingValue}>{order.carrier}</span>
                </div>
              )}
              {order.trackingNumber && (
                <div className={styles.trackingRow}>
                  <span className={styles.trackingKey}>Tracking #</span>
                  <span className={styles.trackingMono}>{order.trackingNumber}</span>
                </div>
              )}
              {order.estimatedDelivery && (
                <div className={styles.trackingRow}>
                  <span className={styles.trackingKey}>Est. Delivery</span>
                  <span className={styles.trackingValue}>
                    {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                      weekday: 'short', month: 'short', day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Items */}
          {order.items?.length > 0 && (
            <div className={styles.items}>
              <p className={styles.itemsTitle}>Items in this Order</p>
              {order.items.map((item, i) => (
                <div key={i} className={styles.item}>
                  <span className={styles.itemName}>{item.productTitle}</span>
                  <span className={styles.itemQty}>×{item.quantity}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
