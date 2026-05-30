'use client';

import Link from 'next/link';
import { useGetOrdersQuery } from '@/store/api/orders.api';
import { useGetProductsQuery } from '@/store/api/catalog.api';
import styles from './admin.module.scss';

export default function AdminDashboard() {
  const { data: orders } = useGetOrdersQuery();
  const { data: products } = useGetProductsQuery({});

  const revenue = orders?.reduce((sum, o) => sum + o.totalCents, 0) ?? 0;
  const pendingOrders = orders?.filter((o) => o.status === 'pending').length ?? 0;

  const STATS = [
    { label: 'Total Revenue', value: `$${(revenue / 100).toFixed(0)}`, change: '+12.4%' },
    { label: 'Total Orders', value: String(orders?.length ?? 0), change: '+8.1%' },
    { label: 'Products', value: String(products?.total ?? 0), change: '+2.3%' },
    { label: 'Pending Orders', value: String(pendingOrders), change: '' },
  ];

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Dashboard</h1>

      <div className={styles.statsGrid}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statValue}>{s.value}</span>
            {s.change && <span className={styles.statChange}>{s.change} this month</span>}
          </div>
        ))}
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Recent Orders</h2>
          <Link href="/admin/orders" className="btn btn--ghost btn--sm">View all →</Link>
        </div>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {orders?.slice(0, 8).map((order) => (
              <tr key={order.id}>
                <td>
                  <Link href={`/admin/orders`} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    #{order.id.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <span className={`badge badge--${order.status === 'delivered' ? 'success' : order.status === 'shipped' ? 'success' : 'warning'}`}>
                    {order.status}
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>${(order.totalCents / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
