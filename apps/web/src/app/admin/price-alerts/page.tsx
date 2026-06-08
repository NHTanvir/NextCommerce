'use client';

import { useGetAdminPriceAlertStatsQuery } from '@/store/api/price-alerts.api';
import styles from '../admin.module.scss';

export default function AdminPriceAlertsPage() {
  const { data: stats, isLoading } = useGetAdminPriceAlertStatsQuery();

  const statCards = stats
    ? [
        { label: 'Total Alerts', value: stats.total, color: '#58a6ff' },
        { label: 'Active', value: stats.active, color: '#3fb950' },
        { label: 'Triggered', value: stats.triggered, color: '#f59e0b' },
        { label: 'With Target Price', value: stats.withTarget, color: '#8957e5' },
        { label: 'Any Drop', value: stats.withoutTarget, color: '#8b949e' },
      ]
    : [];

  return (
    <div className={styles.page}>
      <div className={styles.dashHeader}>
        <h1 className={styles.pageTitle}>Price Alerts</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
          Customer subscriptions for product price drops
        </p>
      </div>

      {isLoading ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading stats…</p>
      ) : (
        <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(5,1fr)' }}>
          {statCards.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statBody}>
                <span className={styles.statValue} style={{ color: s.color }}>{s.value.toLocaleString()}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {stats && (
        <div className={styles.tableWrap} style={{ marginTop: '2rem' }}>
          <div className={styles.tableHeader}>
            <h2 className={styles.tableTitle}>Breakdown</h2>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Count</th>
                <th>Percent</th>
              </tr>
            </thead>
            <tbody>
              {[
                { label: 'Active subscriptions', value: stats.active },
                { label: 'Triggered (price dropped)', value: stats.triggered },
                { label: 'Watching specific target price', value: stats.withTarget },
                { label: 'Watching any price drop', value: stats.withoutTarget },
              ].map((row) => (
                <tr key={row.label}>
                  <td>{row.label}</td>
                  <td style={{ fontWeight: 700 }}>{row.value.toLocaleString()}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {stats.total > 0 ? `${((row.value / stats.total) * 100).toFixed(1)}%` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
