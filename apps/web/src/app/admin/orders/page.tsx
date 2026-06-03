'use client';

import { useState } from 'react';
import {
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
  useBulkFulfillOrdersMutation,
} from '@/store/api/orders.api';
import type { OrderStatus } from '@nextcommerce/shared';
import { ORDER_STATUS_TRANSITIONS } from '@nextcommerce/shared';
import styles from './orders.module.scss';

const STATUS_COLORS: Record<string, string> = {
  pending: '#d29922',
  paid: '#58a6ff',
  processing: '#8957e5',
  fulfilled: '#3fb950',
  shipped: '#3fb950',
  delivered: '#3fb950',
  cancelled: '#e94560',
  refunded: '#e94560',
};

interface TrackingModalProps {
  orderId: string;
  currentStatus: OrderStatus;
  onClose: () => void;
  onSave: (status: OrderStatus, tracking?: string, carrier?: string) => void;
}

function TrackingModal({ orderId, currentStatus, onClose, onSave }: TrackingModalProps) {
  const nextStatuses = ORDER_STATUS_TRANSITIONS[currentStatus] ?? [];
  const [status, setStatus] = useState<OrderStatus>(nextStatuses[0] ?? currentStatus);
  const [tracking, setTracking] = useState('');
  const [carrier, setCarrier] = useState('');

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Update Order #{orderId.slice(-8).toUpperCase()}</h3>
        <div className={styles.field}>
          <label className={styles.label}>New Status</label>
          <select
            className={styles.select}
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
          >
            {nextStatuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {status === 'shipped' && (
          <>
            <div className={styles.field}>
              <label className={styles.label}>Carrier</label>
              <select
                className={styles.select}
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
              >
                <option value="">Select carrier</option>
                {['UPS', 'FedEx', 'USPS', 'DHL', 'OnTrac'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Tracking Number</label>
              <input
                className={styles.input}
                placeholder="e.g. 1Z999AA10123456784"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
              />
            </div>
          </>
        )}
        <div className={styles.modalActions}>
          <button className="btn btn--outline" onClick={onClose}>Cancel</button>
          <button
            className="btn btn--primary"
            onClick={() => onSave(status, tracking || undefined, carrier || undefined)}
          >
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const limit = 25;
  const { data, isLoading, isFetching } = useGetAdminOrdersQuery({ page, limit });
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [bulkFulfill, { isLoading: bulking }] = useBulkFulfillOrdersMutation();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);

  const orders = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === orders.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(orders.map((o) => o.id)));
    }
  };

  const handleBulkShip = async () => {
    if (selected.size === 0) return;
    await bulkFulfill({ orderIds: [...selected], status: 'shipped' });
    setSelected(new Set());
  };

  const handleSaveModal = async (status: OrderStatus, tracking?: string, carrier?: string) => {
    if (!editingId) return;
    await updateStatus({ id: editingId, status, trackingNumber: tracking, carrier });
    setEditingId(null);
  };

  const editingOrder = editingId ? orders.find((o) => o.id === editingId) : null;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.heading}>Orders</h1>
          <p className={styles.sub}>{total} total orders</p>
        </div>
        {selected.size > 0 && (
          <div className={styles.bulkBar}>
            <span className={styles.bulkCount}>{selected.size} selected</span>
            <button
              className="btn btn--primary btn--sm"
              onClick={handleBulkShip}
              disabled={bulking}
            >
              {bulking ? 'Marking…' : 'Mark as Shipped'}
            </button>
            <button className="btn btn--ghost btn--sm" onClick={() => setSelected(new Set())}>
              Clear
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading orders…</div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={selected.size === orders.length && orders.length > 0}
                      onChange={toggleAll}
                    />
                  </th>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Tracking</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className={isFetching ? styles.fading : ''}>
                {orders.map((order) => {
                  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
                  const color = STATUS_COLORS[order.status] ?? '#8b949e';
                  return (
                    <tr key={order.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selected.has(order.id)}
                          onChange={() => toggleSelect(order.id)}
                        />
                      </td>
                      <td className={styles.mono}>#{order.id.slice(-8).toUpperCase()}</td>
                      <td className={styles.date}>
                        {new Date(order.createdAt ?? order.placedAt ?? Date.now()).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className={styles.muted}>{order.items?.length ?? 0} item(s)</td>
                      <td className={styles.amount}>${(order.totalCents / 100).toFixed(2)}</td>
                      <td>
                        <span
                          className={styles.statusBadge}
                          style={{ color, borderColor: color, background: `${color}18` }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className={styles.mono} style={{ fontSize: '0.75rem' }}>
                        {(order as any).trackingNumber ?? '—'}
                      </td>
                      <td>
                        {nextStatuses.length > 0 ? (
                          <button
                            className={styles.editBtn}
                            onClick={() => setEditingId(order.id)}
                          >
                            Update
                          </button>
                        ) : (
                          <span className={styles.muted}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {editingOrder && (
        <TrackingModal
          orderId={editingOrder.id}
          currentStatus={editingOrder.status}
          onClose={() => setEditingId(null)}
          onSave={handleSaveModal}
        />
      )}
    </div>
  );
}
