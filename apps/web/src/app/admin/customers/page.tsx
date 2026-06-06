'use client';

import Link from 'next/link';
import {
  useGetTopCustomersQuery,
  useGetCustomerSegmentsQuery,
  useGetAovTrendQuery,
} from '@/store/api/analytics.api';
import styles from './customers.module.scss';

function formatPrice(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

const SEGMENT_COLORS: Record<string, string> = {
  vip: '#ffd700',
  loyal: '#3fb950',
  regular: '#58a6ff',
  atRisk: '#f0b72f',
  lapsed: '#e94560',
};

const SEGMENT_LABELS: Record<string, string> = {
  vip: 'VIP',
  loyal: 'Loyal',
  regular: 'Regular',
  atRisk: 'At Risk',
  lapsed: 'Lapsed',
};

const SEGMENT_DESCS: Record<string, string> = {
  vip: '5+ orders & $500+ spent',
  loyal: '3+ orders, active this month',
  regular: 'Active this month',
  atRisk: 'Last order 30-90 days ago',
  lapsed: 'Last order 90-180 days ago',
};

export default function AdminCustomersPage() {
  const { data: topCustomers = [], isLoading: loadingTop } = useGetTopCustomersQuery(15);
  const { data: segments, isLoading: loadingSegs } = useGetCustomerSegmentsQuery();
  const { data: aovTrend = [] } = useGetAovTrendQuery(30);

  const maxAov = Math.max(...aovTrend.map((p) => p.avgOrderValueCents), 1);
  const totalSegmented = segments
    ? Object.values(segments).reduce((sum, v) => sum + v, 0)
    : 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Customer Intelligence</h1>
        <Link href="/admin/users" className="btn btn--ghost btn--sm">
          View All Users →
        </Link>
      </div>

      {/* Segment cards */}
      {!loadingSegs && segments && (
        <div className={styles.segmentGrid}>
          {(Object.keys(SEGMENT_LABELS) as (keyof typeof SEGMENT_LABELS)[]).map((key) => {
            const count = segments[key as keyof typeof segments];
            const pct = totalSegmented > 0 ? Math.round((count / totalSegmented) * 100) : 0;
            return (
              <div key={key} className={styles.segmentCard}>
                <div className={styles.segmentTop}>
                  <span className={styles.segmentDot} style={{ backgroundColor: SEGMENT_COLORS[key] }} />
                  <span className={styles.segmentLabel}>{SEGMENT_LABELS[key]}</span>
                </div>
                <p className={styles.segmentCount}>{count.toLocaleString()}</p>
                <div className={styles.segmentBar}>
                  <div
                    className={styles.segmentBarFill}
                    style={{ width: `${pct}%`, backgroundColor: SEGMENT_COLORS[key] }}
                  />
                </div>
                <p className={styles.segmentPct}>{pct}% of customers</p>
                <p className={styles.segmentDesc}>{SEGMENT_DESCS[key]}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* AOV Trend chart */}
      {aovTrend.length > 0 && (
        <div className={styles.chartSection}>
          <h2 className={styles.sectionTitle}>Average Order Value (Last 30 Days)</h2>
          <div className={styles.aovChart}>
            {aovTrend.map((point) => (
              <div key={point.date} className={styles.aovBar}>
                <div
                  className={styles.aovBarFill}
                  style={{ height: `${Math.round((point.avgOrderValueCents / maxAov) * 100)}%` }}
                  title={`${point.date}: ${formatPrice(point.avgOrderValueCents)}`}
                />
                <span className={styles.aovBarLabel}>
                  {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top customers table */}
      <div className={styles.tableSection}>
        <h2 className={styles.sectionTitle}>Top Customers by Spend</h2>
        {loadingTop ? (
          <div className={styles.loading}>Loading…</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Orders</th>
                  <th>Total Spent</th>
                  <th>Last Order</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((c, i) => (
                  <tr key={c.userId}>
                    <td className={styles.rank}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                    </td>
                    <td>
                      <div className={styles.customerCell}>
                        <div className={styles.avatar}>{getInitials(c.name)}</div>
                        <span className={styles.customerName}>{c.name}</span>
                      </div>
                    </td>
                    <td className={styles.email}>{c.email}</td>
                    <td className={styles.center}>{c.orderCount}</td>
                    <td className={styles.spent}>{formatPrice(c.totalSpentCents)}</td>
                    <td className={styles.muted}>{timeAgo(c.lastOrderAt)}</td>
                    <td>
                      <Link
                        href={`/admin/users/${c.userId}`}
                        className="btn btn--ghost btn--sm"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
