'use client';

import { useState } from 'react';
import { useGetProductsQuery } from '@/store/api/catalog.api';
import styles from '../admin.module.scss';

export default function AdminProductsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetProductsQuery({ page, limit: 20 });

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Products</h1>

      <div className={styles.tableWrap}>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Variants</th>
              <th>Min Price</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>Loading…</td></tr>
            )}
            {data?.items.map((p) => {
              const minPrice = p.variants?.length
                ? Math.min(...p.variants.map((v) => v.priceCents))
                : 0;
              return (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.title}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{p.brand ?? '—'}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{p.category?.name ?? '—'}</td>
                  <td style={{ color: 'var(--color-text-muted)' }}>{p.variants?.length ?? 0}</td>
                  <td style={{ fontWeight: 700 }}>${(minPrice / 100).toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data && data.totalPages > 1 && (
          <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button className="btn btn--ghost btn--sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>← Prev</button>
            <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', padding: '0 0.5rem', lineHeight: '2' }}>
              Page {page} of {data.totalPages}
            </span>
            <button className="btn btn--ghost btn--sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    </div>
  );
}
