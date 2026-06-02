'use client';

import { useState, FormEvent } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/auth.slice';
import { getStoredToken } from '@/lib/auth';
import styles from './addresses.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface Address {
  id: string;
  line1: string;
  line2: string | null;
  city: string;
  country: string;
  postalCode: string;
}

export default function AddressesPage() {
  const user = useAppSelector(selectAuthUser);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    countryCode: 'US',
    phone: '',
  });

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const token = getStoredToken();
      const res = await fetch(`${API_URL}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.data ?? data);
      }
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const token = getStoredToken();
      await fetch(`${API_URL}/api/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fullName: form.fullName,
          line1: form.line1,
          line2: form.line2 || undefined,
          city: form.city,
          state: form.state || undefined,
          postalCode: form.postalCode,
          countryCode: form.countryCode,
          phone: form.phone || undefined,
        }),
      });
      setShowForm(false);
      setForm({ fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', countryCode: 'US', phone: '' });
      loadAddresses();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = getStoredToken();
    await fetch(`${API_URL}/api/addresses/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  };

  if (!user) {
    return (
      <div className={styles.denied}>
        <p>Please sign in to manage your addresses.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Saved Addresses</h1>
        <div className={styles.actions}>
          {!loaded && (
            <button className="btn btn-secondary" onClick={loadAddresses} disabled={loading}>
              {loading ? 'Loading...' : 'Load Addresses'}
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            + Add Address
          </button>
        </div>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleAdd}>
          <h2 className={styles.formTitle}>New Address</h2>
          <div className={styles.formGrid}>
            {[
              { key: 'fullName', label: 'Full Name', required: true },
              { key: 'line1', label: 'Address Line 1', required: true },
              { key: 'line2', label: 'Line 2 (Optional)' },
              { key: 'city', label: 'City', required: true },
              { key: 'state', label: 'State / Province' },
              { key: 'postalCode', label: 'Postal Code', required: true },
              { key: 'countryCode', label: 'Country Code', required: true },
              { key: 'phone', label: 'Phone' },
            ].map(({ key, label, required }) => (
              <div key={key} className={styles.field}>
                <label>{label} {required && <span>*</span>}</label>
                <input
                  className={styles.input}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  required={required}
                />
              </div>
            ))}
          </div>
          <div className={styles.formActions}>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      )}

      {loaded && (
        addresses.length === 0 ? (
          <div className={styles.empty}>
            <p>No saved addresses yet. Add one above.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {addresses.map((addr) => (
              <div key={addr.id} className={styles.card}>
                <div className={styles.cardInfo}>
                  <p className={styles.cardLine}>{addr.line1}</p>
                  {addr.line2 && <p className={styles.cardLine}>{addr.line2}</p>}
                  <p className={styles.cardLine}>{addr.city}, {addr.postalCode}</p>
                  <p className={styles.cardLine}>{addr.country}</p>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(addr.id)}
                  aria-label="Delete address"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
