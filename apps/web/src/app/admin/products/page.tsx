'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetProductsQuery, useGetCategoriesQuery, useGetBrandsQuery, useDeactivateProductMutation } from '@/store/api/catalog.api';
import { useAppSelector } from '@/store/hooks';
import { selectAuthToken } from '@/store/slices/auth.slice';
import styles from './products.module.scss';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'az', label: 'A → Z' },
  { value: 'za', label: 'Z → A' },
];

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brand, setBrand] = useState('');
  const [sort, setSort] = useState('newest');
  const [deactivating, setDeactivating] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [exporting, setExporting] = useState(false);
  const token = useAppSelector(selectAuthToken);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await fetch(`${API_BASE}/api/catalog/export`, {
        headers: { Authorization: `Bearer ${token ?? ''}` },
      });

      if (!res.ok) { alert('Export failed'); return; }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const { data, isLoading, refetch } = useGetProductsQuery({
    page,
    limit: 20,
    search: search || undefined,
    categoryId: categoryId || undefined,
    brand: brand || undefined,
  });

  const { data: categories = [] } = useGetCategoriesQuery();
  const { data: brands = [] } = useGetBrandsQuery();
  const [deactivate] = useDeactivateProductMutation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleClear = () => {
    setSearchInput('');
    setSearch('');
    setCategoryId('');
    setBrand('');
    setSort('newest');
    setPage(1);
  };

  const handleDeactivate = async (id: string, title: string) => {
    if (!confirm(`Deactivate "${title}"? It will be hidden from the storefront.`)) return;
    setDeactivating(id);
    try {
      await deactivate(id).unwrap();
      setSuccessMsg(`"${title}" deactivated.`);
      refetch();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch {
      alert('Failed to deactivate product.');
    } finally {
      setDeactivating(null);
    }
  };

  const products: any[] = data?.data ?? (data as any)?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Products</h1>
          <p className={styles.subtitle}>{total.toLocaleString()} total products</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin/products/create" className="btn btn--primary btn--sm">
            + New Product
          </Link>
          <Link href="/admin/import" className="btn btn--ghost btn--sm">
            Import CSV
          </Link>
          <button className="btn btn--ghost btn--sm" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting…' : '↓ Export CSV'}
          </button>
        </div>
      </div>

      {successMsg && <div className={styles.successBanner}>{successMsg}</div>}

      {/* Filters */}
      <div className={styles.filters}>
        <form className={styles.searchForm} onSubmit={handleSearch}>
          <input
            className={styles.searchInput}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by title, brand, or slug…"
          />
          <button type="submit" className="btn btn--primary btn--sm">Search</button>
          {(search || categoryId || brand) && (
            <button type="button" className="btn btn--ghost btn--sm" onClick={handleClear}>
              Clear Filters
            </button>
          )}
        </form>

        <div className={styles.filterRow}>
          <select
            className={styles.filterSelect}
            value={categoryId}
            onChange={(e) => { setCategoryId(e.target.value); setPage(1); }}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={brand}
            onChange={(e) => { setBrand(e.target.value); setPage(1); }}
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.brand} value={b.brand}>{b.brand} ({b.productCount})</option>
            ))}
          </select>

          <select
            className={styles.filterSelect}
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Price</th>
              <th>Variants</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={7} className={styles.loadingRow}>Loading products…</td>
              </tr>
            )}
            {!isLoading && products.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.emptyRow}>
                  No products found.{search && ` Try a different search term.`}
                </td>
              </tr>
            )}
            {products.map((p: any) => {
              const minPrice = p.variants?.length
                ? Math.min(...p.variants.map((v: any) => v.priceCents))
                : p.basePriceCents ?? 0;
              return (
                <tr key={p.id}>
                  <td>
                    <div className={styles.productCell}>
                      {p.images?.[0]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0].url} alt={p.title} className={styles.productThumb} />
                      ) : (
                        <div className={styles.productThumbPlaceholder}>👟</div>
                      )}
                      <div>
                        <p className={styles.productTitle}>{p.title}</p>
                        <p className={styles.productSlug}>{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className={styles.muted}>{p.brand ?? '—'}</td>
                  <td className={styles.muted}>{p.category?.name ?? p.categoryName ?? '—'}</td>
                  <td className={styles.price}>{formatPrice(minPrice)}</td>
                  <td className={styles.center}>{p.variants?.length ?? 0}</td>
                  <td>
                    <span className={p.isActive !== false ? styles.badgeActive : styles.badgeInactive}>
                      {p.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      <Link href={`/admin/products/${p.id}`} className="btn btn--ghost btn--sm">
                        Edit
                      </Link>
                      <Link href={`/admin/products/${p.id}/variants`} className="btn btn--ghost btn--sm">
                        Variants
                      </Link>
                      {p.isActive !== false && (
                        <button
                          className="btn btn--danger btn--sm"
                          disabled={deactivating === p.id}
                          onClick={() => handleDeactivate(p.id, p.title)}
                        >
                          {deactivating === p.id ? '…' : 'Deactivate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className="btn btn--ghost btn--sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Prev
          </button>
          <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
          <button
            className="btn btn--ghost btn--sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
