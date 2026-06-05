'use client';

import Link from 'next/link';
import { useGetDashboardSummaryQuery } from '@/store/api/analytics.api';
import { useGetOrdersQuery } from '@/store/api/orders.api';
import { useGetProductsQuery } from '@/store/api/catalog.api';
import styles from './admin.module.scss';

const STATUS_COLORS: Record<string, string> = {
  delivered: '#3fb950',
  shipped: '#58a6ff',
  paid: '#8957e5',
  processing: '#f59e0b',
  pending: '#d29922',
  cancelled: '#e94560',
  refunded: '#8b949e',
};

const QUICK_LINKS = [
  { href: '/admin/products', icon: '👟', label: 'Products' },
  { href: '/admin/orders', icon: '📦', label: 'Orders' },
  { href: '/admin/inventory', icon: '📋', label: 'Inventory' },
  { href: '/admin/coupons', icon: '🎟️', label: 'Coupons' },
  { href: '/admin/promotions', icon: '🏷️', label: 'Promotions' },
  { href: '/admin/analytics', icon: '📈', label: 'Analytics' },
  { href: '/admin/reports', icon: '📊', label: 'Reports' },
  { href: '/admin/reviews', icon: '⭐', label: 'Reviews' },
  { href: '/admin/users', icon: '👥', label: 'Users' },
  { href: '/admin/audit', icon: '🔍', label: 'Audit Log' },
];

function formatCents(cents: number) {
  if (cents >= 100000000) return `$${(cents / 10000000).toFixed(1)}M`;
  if (cents >= 1000000) return `$${(cents / 100000).toFixed(1)}K`;
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

export default function AdminDashboard() {
  const { data: summary } = useGetDashboardSummaryQuery();
  const { data: orders } = useGetOrdersQuery();
  const { data: products } = useGetProductsQuery({});

  const STATS = summary
    ? [
        { label: 'Total Revenue', value: formatCents(summary.totalRevenueCents), icon: '💰', color: '#e94560' },
        { label: 'Total Orders', value: summary.totalOrders.toLocaleString(), icon: '📦', color: '#3b82f6' },
        { label: 'Customers', value: summary.totalCustomers.toLocaleString(), icon: '👥', color: '#10b981' },
        { label: 'Avg Order Value', value: formatCents(summary.avgOrderValueCents), icon: '🛒', color: '#f59e0b' },
        { label: 'Pending Orders', value: summary.pendingOrders.toLocaleString(), icon: '⏳', color: '#8b5cf6' },
        { label: 'Active Products', value: String(products?.total ?? '—'), icon: '🏷️', color: '#06b6d4' },
      ]
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.dashHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <span className={styles.dashDate}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* Stats grid */}
      <div className={styles.statsGrid}>
        {STATS.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <div className={styles.statIconWrap} style={{ color: s.color, background: s.color + '18' }}>
              {s.icon}
            </div>
            <div className={styles.statBody}>
              <span className={styles.statValue} style={{ color: s.color }}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Access</h2>
        <div className={styles.quickGrid}>
          {QUICK_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={styles.quickLink}>
              <span className={styles.quickIcon}>{link.icon}</span>
              <span className={styles.quickLabel}>{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <Link href="/admin/orders" className="btn btn--ghost btn--sm">View all →</Link>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders?.slice(0, 10).map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`} className={styles.orderId}>
                      #{order.id.slice(-8).toUpperCase()}
                    </Link>
                  </td>
                  <td className={styles.dateCell}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric',
                    })}
                  </td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        color: STATUS_COLORS[order.status] ?? '#8b949e',
                        background: (STATUS_COLORS[order.status] ?? '#8b949e') + '20',
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className={styles.totalCell}>${(order.totalCents / 100).toFixed(2)}</td>
                </tr>
              ))}
              {(!orders || orders.length === 0) && (
                <tr>
                  <td colSpan={4} className={styles.emptyCell}>No orders yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
