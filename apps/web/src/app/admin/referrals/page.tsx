'use client';

import { useState } from 'react';
import { useAdminGetReferralOverviewQuery, useAdminListReferralsQuery } from '@/store/api/referrals.api';
import styles from '../admin.module.scss';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  completed: '#10b981',
  paid: '#3b82f6',
};

export default function AdminReferralsPage() {
  const [page, setPage] = useState(1);

  const { data: overview } = useAdminGetReferralOverviewQuery();
  const { data: list, isLoading } = useAdminListReferralsQuery({ page, limit: 20 });

  const stats = overview
    ? [
        { label: 'Total Referrals', value: overview.totalReferrals.toLocaleString(), icon: '🔗', color: '#e94560' },
        { label: 'Completed', value: overview.completedReferrals.toLocaleString(), icon: '✅', color: '#10b981' },
        { label: 'Pending', value: overview.pendingReferrals.toLocaleString(), icon: '⏳', color: '#f59e0b' },
        { label: 'Active Codes', value: overview.totalCodes.toLocaleString(), icon: '🎫', color: '#3b82f6' },
        { label: 'Points Granted', value: overview.totalPointsGranted.toLocaleString(), icon: '⭐', color: '#8b5cf6' },
        { label: 'Conversion Rate', value: `${overview.conversionRate}%`, icon: '📈', color: '#06b6d4' },
      ]
    : [];

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Referral Program</h1>

      {/* Stats */}
      <div className={styles.statsGrid}>
        {stats.map((s) => (
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

      {/* Referrals table */}
      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>All Referrals</h2>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
            {list?.total ?? 0} total
          </span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Referrer ID</th>
              <th>Referee ID</th>
              <th>Status</th>
              <th>Points Granted</th>
              <th>Completed</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className={styles.emptyCell}>Loading…</td></tr>
            )}
            {!isLoading && list?.data.map((ref) => (
              <tr key={ref.id}>
                <td>
                  <code style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--color-accent)' }}>
                    {ref.referrerId.slice(-8).toUpperCase()}
                  </code>
                </td>
                <td>
                  <code style={{ fontSize: '0.8125rem', fontFamily: 'monospace', color: 'var(--color-text-muted)' }}>
                    {ref.refereeId.slice(-8).toUpperCase()}
                  </code>
                </td>
                <td>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '0.15rem 0.625rem',
                      borderRadius: 100,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: STATUS_COLORS[ref.status] ?? '#8b949e',
                      background: (STATUS_COLORS[ref.status] ?? '#8b949e') + '20',
                    }}
                  >
                    {ref.status}
                  </span>
                </td>
                <td style={{ fontWeight: 700 }}>
                  {ref.rewardPointsGranted != null ? `+${ref.rewardPointsGranted} pts` : '—'}
                </td>
                <td className={styles.dateCell}>
                  {ref.completedAt
                    ? new Date(ref.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—'}
                </td>
                <td className={styles.dateCell}>
                  {new Date(ref.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
              </tr>
            ))}
            {!isLoading && !list?.data.length && (
              <tr><td colSpan={6} className={styles.emptyCell}>No referrals yet.</td></tr>
            )}
          </tbody>
        </table>

        {list && list.totalPages > 1 && (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '1rem 1.25rem', borderTop: '1px solid var(--color-border)' }}>
            <button className="btn btn--ghost btn--sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>Page {page} of {list.totalPages}</span>
            <button className="btn btn--ghost btn--sm" disabled={page === list.totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
