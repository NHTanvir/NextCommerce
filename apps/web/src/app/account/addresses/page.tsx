'use client';

import { useState, FormEvent } from 'react';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/auth.slice';
import {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
} from '@/store/api/addresses.api';
import styles from './addresses.module.scss';

export default function AddressesPage() {
  const user = useAppSelector(selectAuthUser);
  const [showForm, setShowForm] = useState(false);
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

  const { data: addresses = [], isLoading } = useGetAddressesQuery(undefined, { skip: !user });
  const [createAddress, { isLoading: submitting }] = useCreateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createAddress({
        fullName: form.fullName,
        line1: form.line1,
        line2: form.line2 || undefined,
        city: form.city,
        state: form.state || undefined,
        postalCode: form.postalCode,
        countryCode: form.countryCode,
        phone: form.phone || undefined,
      }).unwrap();
      setShowForm(false);
      setForm({ fullName: '', line1: '', line2: '', city: '', state: '', postalCode: '', countryCode: 'US', phone: '' });
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAddress(id);
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
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          + Add Address
        </button>
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

      {isLoading ? (
        <p style={{ color: 'var(--color-text-muted)', padding: '1rem' }}>Loading addresses…</p>
      ) : addresses.length === 0 ? (
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
      )}
    </div>
  );
}
