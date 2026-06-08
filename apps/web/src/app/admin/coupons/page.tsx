'use client';

import { useState, FormEvent } from 'react';
import { formatPrice } from '@/lib/formatters';
import {
  useGetAdminCouponsQuery,
  useGetAdminCouponStatsQuery,
  useCreateCouponMutation,
  useDeactivateCouponMutation,
} from '@/store/api/coupons.api';
import styles from './coupons.module.scss';

export default function AdminCouponsPage() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    maxUsageCount: '',
    expiresAt: '',
  });

  const { data: coupons = [], isLoading } = useGetAdminCouponsQuery();
  const { data: stats } = useGetAdminCouponStatsQuery();
  const [createCoupon, { isLoading: submitting }] = useCreateCouponMutation();
  const [deactivateCoupon] = useDeactivateCouponMutation();

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createCoupon({
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        ...(form.maxUsageCount ? { maxUsageCount: Number(form.maxUsageCount) } : {}),
        ...(form.expiresAt ? { expiresAt: new Date(form.expiresAt).toISOString() } : {}),
      }).unwrap();
      setShowForm(false);
      setForm({ code: '', discountType: 'percentage', discountValue: '', maxUsageCount: '', expiresAt: '' });
    } catch {
      // ignore
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Coupons ({coupons.length})</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New Coupon
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: stats.total, color: '#8b949e' },
            { label: 'Active', value: stats.active, color: '#3fb950' },
            { label: 'Expired', value: stats.expired, color: '#e94560' },
            { label: 'Redemptions', value: stats.totalRedemptions, color: '#58a6ff' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              style={{
                flex: 1, minWidth: 100, background: 'var(--color-surface)',
                border: `1px solid ${color}30`, borderRadius: '0.75rem',
                padding: '1rem', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: '0.25rem',
              }}
            >
              <span style={{ fontSize: '1.75rem', fontWeight: 800, color }}>{value}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form className={styles.form} onSubmit={handleCreate}>
          <h2 className={styles.formTitle}>Create Coupon</h2>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Code</label>
              <input
                className={styles.input}
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                placeholder="SAVE20"
                required
              />
            </div>
            <div className={styles.field}>
              <label>Type</label>
              <select
                className={styles.input}
                value={form.discountType}
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as 'percentage' | 'fixed' }))}
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed ($)</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Value</label>
              <input
                className={styles.input}
                type="number"
                value={form.discountValue}
                onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
                placeholder={form.discountType === 'percentage' ? '20' : '500'}
                required
              />
            </div>
            <div className={styles.field}>
              <label>Max Uses</label>
              <input
                className={styles.input}
                type="number"
                value={form.maxUsageCount}
                onChange={(e) => setForm((f) => ({ ...f, maxUsageCount: e.target.value }))}
                placeholder="Unlimited"
              />
            </div>
            <div className={styles.field}>
              <label>Expires At</label>
              <input
                className={styles.input}
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      )}

      <div className={styles.tableWrap}>
        {isLoading ? (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Loading…</p>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c.id}>
                  <td className={styles.codeCell}>{c.code}</td>
                  <td>
                    {c.discountType === 'percentage'
                      ? `${c.discountValue}%`
                      : formatPrice(c.discountValue)}
                  </td>
                  <td>{c.usageCount} / {c.maxUsageCount ?? '∞'}</td>
                  <td>{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                  <td>
                    <span className={`badge ${c.isActive ? 'badge-success' : 'badge-error'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {c.isActive && (
                      <button
                        className={styles.deactivateBtn}
                        onClick={() => deactivateCoupon(c.id)}
                      >
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
