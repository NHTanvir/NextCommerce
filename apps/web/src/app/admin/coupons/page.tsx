'use client';

import { useState, FormEvent } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/auth.slice';
import { getStoredToken } from '@/lib/auth';
import { formatPrice } from '@/lib/formatters';
import styles from './coupons.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  usageCount: number;
  maxUsageCount: number | null;
  expiresAt: string | null;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const user = useAppSelector(selectAuthUser);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    maxUsageCount: '',
    expiresAt: '',
  });

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const token = getStoredToken();
      const res = await fetch(`${API_URL}/api/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.data ?? data);
      }
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = getStoredToken();
      const body = {
        code: form.code.toUpperCase(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        ...(form.maxUsageCount && { maxUsageCount: Number(form.maxUsageCount) }),
        ...(form.expiresAt && { expiresAt: new Date(form.expiresAt).toISOString() }),
      };
      const res = await fetch(`${API_URL}/api/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({ code: '', discountType: 'percentage', discountValue: '', maxUsageCount: '', expiresAt: '' });
        loadCoupons();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    const token = getStoredToken();
    await fetch(`${API_URL}/api/coupons/${id}/deactivate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    loadCoupons();
  };

  if (!loaded) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Coupons</h1>
          <button className="btn btn-primary" onClick={loadCoupons} disabled={loading}>
            {loading ? 'Loading...' : 'Load Coupons'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Coupons ({coupons.length})</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + New Coupon
        </button>
      </div>

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
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as any }))}
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
                      onClick={() => handleDeactivate(c.id)}
                    >
                      Deactivate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
