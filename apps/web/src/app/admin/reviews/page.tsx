'use client';

import { useState } from 'react';
import { useGetAdminReviewsQuery, useDeleteReviewMutation } from '@/store/api/reviews.api';
import styles from './reviews.module.scss';

const STARS = [1, 2, 3, 4, 5] as const;

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span aria-label={`${rating} stars`}>
      {STARS.map((n) => (
        <span key={n} style={{ color: n <= rating ? '#f59e0b' : '#374151' }}>★</span>
      ))}
    </span>
  );
}

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, isFetching } = useGetAdminReviewsQuery({ page, limit });
  const [deleteReview] = useDeleteReviewMutation();

  const reviews = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this review?')) return;
    await deleteReview({ id, productId: '' });
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div>
          <h1 className={styles.heading}>Reviews</h1>
          <p className={styles.sub}>{total} total review{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>Loading reviews…</div>
      ) : (
        <>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Rating</th>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Product ID</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} className={isFetching ? styles.fading : ''}>
                    <td><StarDisplay rating={r.rating} /></td>
                    <td className={styles.reviewTitle} title={r.body}>{r.title}</td>
                    <td>{r.user?.name ?? r.userId.slice(0, 8) + '…'}</td>
                    <td className={styles.mono}>{r.productId.slice(0, 12)}…</td>
                    <td className={styles.date}>
                      {new Date(r.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDelete(r.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageBtn}
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Prev
              </button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button
                className={styles.pageBtn}
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
