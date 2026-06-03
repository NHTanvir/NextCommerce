'use client';

import { useState } from 'react';
import {
  useGetAdminPromotionsQuery,
  useCreatePromotionMutation,
  useDeactivatePromotionMutation,
  useDeletePromotionMutation,
  type CreatePromotionPayload,
} from '@/store/api/promotions.api';
import styles from './promotions.module.scss';

const EMPTY_FORM: CreatePromotionPayload = {
  name: '',
  description: '',
  discountType: 'percentage',
  discountValue: 10,
  startsAt: '',
  endsAt: '',
  isActive: true,
};

export default function AdminPromotionsPage() {
  const { data: promotions = [], isLoading } = useGetAdminPromotionsQuery();
  const [createPromotion, { isLoading: creating }] = useCreatePromotionMutation();
  const [deactivate] = useDeactivatePromotionMutation();
  const [deletePromotion] = useDeletePromotionMutation();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreatePromotionPayload>(EMPTY_FORM);
  const [msg, setMsg] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createPromotion(form).unwrap();
      setShowForm(false);
      setForm(EMPTY_FORM);
      setMsg('Promotion created.');
    } catch {
      setMsg('Failed to create promotion.');
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await deactivate(id).unwrap();
      setMsg('Promotion deactivated.');
    } catch {
      setMsg('Failed to deactivate.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this promotion? This cannot be undone.')) return;
    try {
      await deletePromotion(id).unwrap();
    } catch {
      setMsg('Failed to delete.');
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Promotions</h1>
        <button className="btn btn--primary btn--sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : 'New Promotion'}
        </button>
      </div>

      {msg && <p className={styles.msg}>{msg}</p>}

      {showForm && (
        <form className={styles.form} onSubmit={handleCreate}>
          <h3 className={styles.formTitle}>Create Promotion</h3>
          <div className={styles.grid}>
            <div className={styles.field}>
              <label>Name</label>
              <input className={styles.input} required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Discount Type</label>
              <select className={styles.input} value={form.discountType}
                onChange={(e) => setForm({ ...form, discountType: e.target.value as 'percentage' | 'fixed' })}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Discount Value</label>
              <input className={styles.input} type="number" min="0.01" step="0.01" required
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })} />
            </div>
            <div className={styles.field}>
              <label>Minimum Order ($)</label>
              <input className={styles.input} type="number" min="0" step="0.01" placeholder="No minimum"
                value={form.minimumOrderAmount ?? ''}
                onChange={(e) => setForm({ ...form, minimumOrderAmount: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
            <div className={styles.field}>
              <label>Usage Limit</label>
              <input className={styles.input} type="number" min="1" placeholder="Unlimited"
                value={form.usageLimit ?? ''}
                onChange={(e) => setForm({ ...form, usageLimit: e.target.value ? Number(e.target.value) : undefined })} />
            </div>
            <div className={styles.field}>
              <label>Starts At</label>
              <input className={styles.input} type="datetime-local" required
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            </div>
            <div className={styles.field}>
              <label>Ends At</label>
              <input className={styles.input} type="datetime-local" required
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
            </div>
            <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <label>Description</label>
              <input className={styles.input} placeholder="Optional description"
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn--primary" disabled={creating}>
            {creating ? 'Creating…' : 'Create Promotion'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className={styles.loading}>Loading promotions…</div>
      ) : promotions.length === 0 ? (
        <div className={styles.empty}>No promotions yet. Create your first promotion above.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Discount</th>
                <th>Min. Order</th>
                <th>Usage</th>
                <th>Period</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map((p) => {
                const now = new Date();
                const active = p.isActive && new Date(p.startsAt) <= now && new Date(p.endsAt) >= now;
                return (
                  <tr key={p.id}>
                    <td>
                      <strong>{p.name}</strong>
                      {p.description && <div className={styles.desc}>{p.description}</div>}
                    </td>
                    <td className={styles.discount}>
                      {p.discountType === 'percentage' ? `${p.discountValue}%` : `$${p.discountValue}`}
                    </td>
                    <td>{p.minimumOrderAmount ? `$${p.minimumOrderAmount}` : '—'}</td>
                    <td>{p.usageLimit ? `${p.usageCount}/${p.usageLimit}` : p.usageCount}</td>
                    <td className={styles.dates}>
                      <span>{formatDate(p.startsAt)}</span>
                      <span className={styles.arrow}>→</span>
                      <span>{formatDate(p.endsAt)}</span>
                    </td>
                    <td>
                      <span className={`badge badge--${active ? 'success' : 'default'}`}>
                        {active ? 'Active' : p.isActive ? 'Scheduled' : 'Inactive'}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      {p.isActive && (
                        <button className="btn btn--ghost btn--sm" onClick={() => handleDeactivate(p.id)}>
                          Deactivate
                        </button>
                      )}
                      <button
                        className="btn btn--ghost btn--sm"
                        style={{ color: '#e94560' }}
                        onClick={() => handleDelete(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
