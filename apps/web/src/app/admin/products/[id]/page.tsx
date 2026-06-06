'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useGetProductByIdQuery, useUpdateProductMutation, useDeactivateProductMutation } from '@/store/api/catalog.api';
import styles from './edit-product.module.scss';

export default function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: product, isLoading } = useGetProductByIdQuery(id);
  const [updateProduct, { isLoading: saving }] = useUpdateProductMutation();
  const [deactivate, { isLoading: deactivating }] = useDeactivateProductMutation();

  const [form, setForm] = useState({
    title: '',
    description: '',
    brand: '',
    slug: '',
    basePriceCents: '',
    salePriceCents: '',
    categoryId: '',
    imageUrl: '',
    imageAlt: '',
    isActive: true,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        title: product.title ?? '',
        description: product.description ?? '',
        brand: product.brand ?? '',
        slug: product.slug ?? '',
        basePriceCents: product.basePriceCents ? String(product.basePriceCents / 100) : '',
        salePriceCents: (product as any).salePriceCents ? String((product as any).salePriceCents / 100) : '',
        categoryId: product.categoryId ?? '',
        imageUrl: product.images?.[0]?.url ?? '',
        imageAlt: product.images?.[0]?.alt ?? '',
        isActive: product.isActive ?? true,
      });
    }
  }, [product]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const priceCents = Math.round(parseFloat(form.basePriceCents) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      setError('Price must be a positive number.');
      return;
    }
    const saleCents = form.salePriceCents ? Math.round(parseFloat(form.salePriceCents) * 100) : undefined;
    if (saleCents !== undefined && (isNaN(saleCents) || saleCents <= 0)) {
      setError('Sale price must be a positive number.');
      return;
    }
    if (saleCents !== undefined && saleCents >= priceCents) {
      setError('Sale price must be less than the regular price.');
      return;
    }

    try {
      await updateProduct({
        id,
        title: form.title,
        description: form.description,
        brand: form.brand,
        slug: form.slug,
        basePriceCents: priceCents,
        ...(saleCents !== undefined && { salePriceCents: saleCents }),
        categoryId: form.categoryId,
        isActive: form.isActive,
        images: form.imageUrl ? [{ url: form.imageUrl, alt: form.imageAlt || form.title }] : [],
      }).unwrap();
      setSuccess('Product updated successfully.');
    } catch (err: any) {
      setError(err?.data?.message ?? 'Failed to update product.');
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivate(id).unwrap();
      router.push('/admin/products?deactivated=1');
    } catch (err: any) {
      setError(err?.data?.message ?? 'Failed to deactivate.');
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeleton} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.page}>
        <h2>Product not found</h2>
        <Link href="/admin/products" className="btn btn--outline">← Back</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <Link href="/admin/products" className={styles.backLink}>← Products</Link>
          <h1 className={styles.heading}>Edit Product</h1>
          <p className={styles.sub}>ID: <span className={styles.mono}>{id}</span></p>
        </div>
        <div className={styles.headerActions}>
          <span className={product.isActive ? styles.badgeActive : styles.badgeInactive}>
            {product.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}
      {success && <div className={styles.successBanner}>{success}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Title <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Brand <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              className={styles.textarea}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={5}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Pricing &amp; Catalog</h2>
          <div className={styles.grid3}>
            <div className={styles.field}>
              <label className={styles.label}>Regular Price (USD) <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                type="number"
                min="0.01"
                step="0.01"
                value={form.basePriceCents}
                onChange={(e) => setForm((f) => ({ ...f, basePriceCents: e.target.value }))}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>
                Sale Price (USD)
                <span style={{ marginLeft: '0.375rem', fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>
                  optional — leave blank to clear
                </span>
              </label>
              <input
                className={styles.input}
                type="number"
                min="0.01"
                step="0.01"
                placeholder="e.g. 79.99"
                value={form.salePriceCents}
                onChange={(e) => setForm((f) => ({ ...f, salePriceCents: e.target.value }))}
              />
              {form.salePriceCents && form.basePriceCents && (
                <p style={{ fontSize: '0.75rem', color: '#3fb950', marginTop: '0.25rem' }}>
                  {Math.round(((parseFloat(form.basePriceCents) - parseFloat(form.salePriceCents)) / parseFloat(form.basePriceCents)) * 100)}% discount
                </p>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Category ID <span className={styles.req}>*</span></label>
              <input
                className={styles.input}
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>URL Slug <span className={styles.req}>*</span></label>
            <input
              className={styles.input}
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              required
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Primary Image</h2>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Image URL</label>
              <input
                className={styles.input}
                value={form.imageUrl}
                onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
                placeholder="https://..."
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Alt Text</label>
              <input
                className={styles.input}
                value={form.imageAlt}
                onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))}
              />
            </div>
          </div>
          {form.imageUrl && (
            <div className={styles.imagePreview}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imageUrl} alt={form.imageAlt} className={styles.previewImg} />
            </div>
          )}
        </div>

        <div className={styles.section}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            />
            <span>Active (visible in storefront)</span>
          </label>
        </div>

        <div className={styles.formActions}>
          <button type="button" className="btn btn--ghost" onClick={() => router.back()}>
            Cancel
          </button>
          <button type="submit" className="btn btn--primary" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Danger zone */}
      <div className={styles.dangerZone}>
        <h3 className={styles.dangerTitle}>Danger Zone</h3>
        {!showDeactivateConfirm ? (
          <button
            className="btn btn--danger btn--sm"
            onClick={() => setShowDeactivateConfirm(true)}
            disabled={!product.isActive}
          >
            {product.isActive ? 'Deactivate Product' : 'Already Inactive'}
          </button>
        ) : (
          <div className={styles.confirmBox}>
            <p>This will hide the product from the storefront. Continue?</p>
            <div className={styles.confirmActions}>
              <button
                className="btn btn--ghost btn--sm"
                onClick={() => setShowDeactivateConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn--danger btn--sm"
                onClick={handleDeactivate}
                disabled={deactivating}
              >
                {deactivating ? 'Deactivating…' : 'Confirm Deactivate'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
