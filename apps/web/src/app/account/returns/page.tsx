'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetMyReturnsQuery, useCreateReturnMutation, type ReturnReason } from '@/store/api/returns.api';
import styles from './returns.module.scss';

const REASON_LABELS: Record<ReturnReason, string> = {
  defective: 'Defective / Damaged',
  wrong_item: 'Wrong Item Received',
  not_as_described: 'Not as Described',
  changed_mind: 'Changed My Mind',
  other: 'Other',
};

const STATUS_BADGE: Record<string, string> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  completed: 'success',
};

export default function ReturnsPage() {
  const { data: returns = [], isLoading } = useGetMyReturnsQuery();
  const [createReturn, { isLoading: submitting }] = useCreateReturnMutation();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ orderId: '', reason: 'defective' as ReturnReason, notes: '' });
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.orderId.trim()) return;
    try {
      await createReturn({ ...formData, notes: formData.notes || undefined }).unwrap();
      setShowForm(false);
      setMsg('Return request submitted successfully.');
      setFormData({ orderId: '', reason: 'defective', notes: '' });
    } catch {
      setMsg('Failed to submit return. Check the order ID and try again.');
    }
  };

  if (isLoading) return <div className={styles.loading}>Loading returns…</div>;

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>Returns</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'New Return Request'}
        </button>
      </div>

      {msg && <p className={styles.msg}>{msg}</p>}

      {showForm && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h3 className={styles.formTitle}>Submit Return Request</h3>
          <div className={styles.field}>
            <label>Order ID</label>
            <input
              className={styles.input}
              placeholder="Paste your order UUID"
              value={formData.orderId}
              onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
              required
            />
          </div>
          <div className={styles.field}>
            <label>Reason</label>
            <select
              className={styles.input}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value as ReturnReason })}
            >
              {Object.entries(REASON_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label>Additional Notes (optional)</label>
            <textarea
              className={styles.textarea}
              placeholder="Describe the issue…"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              maxLength={500}
            />
          </div>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Request'}
          </button>
        </form>
      )}

      {returns.length === 0 && !showForm ? (
        <div className={styles.empty}>
          <p>No return requests yet.</p>
          <Link href="/account/orders" className="btn btn--ghost btn--sm">View My Orders</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {returns.map((r) => (
            <div key={r.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.orderId}>Order: {r.orderId.slice(-8).toUpperCase()}</span>
                <span className={`badge badge--${STATUS_BADGE[r.status] ?? 'default'}`}>
                  {r.status}
                </span>
              </div>
              <p className={styles.reason}>{REASON_LABELS[r.reason]}</p>
              {r.notes && <p className={styles.notes}>{r.notes}</p>}
              {r.adminNotes && (
                <p className={styles.adminNotes}>Admin: {r.adminNotes}</p>
              )}
              <time className={styles.date}>
                {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </time>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
