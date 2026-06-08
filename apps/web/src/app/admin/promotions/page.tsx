'use client';

import { useState } from 'react';
import {
  useGetAdminPromotionsQuery,
  useCreatePromotionMutation,
  useDeactivatePromotionMutation,
  useDeletePromotionMutation,
  useGetPromotionStatsQuery,
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
  const { data: stats } = useGetPromotionStatsQuery();
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

      {stats && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: stats.total, color: '#58a6ff' },
            { label: 'Active', value: stats.active, color: '#3fb950' },
            { label: 'Expired', value: stats.expired, color: '#e94560' },
            { label: 'Redemptions', value: stats.totalRedemptions, color: '#f59e0b' },
            { label: 'Top Promo', value: stats.topPromotion ?? '—', color: '#a371f7' },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, minWidth: 110, background: 'var(--color-surface)',
              border: `1px solid ${s.color}30`, borderRadius: '0.75rem',
              padding: '0.875rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
            }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

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
