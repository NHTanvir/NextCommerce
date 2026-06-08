'use client';

import { useState } from 'react';
import {
  useGetNewsletterStatsQuery,
  useGetNewsletterSubscribersQuery,
} from '@/store/api/newsletter.api';
import styles from './newsletter.module.scss';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function AdminNewsletterPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const limit = 50;

  const { data: stats } = useGetNewsletterStatsQuery();
  const { data, isLoading } = useGetNewsletterSubscribersQuery({ page, limit });

  const handleExport = () => {
    const url = `${API_BASE}/api/newsletter/export`;
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', '');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filtered = data?.data.filter((s) => {
    if (filter === 'active') return s.isActive;
    if (filter === 'inactive') return !s.isActive;
    return true;
  }) ?? [];

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.heading}>Newsletter Subscribers</h1>
          {data && (
            <p className={styles.sub}>
              {data.activeCount.toLocaleString()} active · {data.total.toLocaleString()} total
            </p>
          )}
        </div>
        <div className={styles.actions}>
          <button className="btn btn--outline btn--sm" onClick={handleExport}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats from server */}
      {stats && (
        <div className={styles.statsRow}>
          <div className={styles.statCard}>
            <span className={styles.statVal} style={{ color: '#3fb950' }}>{stats.active.toLocaleString()}</span>
            <span className={styles.statLabel}>Active Subscribers</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statVal} style={{ color: '#8b949e' }}>{stats.inactive.toLocaleString()}</span>
            <span className={styles.statLabel}>Unsubscribed</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statVal} style={{ color: '#58a6ff' }}>{stats.recentlyAdded.toLocaleString()}</span>
            <span className={styles.statLabel}>New This Week</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statVal}>
              {stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}%` : '—'}
            </span>
            <span className={styles.statLabel}>Retention Rate</span>
          </div>
        </div>
      )}

      {isLoading ? (
        <p className={styles.sub}>Loading subscribers…</p>
      ) : data && (
        <>
          {/* Filter tabs */}
          <div className={styles.filterTabs}>
            {(['all', 'active', 'inactive'] as const).map((f) => (
              <button
                key={f}
                className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'all' && ` (${data.total})`}
                {f === 'active' && ` (${data.activeCount})`}
                {f === 'inactive' && ` (${data.total - data.activeCount})`}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((sub) => (
                  <tr key={sub.id}>
                    <td className={styles.email}>{sub.email}</td>
                    <td>
                      <span className={sub.isActive ? styles.badgeActive : styles.badgeInactive}>
                        {sub.isActive ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className={styles.date}>
                      {new Date(sub.subscribedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page <= 1 || isLoading}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages || isLoading}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
