'use client';

import { useGetAdminWishlistStatsQuery, useGetMostWishlistedQuery } from '@/store/api/wishlist.api';
import styles from '../admin.module.scss';

export default function AdminWishlistPage() {
  const { data: stats, isLoading: loadingStats } = useGetAdminWishlistStatsQuery();
  const { data: topProducts = [], isLoading: loadingTop } = useGetMostWishlistedQuery(15);

  return (
    <div className={styles.page}>
      <div className={styles.dashHeader}>
        <h1 className={styles.pageTitle}>Wishlist Insights</h1>
      </div>

      {loadingStats ? (
        <p style={{ color: 'var(--color-text-muted)' }}>Loading stats…</p>
      ) : stats && (
        <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: '2rem' }}>
          {[
            { label: 'Total Saves', value: stats.totalItems, color: '#e94560' },
            { label: 'Unique Products', value: stats.uniqueProducts, color: '#58a6ff' },
            { label: 'Unique Users', value: stats.uniqueUsers, color: '#3fb950' },
          ].map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statBody}>
                <span className={styles.statValue} style={{ color: s.color }}>{s.value.toLocaleString()}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Most Wishlisted Products</h2>
          <span className={styles.tableMeta}>Top 15 by save count</span>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Product ID</th>
              <th>Save Count</th>
              <th>Bar</th>
            </tr>
          </thead>
          <tbody>
            {loadingTop && (
              <tr><td colSpan={4} className={styles.emptyCell}>Loading…</td></tr>
            )}
            {!loadingTop && topProducts.length === 0 && (
              <tr><td colSpan={4} className={styles.emptyCell}>No wishlist data yet.</td></tr>
            )}
            {!loadingTop && topProducts.map((p, i) => {
              const maxCount = topProducts[0]?.count ?? 1;
              const pct = (p.count / maxCount) * 100;
              return (
                <tr key={p.productId}>
                  <td style={{ color: 'var(--color-text-muted)', width: 36 }}>{i + 1}</td>
                  <td>
                    <code style={{ fontSize: '0.8125rem', color: 'var(--color-accent)', fontFamily: 'monospace' }}>
                      {p.productId.slice(-12)}
                    </code>
                  </td>
                  <td style={{ fontWeight: 700, color: '#e94560' }}>{p.count.toLocaleString()}</td>
                  <td style={{ width: 160 }}>
                    <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: '#e94560', borderRadius: 3 }} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
