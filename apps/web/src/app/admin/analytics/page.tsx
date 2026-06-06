'use client';

import { useState } from 'react';
import {
  useGetDashboardSummaryQuery,
  useGetRevenueByDayQuery,
  useGetTopProductsQuery,
  useGetRepeatCustomerRateQuery,
  useGetRevenueByCatQuery,
  useGetHourlyDistributionQuery,
  useGetTopCustomersQuery,
  useGetCustomerSegmentsQuery,
  useGetAovTrendQuery,
} from '@/store/api/analytics.api';
import { useGetMostWishlistedQuery } from '@/store/api/wishlist.api';
import styles from './analytics.module.scss';

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AdminAnalyticsPage() {
  const [days, setDays] = useState(30);
  const { data: summary } = useGetDashboardSummaryQuery();
  const { data: revenue = [] } = useGetRevenueByDayQuery(days);
  const { data: topProducts = [] } = useGetTopProductsQuery(10);
  const { data: repeatRate } = useGetRepeatCustomerRateQuery();
  const { data: revByCat = [] } = useGetRevenueByCatQuery(8);
  const { data: hourly = [] } = useGetHourlyDistributionQuery();
  const { data: topCustomers = [] } = useGetTopCustomersQuery(10);
  const { data: segments } = useGetCustomerSegmentsQuery();
  const { data: aovTrend = [] } = useGetAovTrendQuery(days);
  const { data: mostWishlisted = [] } = useGetMostWishlistedQuery(10);

  const maxRevenue = Math.max(...revenue.map((r) => r.totalCents), 1);
  const maxCatRevenue = Math.max(...revByCat.map((r) => r.totalCents), 1);
  const maxHourlyOrders = Math.max(...hourly.map((h) => h.orderCount), 1);

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

      {/* Customer retention */}
      {repeatRate && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Customer Retention</h2>
          <div className={styles.retentionGrid}>
            <div className={styles.retentionCard}>
              <span className={styles.retentionVal} style={{ color: '#3fb950' }}>
                {repeatRate.repeatRate}%
              </span>
              <span className={styles.retentionLabel}>Repeat Customer Rate</span>
            </div>
            <div className={styles.retentionCard}>
              <span className={styles.retentionVal} style={{ color: '#58a6ff' }}>
                {repeatRate.repeatCustomers.toLocaleString()}
              </span>
              <span className={styles.retentionLabel}>Repeat Customers</span>
            </div>
            <div className={styles.retentionCard}>
              <span className={styles.retentionVal} style={{ color: '#8957e5' }}>
                {repeatRate.avgOrdersPerCustomer}x
              </span>
              <span className={styles.retentionLabel}>Avg Orders / Customer</span>
            </div>
            <div className={styles.retentionCard}>
              <span className={styles.retentionVal} style={{ color: '#f59e0b' }}>
                {repeatRate.totalCustomers.toLocaleString()}
              </span>
              <span className={styles.retentionLabel}>Total Ordering Customers</span>
            </div>
          </div>
        </div>
      )}

      {/* Revenue by category */}
      {revByCat.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Revenue by Category</h2>
          <div className={styles.catBars}>
            {revByCat.map((cat) => (
              <div key={cat.categoryName} className={styles.catBarRow}>
                <span className={styles.catName}>{cat.categoryName}</span>
                <div className={styles.catBarTrack}>
                  <div
                    className={styles.catBarFill}
                    style={{ width: `${(cat.totalCents / maxCatRevenue) * 100}%` }}
                  />
                </div>
                <span className={styles.catRevenue}>{formatCents(cat.totalCents)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hourly distribution */}
      {hourly.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Orders by Hour of Day</h2>
          <div className={styles.hourlyChart}>
            {Array.from({ length: 24 }, (_, h) => {
              const row = hourly.find((r) => r.hour === h);
              const height = row ? Math.max(4, (row.orderCount / maxHourlyOrders) * 120) : 4;
              return (
                <div key={h} className={styles.hourBar}>
                  <div
                    className={styles.hourBarFill}
                    style={{ height }}
                    title={row ? `${h}:00 — ${row.orderCount} orders` : `${h}:00 — no orders`}
                  />
                  {h % 4 === 0 && <span className={styles.hourLabel}>{h}h</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AOV trend */}
      {aovTrend.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Average Order Value Trend</h2>
          <div className={styles.chartWrap}>
            {(() => {
              const maxAov = Math.max(...aovTrend.map((p) => p.avgOrderValueCents), 1);
              return aovTrend.map((p) => (
                <div key={p.date} className={styles.bar}>
                  <div
                    className={styles.barFillAov}
                    style={{ height: `${Math.max(4, (p.avgOrderValueCents / maxAov) * 180)}px` }}
                    title={`${p.date}: ${formatCents(p.avgOrderValueCents)}`}
                  />
                  <span className={styles.barLabel}>
                    {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* Customer segments */}
      {segments && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Customer Segments</h2>
          <div className={styles.segmentGrid}>
            {[
              { key: 'vip', label: 'VIP', desc: '5+ orders, $500+ spend', color: '#f59e0b', icon: '👑' },
              { key: 'loyal', label: 'Loyal', desc: '3+ orders, active 30d', color: '#3fb950', icon: '⭐' },
              { key: 'regular', label: 'Regular', desc: 'Active in last 30 days', color: '#58a6ff', icon: '👤' },
              { key: 'atRisk', label: 'At Risk', desc: 'Inactive 30–90 days', color: '#f59e0b', icon: '⚠️' },
              { key: 'lapsed', label: 'Lapsed', desc: 'Inactive 90–180 days', color: '#e94560', icon: '❌' },
            ].map(({ key, label, desc, color, icon }) => (
              <div key={key} className={styles.segmentCard}>
                <span className={styles.segmentIcon}>{icon}</span>
                <span className={styles.segmentCount} style={{ color }}>
                  {(segments as any)[key] ?? 0}
                </span>
                <span className={styles.segmentLabel}>{label}</span>
                <span className={styles.segmentDesc}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top customers */}
      {topCustomers.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Top Customers</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Last Order</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((c, i) => (
                <tr key={c.userId}>
                  <td className={styles.rank}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                  </td>
                  <td>
                    <div className={styles.customerCell}>
                      <div className={styles.customerAvatar}>
                        {(c.name || c.email || '?').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className={styles.customerName}>{c.name || 'Anonymous'}</p>
                        <p className={styles.customerEmail}>{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{c.orderCount}</td>
                  <td className={styles.revenue}>{formatCents(c.totalSpentCents)}</td>
                  <td className={styles.date}>
                    {c.lastOrderAt
                      ? new Date(c.lastOrderAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Most wishlisted */}
      {mostWishlisted.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Most Wishlisted Products</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>#</th>
                <th>Product ID</th>
                <th>Wishlist Count</th>
              </tr>
            </thead>
            <tbody>
              {mostWishlisted.map((w, i) => (
                <tr key={w.productId}>
                  <td className={styles.rank}>{i + 1}</td>
                  <td className={styles.productName}>{w.productId}</td>
                  <td>♥ {w.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
