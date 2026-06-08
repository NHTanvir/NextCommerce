'use client';

import { useState, useMemo } from 'react';
import {
  useGetAdminTagsOverviewQuery,
  useAddTagToProductMutation,
  useRemoveTagGloballyMutation,
} from '@/store/api/tags.api';
import styles from '../admin.module.scss';

export default function AdminTagsPage() {
  const { data: tags = [], isLoading, error } = useGetAdminTagsOverviewQuery();
  const [addTag] = useAddTagToProductMutation();
  const [removeTagGlobally] = useRemoveTagGloballyMutation();

  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newProductId, setNewProductId] = useState('');
  const [adding, setAdding] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? tags.filter((t) => t.name.toLowerCase().includes(q)) : tags;
  }, [tags, search]);

  const handleDelete = async (name: string) => {
    if (!confirm(`Remove tag "${name}" from all products?`)) return;
    setDeleting(name);
    try {
      await removeTagGlobally(name).unwrap();
    } finally {
      setDeleting(null);
    }
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || !newProductId.trim()) return;
    setAdding(true);
    try {
      await addTag({ productId: newProductId.trim(), name: newTag.trim() }).unwrap();
      setNewTag('');
      setNewProductId('');
    } finally {
      setAdding(false);
    }
  };

  const totalTaggedProducts = tags.reduce((s, t) => s + t.productCount, 0);

  return (
    <div className={styles.page}>
      <div className={styles.dashHeader}>
        <h1 className={styles.pageTitle}>Tag Management</h1>
      </div>

      <div className={styles.statsGrid} style={{ gridTemplateColumns: 'repeat(3,1fr)' }}>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ color: '#3b82f6', background: '#3b82f618' }}>🏷️</div>
          <div className={styles.statBody}>
            <span className={styles.statValue} style={{ color: '#3b82f6' }}>{tags.length}</span>
            <span className={styles.statLabel}>Unique Tags</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ color: '#3fb950', background: '#3fb95018' }}>📦</div>
          <div className={styles.statBody}>
            <span className={styles.statValue} style={{ color: '#3fb950' }}>{totalTaggedProducts}</span>
            <span className={styles.statLabel}>Tag Applications</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIconWrap} style={{ color: '#f59e0b', background: '#f59e0b18' }}>📊</div>
          <div className={styles.statBody}>
            <span className={styles.statValue} style={{ color: '#f59e0b' }}>
              {tags.length > 0 ? (totalTaggedProducts / tags.length).toFixed(1) : '0'}
            </span>
            <span className={styles.statLabel}>Avg Per Tag</span>
          </div>
        </div>
      </div>

      <div className={styles.tableWrap} style={{ marginBottom: '1.5rem' }}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Add Tag to Product</h2>
        </div>
        <form
          onSubmit={handleAddTag}
          style={{ display: 'flex', gap: '0.75rem', padding: '1rem 1.25rem', flexWrap: 'wrap', alignItems: 'flex-end' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1, minWidth: 180 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Product ID</label>
            <input
              type="text"
              placeholder="UUID of product"
              value={newProductId}
              onChange={(e) => setNewProductId(e.target.value)}
              required
              style={{
                padding: '0.4rem 0.6rem',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text)',
                fontSize: '0.875rem',
                fontFamily: 'var(--font-mono)',
              }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: 1, minWidth: 140 }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>Tag Name</label>
            <input
              type="text"
              placeholder="e.g. summer-2025"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              required
              style={{
                padding: '0.4rem 0.6rem',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text)',
                fontSize: '0.875rem',
              }}
            />
          </div>
          <button type="submit" className="btn btn--primary btn--sm" disabled={adding}>
            {adding ? 'Adding…' : '+ Add Tag'}
          </button>
        </form>
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>All Tags ({filtered.length})</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search tags…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '0.375rem 0.75rem',
                background: 'var(--color-bg-card)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--color-text)',
                fontSize: '0.875rem',
                width: 200,
              }}
            />
          </div>
        </div>

        {error && <p style={{ padding: '1rem', color: 'var(--color-accent)' }}>Could not load tags.</p>}

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tag Name</th>
              <th>Products</th>
              <th>Bar</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={4} className={styles.emptyCell}>Loading…</td></tr>
            )}
            {!isLoading && filtered.length === 0 && (
              <tr><td colSpan={4} className={styles.emptyCell}>No tags found.</td></tr>
            )}
            {!isLoading && filtered.map((tag) => {
              const maxCount = Math.max(...filtered.map((t) => t.productCount), 1);
              const pct = (tag.productCount / maxCount) * 100;
              return (
                <tr key={tag.name}>
                  <td>
                    <span style={{
                      display: 'inline-block',
                      padding: '0.2rem 0.625rem',
                      background: 'rgba(233,69,96,0.12)',
                      color: 'var(--color-accent)',
                      borderRadius: 100,
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                    }}>
                      {tag.name}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{tag.productCount}</td>
                  <td style={{ width: 120 }}>
                    <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'var(--color-accent)', borderRadius: 3 }} />
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn--outline btn--sm"
                      onClick={() => handleDelete(tag.name)}
                      disabled={deleting === tag.name}
                      style={{ fontSize: '0.75rem' }}
                    >
                      {deleting === tag.name ? '…' : 'Remove All'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
