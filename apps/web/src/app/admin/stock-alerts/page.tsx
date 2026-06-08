'use client';

import { useState } from 'react';
import { useGetAdminStockAlertsQuery } from '@/store/api/back-in-stock.api';
import styles from './stock-alerts.module.scss';

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

const LIMIT = 30;

export default function AdminStockAlertsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'pending' | 'notified'>('all');

  const { data, isLoading } = useGetAdminStockAlertsQuery({ page, limit: LIMIT });

  const alerts = data?.data ?? [];
  const total = data?.total ?? 0;
  const pendingCount = data?.pendingCount ?? 0;
  const totalPages = Math.ceil(total / LIMIT);

  const filtered = alerts.filter((a) => {
    if (filter === 'pending') return !a.notified;
    if (filter === 'notified') return a.notified;
    return true;
  });

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.heading}>Stock Alerts</h1>
          <p className={styles.sub}>Back-in-stock subscription requests from customers</p>
        </div>
      </div>

      <div className={styles.statsRow}>
        <div className={styles.statBox}>
          <span className={styles.statNum}>{total}</span>
          <span className={styles.statLabel}>Total</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statNum} style={{ color: '#f59e0b' }}>{pendingCount}</span>
          <span className={styles.statLabel}>Pending</span>
        </div>
        <div className={styles.statBox}>
          <span className={styles.statNum} style={{ color: '#3fb950' }}>{total - pendingCount}</span>
          <span className={styles.statLabel}>Notified</span>
        </div>
      </div>

      <div className={styles.filters}>
        {(['all', 'pending', 'notified'] as const).map((f) => (
          <button
            key={f}
            className={`${styles.filterBtn} ${filter === f ? styles.filterBtnActive : ''}`}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className={styles.tableWrap}>
        {isLoading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</p>
        ) : filtered.length === 0 ? (
          <p className={styles.empty}>No alerts found for this filter.</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User ID</th>
                <th>Product ID</th>
                <th>Variant ID</th>
                <th>Status</th>
                <th>Requested</th>
                <th>Notified At</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => (
                <tr key={alert.id} className={styles.row}>
                  <td className={styles.mono}>{alert.userId.slice(0, 8)}…</td>
                  <td className={styles.mono}>{alert.productId.slice(0, 8)}…</td>
                  <td className={styles.mono}>{alert.variantId.slice(0, 8)}…</td>
                  <td>
                    <span
                      className={styles.statusBadge}
                      style={{
                        backgroundColor: alert.notified ? '#1b4332' : '#3d2b0a',
                        color: alert.notified ? '#3fb950' : '#f59e0b',
                        borderColor: alert.notified ? '#3fb950' : '#f59e0b',
                      }}
                    >
                      {alert.notified ? 'Notified' : 'Pending'}
                    </span>
                  </td>
                  <td className={styles.time}>{timeAgo(alert.createdAt)}</td>
                  <td className={styles.time}>{alert.notifiedAt ? timeAgo(alert.notifiedAt) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className="btn btn--ghost btn--sm"
            disabled={page <= 1 || isLoading}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <button
            className="btn btn--ghost btn--sm"
            disabled={page >= totalPages || isLoading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
