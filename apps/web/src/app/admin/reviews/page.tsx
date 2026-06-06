'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useGetAdminReviewsQuery, useDeleteReviewMutation } from '@/store/api/reviews.api';
import styles from './reviews.module.scss';

const STARS = [1, 2, 3, 4, 5] as const;

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span>
      {STARS.map((n) => (
        <span key={n} style={{ color: n <= rating ? '#f59e0b' : '#374151', fontSize: '1rem' }}>★</span>
      ))}
    </span>
  );
}

function ExpandedReview({ review, onClose, onDelete }: { review: any; onClose: () => void; onDelete: () => void }) {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <StarDisplay rating={review.rating} />
            <h3 className={styles.modalTitle}>{review.title}</h3>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalMeta}>
          <span>By {review.user?.name ?? review.userId.slice(0, 8) + '…'}</span>
          <span>·</span>
          <span>{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span>·</span>
          <Link href={`/products/${review.productId}`} className={styles.productLink} target="_blank">
            View Product ↗
          </Link>
        </div>
        <p className={styles.modalBody}>{review.body}</p>
        <div className={styles.modalFooter}>
          <button
            className="btn btn--danger btn--sm"
            onClick={() => { onDelete(); onClose(); }}
          >
            Delete Review
          </button>
          <button className="btn btn--ghost btn--sm" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [page, setPage] = useState(1);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [expandedReview, setExpandedReview] = useState<any | null>(null);
  const limit = 20;

  const { data, isLoading, isFetching } = useGetAdminReviewsQuery({ page, limit });
  const [deleteReview] = useDeleteReviewMutation();

  const allReviews = data?.data ?? [];
  const total = data?.total ?? 0;

  const filtered = filterRating ? allReviews.filter((r) => r.rating === filterRating) : allReviews;
  const totalPages = Math.ceil(total / limit);

  const ratingCounts = STARS.reduce((acc, n) => {
    acc[n] = allReviews.filter((r) => r.rating === n).length;
    return acc;
  }, {} as Record<number, number>);

  const avgRating = allReviews.length
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    : 0;

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this review?')) return;
    await deleteReview({ id, productId: '' });
  };

  return (
    <div className={styles.page}>
      {expandedReview && (
        <ExpandedReview
          review={expandedReview}
          onClose={() => setExpandedReview(null)}
          onDelete={() => handleDelete(expandedReview.id)}
        />
      )}

      <div className={styles.topBar}>
        <div>
          <h1 className={styles.heading}>Reviews</h1>
          <p className={styles.sub}>{total} total review{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {!isLoading && allReviews.length > 0 && (
        <div className={styles.statsRow}>
          <div className={styles.avgBlock}>
            <span className={styles.avgNum}>{avgRating.toFixed(1)}</span>
            <StarDisplay rating={Math.round(avgRating)} />
            <span className={styles.avgLabel}>average</span>
          </div>
          <div className={styles.ratingBars}>
            {[5, 4, 3, 2, 1].map((n) => {
              const count = ratingCounts[n] ?? 0;
              const pct = allReviews.length > 0 ? (count / allReviews.length) * 100 : 0;
              return (
                <button
                  key={n}
                  className={`${styles.ratingBarRow} ${filterRating === n ? styles.ratingBarActive : ''}`}
                  onClick={() => setFilterRating(filterRating === n ? null : n)}
                >
                  <span className={styles.ratingBarLabel}>{n}★</span>
                  <div className={styles.ratingBarTrack}>
                    <div className={styles.ratingBarFill} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={styles.ratingBarCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.filterRow}>
        <button
          className={`${styles.filterChip} ${!filterRating ? styles.filterChipActive : ''}`}
          onClick={() => setFilterRating(null)}
        >
          All
        </button>
        {STARS.map((n) => (
          <button
            key={n}
            className={`${styles.filterChip} ${filterRating === n ? styles.filterChipActive : ''}`}
            onClick={() => setFilterRating(filterRating === n ? null : n)}
          >
            {'★'.repeat(n)} ({ratingCounts[n] ?? 0})
          </button>
        ))}
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
                  <th>Review</th>
                  <th>Author</th>
                  <th>Product</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.emptyRow}>No reviews match this filter.</td>
                  </tr>
                )}
                {filtered.map((r) => (
                  <tr key={r.id} className={isFetching ? styles.fading : ''}>
                    <td><StarDisplay rating={r.rating} /></td>
                    <td>
                      <button className={styles.reviewTitleBtn} onClick={() => setExpandedReview(r)}>
                        <span className={styles.reviewTitleText}>{r.title}</span>
                        <span className={styles.reviewBodyPreview}>{r.body.slice(0, 60)}{r.body.length > 60 ? '…' : ''}</span>
                      </button>
                    </td>
                    <td className={styles.author}>{r.user?.name ?? r.userId.slice(0, 8) + '…'}</td>
                    <td className={styles.mono}>{r.productId.slice(0, 8)}…</td>
                    <td className={styles.date}>
                      {new Date(r.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric',
                      })}
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button className={styles.viewBtn} onClick={() => setExpandedReview(r)}>
                          View
                        </button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(r.id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && !filterRating && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                ← Prev
              </button>
              <span className={styles.pageInfo}>Page {page} of {totalPages}</span>
              <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
