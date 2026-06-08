'use client';

import { useState } from 'react';
import {
  useGetAllCollectionsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useGetCollectionStatsQuery,
} from '@/store/api/collections.api';
import styles from './collections.module.scss';

export default function AdminCollectionsPage() {
  const { data: collections = [], isLoading } = useGetAllCollectionsQuery();
  const { data: stats } = useGetCollectionStatsQuery();
  const [createCollection, { isLoading: creating }] = useCreateCollectionMutation();
  const [updateCollection] = useUpdateCollectionMutation();
  const [deleteCollection] = useDeleteCollectionMutation();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    discountPercent: 0,
    startsAt: '',
    endsAt: '',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createCollection({
      ...form,
      discountPercent: Number(form.discountPercent),
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
      productIds: [],
    });
    setForm({ name: '', slug: '', description: '', discountPercent: 0, startsAt: '', endsAt: '' });
    setShowForm(false);
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    await updateCollection({ id, isActive: !isActive });
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete collection "${name}"? This cannot be undone.`)) return;
    await deleteCollection(id);
  };

  const generateSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.heading}>Collections</h1>
          <p className={styles.sub}>{collections.length} collections</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Collection'}
        </button>
      </div>

      {stats && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: stats.total, color: '#58a6ff' },
            { label: 'Active', value: stats.active, color: '#3fb950' },
            { label: 'Inactive', value: stats.inactive, color: '#8b949e' },
            { label: 'With Discount', value: stats.withDiscount, color: '#f59e0b' },
            { label: 'Expiring Soon', value: stats.expiringSoon, color: '#e94560' },
          ].map((s) => (
            <div key={s.label} style={{
              flex: 1, minWidth: 100, background: 'var(--color-surface)',
              border: `1px solid ${s.color}30`, borderRadius: '0.75rem',
              padding: '0.875rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem',
            }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form className={styles.createForm} onSubmit={handleCreate}>
          <h3 className={styles.formTitle}>Create Collection</h3>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label className={styles.label}>Name</label>
              <input
                className={styles.input}
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, slug: generateSlug(e.target.value) }))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Slug</label>
              <input
                className={styles.input}
                required
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              />
            </div>
            <div className={`${styles.field} ${styles.fullWidth}`}>
              <label className={styles.label}>Description</label>
              <input
                className={styles.input}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Discount %</label>
              <input
                className={styles.input}
                type="number"
                min={0}
                max={80}
                value={form.discountPercent}
                onChange={(e) => setForm((f) => ({ ...f, discountPercent: Number(e.target.value) }))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Starts At</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={form.startsAt}
                onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Ends At</label>
              <input
                className={styles.input}
                type="datetime-local"
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
              />
            </div>
          </div>
          <button type="submit" className="btn btn--primary" disabled={creating}>
            {creating ? 'Creating…' : 'Create Collection'}
          </button>
        </form>
      )}

      {isLoading ? (
        <div className={styles.loading}>Loading collections…</div>
      ) : (
        <div className={styles.grid}>
          {collections.map((c) => (
            <div key={c.id} className={`${styles.card} ${!c.isActive ? styles.cardInactive : ''}`}>
              <div className={styles.cardHeader}>
                <div>
                  <h3 className={styles.cardName}>{c.name}</h3>
                  <p className={styles.cardSlug}>/{c.slug}</p>
                </div>
                {c.discountPercent > 0 && (
                  <span className={styles.discount}>{c.discountPercent}% OFF</span>
                )}
              </div>

              {c.description && (
                <p className={styles.cardDesc}>{c.description}</p>
              )}

              <div className={styles.cardMeta}>
                <span className={styles.productCount}>{c.productIds.length} products</span>
                {c.endsAt && (
                  <span className={styles.endsAt}>
                    Ends {new Date(c.endsAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className={styles.cardActions}>
                <button
                  className={`btn btn--sm ${c.isActive ? 'btn--outline' : 'btn--primary'}`}
                  onClick={() => handleToggle(c.id, c.isActive)}
                >
                  {c.isActive ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(c.id, c.name)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
