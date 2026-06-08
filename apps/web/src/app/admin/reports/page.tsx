'use client';

import { useState } from 'react';
import {
  useGetOrderStatusBreakdownQuery,
  useGetNewCustomersByDayQuery,
} from '@/store/api/analytics.api';
import styles from './reports.module.scss';

const STATUS_COLORS: Record<string, string> = {
  delivered: '#3fb950',
  shipped: '#58a6ff',
  paid: '#8957e5',
  processing: '#f59e0b',
  pending: '#d29922',
  cancelled: '#e94560',
  refunded: '#8b949e',
};

function formatCents(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

export default function AdminReportsPage() {
  const [days, setDays] = useState(30);

  const { data: statusData = [], isLoading: loadingStatus } = useGetOrderStatusBreakdownQuery();
  const { data: customerData = [], isLoading: loadingCustomers } = useGetNewCustomersByDayQuery(days);

  const loading = loadingStatus || loadingCustomers;
  const totalOrders = statusData.reduce((s, r) => s + r.count, 0);
  const totalRevenue = statusData.reduce((s, r) => s + r.totalCents, 0);
  const maxCustomers = Math.max(...customerData.map((r) => r.newCustomers), 1);
  const totalNewCustomers = customerData.reduce((s, r) => s + r.newCustomers, 0);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Reports</h1>
        <div className={styles.controls}>
          <select
            className={styles.select}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className={styles.empty}>
          <p>Loading report data…</p>
        </div>
      )}

      {!loading && (
        <div className={styles.sections}>
          {/* Order Status Breakdown */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Order Status Breakdown</h2>
              <span className={styles.sectionMeta}>{totalOrders.toLocaleString()} total orders</span>
            </div>
            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Orders</th>
                    <th>% of Total</th>
                    <th>Revenue</th>
                    <th>Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {statusData.map((row) => (
                    <tr key={row.status}>
                      <td>
                        <span
                          className={styles.statusDot}
                          style={{ background: STATUS_COLORS[row.status] ?? '#8b949e' }}
                        />
                        {row.status}
                      </td>
                      <td className={styles.numCell}>{row.count.toLocaleString()}</td>
                      <td className={styles.numCell}>
                        {totalOrders > 0 ? ((row.count / totalOrders) * 100).toFixed(1) : 0}%
                      </td>
                      <td className={styles.numCell}>{formatCents(row.totalCents)}</td>
                      <td className={styles.barCell}>
                        <div className={styles.miniBar}>
                          <div
                            className={styles.miniBarFill}
                            style={{
                              width: `${totalOrders > 0 ? (row.count / totalOrders) * 100 : 0}%`,
                              background: STATUS_COLORS[row.status] ?? '#8b949e',
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td><strong>Total</strong></td>
                    <td className={styles.numCell}><strong>{totalOrders.toLocaleString()}</strong></td>
                    <td className={styles.numCell}>100%</td>
                    <td className={styles.numCell}><strong>{formatCents(totalRevenue)}</strong></td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* New Customers Chart */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>New Customers (Last {days} Days)</h2>
              <span className={styles.sectionMeta}>{totalNewCustomers.toLocaleString()} total</span>
            </div>
            {customerData.length === 0 ? (
              <div className={styles.noData}>No registration data for this period.</div>
            ) : (
              <div className={styles.chartCard}>
                <div className={styles.barChart}>
                  {customerData.map((row) => (
                    <div key={row.date} className={styles.barGroup}>
                      <div
                        className={styles.chartBar}
                        style={{ height: `${(row.newCustomers / maxCustomers) * 100}%` }}
                        title={`${row.date}: ${row.newCustomers} new customers`}
                      />
                      <span className={styles.barLabel}>
                        {new Date(row.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
