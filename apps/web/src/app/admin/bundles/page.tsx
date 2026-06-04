'use client';

import { useState } from 'react';
import {
  useGetAllBundlesQuery,
  useCreateBundleMutation,
  useDeactivateBundleMutation,
  useDeleteBundleMutation,
} from '@/store/api/bundles.api';
import styles from './bundles.module.scss';

export default function AdminBundlesPage() {
  const { data: bundles = [], isLoading } = useGetAllBundlesQuery({ includeInactive: true });
  const [createBundle, { isLoading: creating }] = useCreateBundleMutation();
  const [deactivateBundle] = useDeactivateBundleMutation();
  const [deleteBundle] = useDeleteBundleMutation();

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [productIds, setProductIds] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const ids = productIds.split(',').map((id) => id.trim()).filter(Boolean);
    if (ids.length < 2) return;

    await createBundle({
      name: name.trim(),
      description: description.trim() || undefined,
      productIds: ids,
      discountPercent: Number(discountPercent),
      startsAt: startsAt || undefined,
      endsAt: endsAt || undefined,
    });

    setName('');
    setDescription('');
    setProductIds('');
    setDiscountPercent('');
    setStartsAt('');
    setEndsAt('');
    setShowForm(false);
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this bundle?')) return;
    await deactivateBundle(id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this bundle?')) return;
    await deleteBundle(id);
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.heading}>Product Bundles</h1>
          <p className={styles.sub}>{bundles.length} bundle{bundles.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn--primary btn--sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ New Bundle'}
        </button>
      </div>

      {showForm && (
        <form className={styles.form} onSubmit={handleCreate}>
          <h3 className={styles.formTitle}>Create Bundle</h3>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Bundle Name *</label>
              <input
                className={styles.input}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Summer Starter Pack"
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Discount % *</label>
              <input
                className={styles.input}
                type="number"
                required
                min="1"
                max="99"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="15"
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <input
              className={styles.input}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Save on essentials"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Product IDs (comma-separated, min 2) *</label>
            <textarea
              className={styles.textarea}
              required
              rows={2}
              value={productIds}
              onChange={(e) => setProductIds(e.target.value)}
              placeholder="uuid1, uuid2, uuid3"
            />
          </div>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Starts At (optional)</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Ends At (optional)</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
              />
            </div>
          </div>
          <button type="submit" className="btn btn--primary btn--sm" disabled={creating}>
            {creating ? 'Creating…' : 'Create Bundle'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className={styles.loading}>Loading bundles…</div>
      ) : bundles.length === 0 ? (
        <div className={styles.empty}>No bundles yet.</div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Products</th>
                <th>Discount</th>
                <th>Active?</th>
                <th>Date Range</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bundles.map((b) => (
                <tr key={b.id} className={!b.isActive ? styles.inactive : ''}>
                  <td className={styles.bundleName}>
                    <p className={styles.nameText}>{b.name}</p>
                    {b.description && <p className={styles.descText}>{b.description}</p>}
                  </td>
                  <td className={styles.mono}>{b.productIds.length} products</td>
                  <td className={styles.discount}>{b.discountPercent}% off</td>
                  <td>
                    <span className={b.isActive ? styles.activeBadge : styles.inactiveBadge}>
                      {b.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className={styles.dateRange}>
                    {b.startsAt || b.endsAt ? (
                      <>
                        {b.startsAt && (
                          <span>{new Date(b.startsAt).toLocaleDateString()}</span>
                        )}
                        {b.startsAt && b.endsAt && ' — '}
                        {b.endsAt && (
                          <span>{new Date(b.endsAt).toLocaleDateString()}</span>
                        )}
                      </>
                    ) : (
                      <span className={styles.always}>Always</span>
                    )}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      {b.isActive && (
                        <button
                          className={styles.deactivateBtn}
                          onClick={() => handleDeactivate(b.id)}
                        >
                          Deactivate
                        </button>
                      )}
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(b.id)}
                      >
                        Delete
                      </button>
                    </div>
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
