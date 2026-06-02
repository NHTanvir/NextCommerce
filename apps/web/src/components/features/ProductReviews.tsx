'use client';

import { useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useGetReviewsQuery, useCreateReviewMutation } from '@/store/api/reviews.api';
import styles from './ProductReviews.module.scss';

interface Props {
  productId: string;
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  return (
    <div className={styles.stars} aria-label={`${value} stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`${styles.star} ${n <= value ? styles.starFilled : ''}`}
          onClick={() => onChange?.(n)}
          disabled={!onChange}
          aria-label={`${n} star`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  const { data: reviews = [], isLoading } = useGetReviewsQuery(productId);
  const [createReview, { isLoading: submitting }] = useCreateReviewMutation();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await createReview({ productId, rating, comment }).unwrap();
      setComment('');
      setRating(5);
      setSubmitted(true);
    } catch {
      // ignore — API error handled by RTK
    }
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

      {isLoading && <p className={styles.loading}>Loading reviews…</p>}

      {!isLoading && reviews.length === 0 && (
        <p className={styles.empty}>No reviews yet. Be the first to review this product!</p>
      )}

      <div className={styles.list}>
        {reviews.map((r) => (
          <div key={r.id} className={styles.review}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewMeta}>
                <span className={styles.reviewAuthor}>{r.userName || 'Anonymous'}</span>
                <StarRating value={r.rating} />
              </div>
              <time className={styles.reviewDate}>
                {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </time>
            </div>
            <p className={styles.reviewBody}>{r.comment}</p>
          </div>
        ))}
      </div>

      {user && !submitted && (
        <form className={styles.form} onSubmit={handleSubmit}>
          <h4 className={styles.formTitle}>Write a Review</h4>
          <div className={styles.ratingSelect}>
            <span className={styles.ratingLabel}>Your rating</span>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <textarea
            className={styles.textarea}
            placeholder="Share your thoughts about this product…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            required
            minLength={10}
          />
          <button type="submit" className="btn btn--primary" disabled={submitting || !comment.trim()}>
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
