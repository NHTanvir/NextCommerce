'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useGetMyReviewsQuery, useDeleteReviewMutation } from '@/store/api/reviews.api';
import styles from './reviews.module.scss';

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className={styles.stars} aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
    </span>
  );
}

export default function MyReviewsPage() {
  const { data: reviews = [], isLoading } = useGetMyReviewsQuery();
  const [deleteReview, { isLoading: deleting }] = useDeleteReviewMutation();
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = async (id: string, productId: string) => {
    await deleteReview({ id, productId });
    setConfirmDelete(null);
  };

  return (
    <div className={`container ${styles.page}`}>
      <div className={styles.header}>
        <Link href="/account/orders" className={styles.backLink}>← My Account</Link>
        <h1 className={styles.title}>My Reviews</h1>
        <p className={styles.sub}>{reviews.length} review{reviews.length !== 1 ? 's' : ''} submitted</p>
      </div>

      {isLoading && <p className={styles.empty}>Loading reviews…</p>}

      {!isLoading && reviews.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyIcon}>⭐</p>
          <p className={styles.emptyTitle}>No reviews yet</p>
          <p className={styles.emptySub}>After receiving orders, you can leave product reviews.</p>
          <Link href="/account/orders" className="btn btn--primary">View My Orders</Link>
        </div>
      )}

      <div className={styles.list}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardMeta}>
                <StarDisplay rating={review.rating} />
                <span className={styles.date}>
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              {confirmDelete === review.id ? (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmText}>Delete this review?</span>
                  <button
                    className={styles.confirmYes}
                    onClick={() => handleDelete(review.id, review.productId)}
                    disabled={deleting}
                  >
                    Yes, delete
                  </button>
                  <button
                    className={styles.confirmNo}
                    onClick={() => setConfirmDelete(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className={styles.deleteBtn}
                  onClick={() => setConfirmDelete(review.id)}
                >
                  Delete
                </button>
              )}
            </div>

            {review.title && <h3 className={styles.reviewTitle}>{review.title}</h3>}
            <p className={styles.reviewBody}>{review.body}</p>

            {(review as any).product && (
              <Link
                href={`/products/${(review as any).product.slug}`}
                className={styles.productLink}
              >
                {(review as any).product.title}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
