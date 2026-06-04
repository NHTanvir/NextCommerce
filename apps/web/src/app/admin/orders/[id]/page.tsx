'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
} from '@/store/api/orders.api';
import type { OrderStatus } from '@nextcommerce/shared';
import { ORDER_STATUS_TRANSITIONS } from '@nextcommerce/shared';
import styles from './order-detail-admin.module.scss';

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

const CARRIERS = ['UPS', 'FedEx', 'USPS', 'DHL', 'OnTrac'];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: order, isLoading } = useGetOrderQuery(id);
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation();

  const [newStatus, setNewStatus] = useState<OrderStatus | ''>('');
  const [tracking, setTracking] = useState('');
  const [carrier, setCarrier] = useState('');
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!order) {
    return (
      <div className={styles.page}>
        <h2>Order not found</h2>
        <Link href="/admin/orders" className="btn btn--outline">← Back</Link>
      </div>
    );
  }

  const nextStatuses = ORDER_STATUS_TRANSITIONS[order.status] ?? [];
  const statusColor = STATUS_COLORS[order.status] ?? '#8b949e';

  const handleUpdate = async () => {
    if (!newStatus) return;
    setUpdateError('');
    setUpdateSuccess(false);
    try {
      await updateStatus({
        id: order.id,
        status: newStatus,
        trackingNumber: tracking || undefined,
        carrier: carrier || undefined,
      }).unwrap();
      setUpdateSuccess(true);
      setNewStatus('');
      setTracking('');
      setCarrier('');
    } catch (err: any) {
      setUpdateError(err?.data?.message ?? 'Failed to update status');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link href="/admin/orders" className={styles.backLink}>← Orders</Link>
        <h1 className={styles.heading}>
          Order <span className={styles.mono}>#{id.slice(-8).toUpperCase()}</span>
        </h1>
        <span
          className={styles.statusBadge}
          style={{ color: statusColor, borderColor: statusColor, background: `${statusColor}18` }}
        >
          {order.status}
        </span>
      </div>

      <div className={styles.grid}>
        {/* Left column */}
        <div className={styles.leftCol}>
          {/* Order items */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Items ({order.items?.length ?? 0})</h2>
            <div className={styles.itemList}>
              {order.items?.map((item, i) => (
                <div key={i} className={styles.item}>
                  <div className={styles.itemIcon}>📦</div>
                  <div className={styles.itemBody}>
                    <p className={styles.itemName}>{item.productTitle}</p>
                    <p className={styles.itemMeta}>
                      Size {item.size} · {item.color} · ×{item.quantity}
                    </p>
                  </div>
                  <div className={styles.itemPrice}>
                    ${((item.unitPriceCents * item.quantity) / 100).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.totalRow}>
              <span>Order Total</span>
              <strong>${(order.totalCents / 100).toFixed(2)}</strong>
            </div>
          </section>

          {/* Tracking info */}
          {(order as any).trackingNumber && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Tracking</h2>
              <div className={styles.trackingGrid}>
                <div>
                  <p className={styles.trackingLabel}>Carrier</p>
                  <p className={styles.trackingValue}>{(order as any).carrier ?? '—'}</p>
                </div>
                <div>
                  <p className={styles.trackingLabel}>Tracking Number</p>
                  <p className={styles.trackingValue}>{(order as any).trackingNumber}</p>
                </div>
              </div>
            </section>
          )}

          {/* Update status */}
          {nextStatuses.length > 0 && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Update Status</h2>
              {updateSuccess && (
                <div className={styles.successBox}>Status updated successfully.</div>
              )}
              {updateError && <div className={styles.errorBox}>{updateError}</div>}
              <div className={styles.updateForm}>
                <div className={styles.field}>
                  <label className={styles.label}>New Status</label>
                  <select
                    className={styles.select}
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                  >
                    <option value="">Select…</option>
                    {nextStatuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                {newStatus === 'shipped' && (
                  <>
                    <div className={styles.field}>
                      <label className={styles.label}>Carrier</label>
                      <select
                        className={styles.select}
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                      >
                        <option value="">Select carrier</option>
                        {CARRIERS.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Tracking Number</label>
                      <input
                        className={styles.input}
                        value={tracking}
                        onChange={(e) => setTracking(e.target.value)}
                        placeholder="1Z999AA10123456784"
                      />
                    </div>
                  </>
                )}

                <button
                  className="btn btn--primary"
                  onClick={handleUpdate}
                  disabled={!newStatus || updating}
                >
                  {updating ? 'Updating…' : 'Apply Update'}
                </button>
              </div>
            </section>
          )}
        </div>

        {/* Right column */}
        <div className={styles.rightCol}>
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Customer</h2>
            <p className={styles.infoRow}>
              <span className={styles.infoKey}>User ID</span>
              <span className={styles.mono} style={{ fontSize: '0.75rem' }}>{order.userId}</span>
            </p>
            <p className={styles.infoRow}>
              <span className={styles.infoKey}>Placed At</span>
              <span>
                {new Date((order as any).placedAt ?? (order as any).createdAt).toLocaleString('en-US', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </p>
            <p className={styles.infoRow}>
              <span className={styles.infoKey}>Payment Ref</span>
              <span className={styles.mono} style={{ fontSize: '0.75rem' }}>
                {(order as any).paymentRef ?? 'mocked'}
              </span>
            </p>
          </section>

          {order.address && (
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Ship To</h2>
              <address className={styles.address}>
                <p>{order.address.line1}</p>
                {(order.address as any).line2 && <p>{(order.address as any).line2}</p>}
                <p>
                  {order.address.city}, {(order.address as any).postalCode}
                </p>
                <p>{order.address.country}</p>
              </address>
            </section>
          )}

          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Actions</h2>
            <div className={styles.actionList}>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/api/orders/admin/export?status=${order.status}`}
                className="btn btn--outline btn--sm"
                style={{ width: '100%', textAlign: 'center' }}
              >
                Export Status CSV
              </a>
              <Link
                href="/admin/orders"
                className="btn btn--ghost btn--sm"
                style={{ width: '100%', textAlign: 'center' }}
              >
                ← All Orders
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
