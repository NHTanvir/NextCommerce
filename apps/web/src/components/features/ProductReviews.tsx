'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import {
  useGetReviewsQuery,
  useGetRatingDistributionQuery,
  useCreateReviewMutation,
  useDeleteReviewMutation,
} from '@/store/api/reviews.api';
import styles from './ProductReviews.module.scss';

interface Props {
  productId: string;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const display = onChange ? (hovered || value) : value;
  return (
    <div className={styles.stars} aria-label={`${value} stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.star} ${n <= display ? styles.starFilled : ''}`}
          onClick={() => onChange?.(n)}
          onMouseEnter={() => onChange && setHovered(n)}
          onMouseLeave={() => onChange && setHovered(0)}
          disabled={!onChange}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function RatingDistributionChart({ productId, total }: { productId: string; total: number }) {
  const { data: dist } = useGetRatingDistributionQuery(productId);
  if (!dist || total === 0) return null;

  return (
    <div className={styles.distribution}>
      <p className={styles.distTitle}>Rating breakdown</p>
      {([5, 4, 3, 2, 1] as const).map((star) => {
        const count = dist[star] ?? 0;
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={star} className={styles.distRow}>
            <span className={styles.distLabel}>{star} ★</span>
            <div className={styles.distBarWrap}>
              <div className={styles.distBar} style={{ width: `${pct}%` }} />
            </div>
            <span className={styles.distCount}>{count}</span>
          </div>
        );
      })}
    </div>
  );
}

export function ProductReviews({ productId }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  const { data: reviews = [], isLoading } = useGetReviewsQuery(productId);
  const [createReview, { isLoading: submitting }] = useCreateReviewMutation();
  const [deleteReview] = useDeleteReviewMutation();

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    try {
      await createReview({ productId, rating, title: title.trim(), body: body.trim() }).unwrap();
      setTitle('');
      setBody('');
      setRating(5);
      setSubmitted(true);
    } catch {
      // ignore
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    await deleteReview({ id, productId });
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>Customer Reviews</h3>
        {reviews.length > 0 && (
          <div className={styles.summary}>
            <StarRating value={Math.round(avgRating)} />
            <span className={styles.avgText}>
              {avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})
            </span>
          </div>
        )}
      </div>

      {reviews.length > 0 && (
        <RatingDistributionChart productId={productId} total={reviews.length} />
      )}

      {isLoading && <p className={styles.loading}>Loading reviews…</p>}

      {!isLoading && reviews.length === 0 && (
        <p className={styles.empty}>No reviews yet. Be the first to review this product!</p>
      )}

      <div className={styles.list}>
        {reviews.map((r) => {
          const authorName = r.user?.name ?? 'Anonymous';
          const canDelete = user && (user.role === 'admin' || user.id === r.userId);
          return (
            <div key={r.id} className={styles.review}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewMeta}>
                  <span className={styles.reviewAuthor}>{authorName}</span>
                  <StarRating value={r.rating} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <time className={styles.reviewDate}>
                    {new Date(r.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </time>
                  {canDelete && (
                    <button
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(r.id)}
                      aria-label="Delete review"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              {r.title && <p className={styles.reviewTitle}>{r.title}</p>}
              <p className={styles.reviewBody}>{r.body}</p>
            </div>
          );
        })}
      </div>

      {user && !submitted && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h4 className={styles.formTitle}>Write a Review</h4>
          <div className={styles.ratingSelect}>
            <span className={styles.ratingLabel}>Your rating</span>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <input
            className={styles.input}
            placeholder="Review title (e.g. Great product!)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            minLength={3}
          />
          <textarea
            className={styles.textarea}
            placeholder="Share your thoughts about this product…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            required
            minLength={10}
          />
          <button
            type="submit"
            className="btn btn--primary"
            disabled={submitting || !title.trim() || !body.trim()}
          >
            {submitting ? 'Submitting…' : 'Submit Review'}
          </button>
        </form>
      )}

      {submitted && (
        <p className={styles.successMsg}>Thanks for your review!</p>
      )}

      {!user && (
        <p className={styles.loginPrompt}>
          <a href="/auth/login">Sign in</a> to write a review.
        </p>
      )}
    </section>
  );
}
