'use client';

import { useState } from 'react';
import {
  useGetDashboardSummaryQuery,
  useGetRevenueByDayQuery,
  useGetTopProductsQuery,
} from '@/store/api/analytics.api';
import styles from './analytics.module.scss';

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data: summary } = useGetDashboardSummaryQuery();
  const { data: revenue = [] } = useGetRevenueByDayQuery(days);
  const { data: topProducts = [] } = useGetTopProductsQuery(10);

  const maxRevenue = Math.max(...revenue.map((r) => r.totalCents), 1);

  const SUMMARY_CARDS = summary
    ? [
        { label: 'Total Revenue', value: formatCents(summary.totalRevenueCents), color: '#e94560' },
        { label: 'Total Orders', value: summary.totalOrders.toLocaleString(), color: '#3b82f6' },
        { label: 'Customers', value: summary.totalCustomers.toLocaleString(), color: '#10b981' },
        { label: 'Avg Order Value', value: formatCents(summary.avgOrderValueCents), color: '#f59e0b' },
        { label: 'Pending Orders', value: summary.pendingOrders.toLocaleString(), color: '#8b5cf6' },
      ]
    : [];

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Analytics</h1>

      <div className={styles.summaryGrid}>
        {SUMMARY_CARDS.map((card) => (
          <div key={card.label} className={styles.summaryCard}>
            <span className={styles.cardLabel}>{card.label}</span>
            <span className={styles.cardValue} style={{ color: card.color }}>
              {card.value}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Revenue Over Time</h2>
          <div className={styles.periodSelect}>
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                className={`${styles.periodBtn} ${days === d ? styles.periodBtnActive : ''}`}
                onClick={() => setDays(d)}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {revenue.length === 0 ? (
          <p className={styles.empty}>No revenue data for this period.</p>
        ) : (
          <div className={styles.chartWrap}>
            {revenue.map((r) => (
              <div key={r.date} className={styles.bar}>
                <div
                  className={styles.barFill}
                  style={{ height: `${Math.max(4, (r.totalCents / maxRevenue) * 180)}px` }}
                  title={`${r.date}: ${formatCents(r.totalCents)} (${r.orderCount} orders)`}
                />
                <span className={styles.barLabel}>
                  {new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Top Selling Products</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Units Sold</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p, i) => (
              <tr key={p.productTitle}>
                <td className={styles.rank}>{i + 1}</td>
                <td className={styles.productName}>{p.productTitle}</td>
                <td>{p.totalQuantity.toLocaleString()}</td>
                <td className={styles.revenue}>{formatCents(p.totalRevenueCents)}</td>
              </tr>
            ))}
            {topProducts.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.empty}>No data available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
