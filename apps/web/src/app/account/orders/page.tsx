'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useGetOrdersQuery } from '@/store/api/orders.api';
import styles from './orders.module.scss';

const STATUS_COLORS: Record<string, string> = {
  pending: '#d29922',
  paid: '#58a6ff',
  processing: '#8957e5',
  shipped: '#3fb950',
  delivered: '#3fb950',
  cancelled: '#e94560',
  refunded: '#8b949e',
};

const FILTER_TABS = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

function isActive(status: string) {
  return ['paid', 'processing', 'shipped'].includes(status);
}

export default function OrdersPage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const [filter, setFilter] = useState('');
  const { data: orders = [], isLoading } = useGetOrdersQuery(undefined, { skip: !user });

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user, router]);

  if (!user) return null;

  const filtered = useMemo(() => {
    if (!filter) return orders;
    if (filter === 'active') return orders.filter((o) => isActive(o.status));
    return orders.filter((o) => o.status === filter);
  }, [orders, filter]);

  const totalSpent = useMemo(
    () => orders.filter((o) => o.status !== 'cancelled' && o.status !== 'refunded').reduce((s, o) => s + o.totalCents, 0),
    [orders],
  );

  const activeCount = orders.filter((o) => isActive(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>My Orders</h1>
      </div>

      {/* Stats strip */}
      {orders.length > 0 && (
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <span className={styles.statNum}>{orders.length}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: '#f59e0b' }}>{activeCount}</span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: '#3fb950' }}>{deliveredCount}</span>
            <span className={styles.statLabel}>Delivered</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statNum} style={{ color: 'var(--color-accent)' }}>
              ${(totalSpent / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className={styles.statLabel}>Total Spent</span>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className={styles.tabs}>
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`${styles.tab} ${filter === tab.value ? styles.tabActive : ''}`}
            onClick={() => setFilter(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className={styles.empty}>
          <span>📦</span>
          <p>{filter ? `No ${filter} orders` : 'No orders yet'}</p>
          {!filter && <Link href="/products" className="btn btn--primary">Start Shopping</Link>}
          {filter && (
            <button className="btn btn--ghost btn--sm" onClick={() => setFilter('')}>
              View all orders
            </button>
          )}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <div className={styles.list}>
          {filtered.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className={styles.orderCard}>
              <div className={styles.orderMeta}>
                <span className={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</span>
                <span
                  className={styles.statusBadge}
                  style={{
                    color: STATUS_COLORS[order.status] ?? '#8b949e',
                    background: (STATUS_COLORS[order.status] ?? '#8b949e') + '20',
                  }}
                >
                  {order.status}
                </span>
              </div>
              <div className={styles.orderInfo}>
                <span className={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </span>
                <span className={styles.orderTotal}>
                  ${(order.totalCents / 100).toFixed(2)}
                </span>
              </div>
              {(order.items?.length ?? 0) > 0 && (
                <div className={styles.orderItems}>
                  {order.items?.slice(0, 2).map((item, i) => (
                    <span key={i} className={styles.orderItemName}>
                      {item.productTitle} ×{item.quantity}
                    </span>
                  ))}
                  {(order.items?.length ?? 0) > 2 && (
                    <span className={styles.moreItems}>+{order.items!.length - 2} more</span>
                  )}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
