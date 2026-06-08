'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  useGetProductByIdQuery,
  useGetProductVariantsQuery,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
} from '@/store/api/catalog.api';
import styles from '../../admin.module.scss';

const EMPTY_FORM = { size: '', color: '', sku: '', stockQty: '', priceCents: '' };

export default function AdminVariantsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: product } = useGetProductByIdQuery(id);
  const { data: variants = [], isLoading } = useGetProductVariantsQuery(id);

  const [createVariant, { isLoading: adding }] = useCreateVariantMutation();
  const [updateVariant, { isLoading: updating }] = useUpdateVariantMutation();
  const [deleteVariant] = useDeleteVariantMutation();

  const [form, setForm] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [msg, setMsg] = useState('');

  const showMsg = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createVariant({
        productId: id,
        size: parseFloat(form.size),
        color: form.color,
        sku: form.sku,
        stockQty: parseInt(form.stockQty, 10),
        priceCents: Math.round(parseFloat(form.priceCents) * 100),
      }).unwrap();
      setForm(EMPTY_FORM);
      showMsg('Variant added.');
    } catch (err: any) {
      showMsg(err?.data?.message ?? 'Failed to add variant.');
    }
  };

  const handleSaveEdit = async (variantId: string) => {
    try {
      await updateVariant({
        id: variantId,
        size: parseFloat(editForm.size),
        color: editForm.color,
        sku: editForm.sku,
        stockQty: parseInt(editForm.stockQty, 10),
        priceCents: Math.round(parseFloat(editForm.priceCents) * 100),
      }).unwrap();
      setEditId(null);
      showMsg('Variant updated.');
    } catch {
      showMsg('Failed to update variant.');
    }
  };

  const handleDelete = async (variantId: string) => {
    if (!confirm('Delete this variant? This cannot be undone.')) return;
    await deleteVariant(variantId);
    showMsg('Variant deleted.');
  };

  const startEdit = (v: typeof variants[0]) => {
    setEditId(v.id);
    setEditForm({
      size: String(v.size),
      color: v.color,
      sku: v.sku,
      stockQty: String(v.stockQty),
      priceCents: String((v.priceCents / 100).toFixed(2)),
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.dashHeader}>
        <div>
          <Link href={`/admin/products/${id}`} className={styles.backLink} style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', textDecoration: 'none' }}>
            ← {product?.title ?? 'Back to Product'}
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: '0.25rem' }}>Manage Variants</h1>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/admin/products/${id}/specs`} className="btn btn--ghost btn--sm">Specs</Link>
          <Link href={`/admin/products/${id}`} className="btn btn--outline btn--sm">Edit Product</Link>
        </div>
      </div>

      {msg && (
        <div style={{
          padding: '0.75rem 1rem',
          background: 'rgba(59,130,246,0.1)',
          border: '1px solid rgba(59,130,246,0.3)',
          borderRadius: 'var(--radius-sm)',
          color: '#58a6ff',
          fontSize: '0.875rem',
          marginBottom: '1rem',
        }}>
          {msg}
        </div>
      )}

      <div className={styles.tableWrap} style={{ marginBottom: '1.5rem' }}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Add Variant</h2>
        </div>
        <form onSubmit={handleAdd} style={{ padding: '1rem 1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            {([
              { key: 'size', label: 'Size (US)', type: 'number', step: '0.5' },
              { key: 'color', label: 'Color', type: 'text' },
              { key: 'sku', label: 'SKU', type: 'text' },
              { key: 'stockQty', label: 'Stock Qty', type: 'number' },
              { key: 'priceCents', label: 'Price (USD)', type: 'number', step: '0.01' },
            ] as const).map((field) => (
              <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  step={(field as any).step}
                  required
                  value={form[field.key]}
                  onChange={(e) => setForm((f) => ({ ...f, [field.key]: e.target.value }))}
                  style={{
                    padding: '0.375rem 0.5rem',
                    background: 'var(--color-bg-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-text)',
                    fontSize: '0.875rem',
                  }}
                />
              </div>
            ))}
          </div>
          <button type="submit" className="btn btn--primary btn--sm" disabled={adding}>
            {adding ? 'Saving…' : '+ Add Variant'}
          </button>
        </form>
      </div>

      <div className={styles.tableWrap}>
        <div className={styles.tableHeader}>
          <h2 className={styles.tableTitle}>Variants ({variants.length})</h2>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Size</th>
              <th>Color</th>
              <th>SKU</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className={styles.emptyCell}>Loading…</td></tr>
            )}
            {!isLoading && variants.length === 0 && (
              <tr><td colSpan={6} className={styles.emptyCell}>No variants yet — add the first one above.</td></tr>
            )}
            {!isLoading && variants.map((v) => (
              <tr key={v.id}>
                {editId === v.id ? (
                  <>
                    {(['size', 'color', 'sku', 'stockQty', 'priceCents'] as const).map((field) => (
                      <td key={field}>
                        <input
                          type={['size', 'stockQty', 'priceCents'].includes(field) ? 'number' : 'text'}
                          value={editForm[field]}
                          onChange={(e) => setEditForm((f) => ({ ...f, [field]: e.target.value }))}
                          step={field === 'size' ? '0.5' : field === 'priceCents' ? '0.01' : undefined}
                          style={{
                            width: '100%', padding: '0.25rem 0.375rem',
                            background: 'var(--color-bg-card)', border: '1px solid var(--color-accent)',
                            borderRadius: 'var(--radius-sm)', color: 'var(--color-text)', fontSize: '0.875rem',
                          }}
                        />
                      </td>
                    ))}
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button className="btn btn--primary btn--sm" onClick={() => handleSaveEdit(v.id)} disabled={updating}>
                          {updating ? '…' : 'Save'}
                        </button>
                        <button className="btn btn--ghost btn--sm" onClick={() => setEditId(null)}>Cancel</button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ fontWeight: 700 }}>{v.size}</td>
                    <td>{v.color || '—'}</td>
                    <td><code style={{ fontSize: '0.8125rem', color: 'var(--color-accent)', fontFamily: 'monospace' }}>{v.sku}</code></td>
                    <td>
                      <span style={{ fontWeight: 700, color: v.stockQty === 0 ? '#e94560' : v.stockQty <= 3 ? '#f59e0b' : 'var(--color-text)' }}>
                        {v.stockQty}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>${(v.priceCents / 100).toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button className="btn btn--ghost btn--sm" onClick={() => startEdit(v)}>Edit</button>
                        <button
                          className="btn btn--outline btn--sm"
                          onClick={() => handleDelete(v.id)}
                          style={{ color: '#e94560', borderColor: '#e9456040' }}
                        >Delete</button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
