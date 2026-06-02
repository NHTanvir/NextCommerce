'use client';

import { useState } from 'react';
import {
  useGetAdminReturnsQuery,
  useUpdateReturnStatusMutation,
} from '@/store/api/returns.api';
import styles from './returns.module.scss';

const STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'completed'] as const;
type ReturnStatus = (typeof STATUS_OPTIONS)[number];

const STATUS_BADGE: Record<ReturnStatus, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  completed: 'success',
};

const REASON_LABELS: Record<string, string> = {
  defective: 'Defective / Damaged',
  wrong_item: 'Wrong Item Received',
  not_as_described: 'Not as Described',
  changed_mind: 'Changed My Mind',
  other: 'Other',
};

export default function AdminReturnsPage() {
  const [filterStatus, setFilterStatus] = useState<ReturnStatus | ''>('');
  const { data: returns = [], isLoading, refetch } = useGetAdminReturnsQuery({ status: filterStatus || undefined });
  const [updateStatus] = useUpdateReturnStatusMutation();
  const [editing, setEditing] = useState<{ id: string; status: ReturnStatus; adminNotes: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await updateStatus({ id: editing.id, status: editing.status, adminNotes: editing.adminNotes }).unwrap();
      setMsg('Return updated successfully.');
      setEditing(null);
      refetch();
    } catch {
      setMsg('Failed to update return.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Return Requests</h1>
        <div className={styles.filters}>
          <select
            className={styles.filterSelect}
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ReturnStatus | '')}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {msg && <p className={styles.msg}>{msg}</p>}

      {editing && (
        <div className={styles.editModal}>
          <div className={styles.editCard}>
            <h3 className={styles.editTitle}>Update Return #{editing.id.slice(-8).toUpperCase()}</h3>
            <div className={styles.editField}>
              <label>Status</label>
              <select
                className={styles.editSelect}
                value={editing.status}
                onChange={(e) => setEditing({ ...editing, status: e.target.value as ReturnStatus })}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div className={styles.editField}>
              <label>Admin Notes</label>
              <textarea
                className={styles.editTextarea}
                value={editing.adminNotes}
                onChange={(e) => setEditing({ ...editing, adminNotes: e.target.value })}
                rows={3}
                placeholder="Notes visible to the customer…"
              />
            </div>
            <div className={styles.editActions}>
              <button className="btn btn--ghost btn--sm" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn btn--primary btn--sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className={styles.loading}>Loading returns…</div>
      ) : returns.length === 0 ? (
        <div className={styles.empty}>No return requests found.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Return ID</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {returns.map((r) => (
                <tr key={r.id}>
                  <td className={styles.mono}>{r.id.slice(-8).toUpperCase()}</td>
                  <td className={styles.mono}>{r.orderId.slice(-8).toUpperCase()}</td>
                  <td>{r.userId}</td>
                  <td>{REASON_LABELS[r.reason] ?? r.reason}</td>
                  <td>
                    <span className={`badge badge--${STATUS_BADGE[r.status as ReturnStatus] ?? 'default'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className={styles.date}>
                    {new Date(r.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                  <td>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => setEditing({ id: r.id, status: r.status as ReturnStatus, adminNotes: r.adminNotes ?? '' })}
                    >
                      Review
                    </button>
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
