'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useGetOrdersQuery } from '@/store/api/orders.api';
import styles from './orders.module.scss';

const STATUS_COLORS: Record<string, string> = {
  pending: 'warning',
  paid: 'info',
  processing: 'info',
  shipped: 'success',
  delivered: 'success',
  cancelled: 'accent',
  refunded: 'accent',
};

export default function OrdersPage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const { data: orders, isLoading } = useGetOrdersQuery(undefined, { skip: !user });

  useEffect(() => {
    if (!user) router.push('/auth/login');
  }, [user, router]);

  if (!user) return null;

  return (
    <div className={`container ${styles.page}`}>
      <h1 className={styles.title}>My Orders</h1>

      {isLoading && (
        <div className={styles.list}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={styles.skeletonRow} />
          ))}
        </div>
      )}

      {!isLoading && orders?.length === 0 && (
        <div className={styles.empty}>
          <span>📦</span>
          <p>No orders yet</p>
          <Link href="/products" className="btn btn--primary">Start Shopping</Link>
        </div>
      )}

      {!isLoading && orders && orders.length > 0 && (
        <div className={styles.list}>
          {orders.map((order) => (
            <Link key={order.id} href={`/account/orders/${order.id}`} className={styles.orderCard}>
              <div className={styles.orderMeta}>
                <span className={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</span>
                <span className={`badge badge--${STATUS_COLORS[order.status] ?? 'warning'}`}>
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
