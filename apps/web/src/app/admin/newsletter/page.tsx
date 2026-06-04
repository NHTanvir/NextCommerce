'use client';

import { useState } from 'react';
import { getStoredToken } from '@/lib/auth';
import styles from './newsletter.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

interface SubscribersData {
  data: Subscriber[];
  total: number;
  activeCount: number;
}

export default function AdminNewsletterPage() {
  const [data, setData] = useState<SubscribersData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const limit = 50;

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const token = getStoredToken();
      const res = await fetch(`${API_URL}/api/newsletter/subscribers?page=${p}&limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setPage(p);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const token = getStoredToken();
    const url = `${API_URL}/api/newsletter/export`;
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
          {!data ? (
            <button
              className="btn btn--primary"
              onClick={() => load(1)}
              disabled={loading}
            >
              {loading ? 'Loading…' : 'Load Subscribers'}
            </button>
          ) : (
            <button className="btn btn--outline btn--sm" onClick={handleExport}>
              Export CSV
            </button>
          )}
        </div>
      </div>

      {data && (
        <>
          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statVal}>{data.activeCount.toLocaleString()}</span>
              <span className={styles.statLabel}>Active Subscribers</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statVal}>{(data.total - data.activeCount).toLocaleString()}</span>
              <span className={styles.statLabel}>Unsubscribed</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statVal}>
                {data.total > 0
                  ? `${Math.round((data.activeCount / data.total) * 100)}%`
                  : '—'}
              </span>
              <span className={styles.statLabel}>Retention Rate</span>
            </div>
          </div>

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
                disabled={page <= 1 || loading}
                onClick={() => load(page - 1)}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages || loading}
                onClick={() => load(page + 1)}
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
