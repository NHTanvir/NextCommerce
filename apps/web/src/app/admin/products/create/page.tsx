'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { selectAuthUser } from '@/store/slices/auth.slice';
import { getStoredToken } from '@/lib/auth';
import styles from './create.module.scss';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function CreateProductPage() {
  const router = useRouter();
  const user = useAppSelector(selectAuthUser);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    description: '',
    brand: '',
    slug: '',
    basePriceCents: '',
    categoryId: '',
    imageUrl: '',
    imageAlt: '',
    isActive: true,
  });

  const autofillSlug = (title: string) =>
    title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  const handleTitleChange = (value: string) => {
    setForm((f) => ({ ...f, title: value, slug: autofillSlug(value) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.brand || !form.slug || !form.basePriceCents || !form.categoryId) {
      setError('All required fields must be filled.');
      return;
    }

    const priceCents = Math.round(parseFloat(form.basePriceCents) * 100);
    if (isNaN(priceCents) || priceCents <= 0) {
      setError('Price must be a positive number.');
      return;
    }

    try {
      setSubmitting(true);
      const token = getStoredToken();
      const body = {
        title: form.title,
        description: form.description || `Buy ${form.title} at NextCommerce`,
        brand: form.brand,
        slug: form.slug,
        basePriceCents: priceCents,
        categoryId: form.categoryId,
        isActive: form.isActive,
        images: form.imageUrl ? [{ url: form.imageUrl, alt: form.imageAlt || form.title }] : [],
        variants: [],
      };

      const res = await fetch(`${API_URL}/api/catalog/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message ?? 'Failed to create product');
      }

      const product = await res.json();
      router.push(`/admin/products?created=${product.data?.slug ?? product.slug ?? ''}`);
    } catch (err: any) {
      setError(err.message ?? 'Unexpected error');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className={styles.denied}>
        <h2>Access Denied</h2>
        <p>You must be an admin to create products.</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Create New Product</h1>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => router.back()}
        >
          ← Back
        </button>
      </div>

      {error && <div className={styles.errorBanner}>{error}</div>}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Basic Information</h2>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Title <span>*</span></label>
              <input
                className={styles.input}
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Nike Air Max 270"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Brand <span>*</span></label>
              <input
                className={styles.input}
                value={form.brand}
                onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                placeholder="Nike"
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
              placeholder="Product description..."
              rows={4}
            />
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Pricing &amp; Catalog</h2>
          <div className={styles.grid2}>
            <div className={styles.field}>
              <label className={styles.label}>Price (USD) <span>*</span></label>
              <input
                className={styles.input}
                type="number"
                min="0.01"
                step="0.01"
                value={form.basePriceCents}
                onChange={(e) => setForm((f) => ({ ...f, basePriceCents: e.target.value }))}
                placeholder="129.99"
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Category ID <span>*</span></label>
              <input
                className={styles.input}
                value={form.categoryId}
                onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                placeholder="UUID of category"
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>URL Slug <span>*</span></label>
            <input
              className={styles.input}
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="nike-air-max-270"
              required
            />
            <p className={styles.hint}>Auto-generated from title. Must be unique.</p>
          </div>
        </div>

        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Media</h2>
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
              <label className={styles.label}>Image Alt Text</label>
              <input
                className={styles.input}
                value={form.imageAlt}
                onChange={(e) => setForm((f) => ({ ...f, imageAlt: e.target.value }))}
                placeholder="Product photo"
              />
            </div>
          </div>
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

        <div className={styles.actions}>
          <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}
