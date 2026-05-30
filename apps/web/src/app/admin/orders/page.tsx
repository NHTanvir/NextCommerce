'use client';

import { useGetOrdersQuery, useUpdateOrderStatusMutation } from '@/store/api/orders.api';
import type { OrderStatus } from '@nextcommerce/shared';
import { ORDER_STATUS_TRANSITIONS } from '@nextcommerce/shared';
import styles from '../admin.module.scss';

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useGetOrdersQuery();
  const [updateStatus] = useUpdateOrderStatusMutation();

  async function handleStatusChange(id: string, status: string) {
    await updateStatus({ id, status: status as OrderStatus });
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Orders</h1>

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Loading…</td></tr>
            )}
            {orders?.map((order) => {
              const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
              return (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
                    #{order.id.slice(-8).toUpperCase()}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ color: 'var(--color-text-muted)' }}>
                    {order.items?.length ?? 0} item(s)
                  </td>
                  <td style={{ fontWeight: 700 }}>${(order.totalCents / 100).toFixed(2)}</td>
                  <td>
                    <span className={`badge badge--${order.status === 'delivered' ? 'success' : order.status === 'cancelled' ? 'accent' : 'warning'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    {nextStatuses.length > 0 ? (
                      <select
                        defaultValue=""
                        onChange={(e) => e.target.value && handleStatusChange(order.id, e.target.value)}
                        style={{
                          background: 'var(--color-bg-card)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          color: 'var(--color-text)',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.8125rem',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="">→ Move to</option>
                        {nextStatuses.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8125rem' }}>—</span>
                    )}
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
