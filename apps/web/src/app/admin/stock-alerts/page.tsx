'use client';

import { useState } from 'react';
import styles from './stock-alerts.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('nc_token');
}

interface StockAlert {
  id: string;
  userId: string;
  variantId: string;
  productId: string;
  notified: boolean;
  notifiedAt: string | null;
  createdAt: string;
}

interface AlertsResponse {
  data: StockAlert[];
  total: number;
  pendingCount: number;
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export default function AdminStockAlertsPage() {
  const [data, setData] = useState<AlertsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'pending' | 'notified'>('all');
  const limit = 30;

  const load = async (p = page) => {
    setLoading(true);
    try {
      const token = getToken();
      const res = await fetch(
        `${API_URL}/back-in-stock/admin/all?page=${p}&limit=${limit}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const filtered = data
    ? data.data.filter((a) => {
        if (filter === 'pending') return !a.notified;
        if (filter === 'notified') return a.notified;
        return true;
      })
    : [];

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.heading}>Stock Alerts</h1>
          <p className={styles.sub}>Back-in-stock subscription requests from customers</p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => load(1)} disabled={loading}>
          {loading ? 'Loading…' : 'Load Alerts'}
        </button>
      </div>

      {data && (
        <div className={styles.statsRow}>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{data.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum} style={{ color: '#f59e0b' }}>{data.pendingCount}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum} style={{ color: '#3fb950' }}>{data.total - data.pendingCount}</span>
            <span className={styles.statLabel}>Notified</span>
          </div>
        </div>
      )}

      {data && (
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
      )}

      {data && filtered.length > 0 && (
        <>
          <div className={styles.tableWrap}>
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
                    <td className={styles.time}>
                      {alert.notifiedAt ? timeAgo(alert.notifiedAt) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className="btn btn--ghost btn--sm"
                disabled={page <= 1}
                onClick={() => { const p = page - 1; setPage(p); load(p); }}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button
                className="btn btn--ghost btn--sm"
                disabled={page >= totalPages}
                onClick={() => { const p = page + 1; setPage(p); load(p); }}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {data && filtered.length === 0 && (
        <p className={styles.empty}>No alerts found for this filter.</p>
      )}

      {!data && !loading && (
        <p className={styles.empty}>Click "Load Alerts" to fetch stock alert data.</p>
      )}
    </div>
  );
}
