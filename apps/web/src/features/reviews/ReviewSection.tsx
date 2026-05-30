'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/store/hooks';
import { useGetReviewsQuery, useCreateReviewMutation } from '@/store/api/reviews.api';
import styles from './ReviewSection.module.scss';

interface Props {
  productId: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.stars}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  );
}

export function ReviewSection({ productId }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  const { data: reviews = [] } = useGetReviewsQuery(productId);
  const [createReview, { isLoading }] = useCreateReviewMutation();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rating) return;
    await createReview({ productId, rating, comment });
    setRating(0);
    setComment('');
    setSubmitted(true);
  }

  return (
    <div className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>Customer Reviews</h2>
        {reviews.length > 0 && (
          <div className={styles.avgRating}>
            <span>{avgRating.toFixed(1)}</span>
            <span className={styles.star}>★</span>
            <span>({reviews.length})</span>
          </div>
        )}
      </div>

      {reviews.length === 0 && (
        <p className={styles.empty}>No reviews yet — be the first!</p>
      )}

      <div className={styles.reviews}>
        {reviews.map((r) => (
          <div key={r.id} className={styles.review}>
            <div className={styles.reviewMeta}>
              <span className={styles.reviewAuthor}>{r.userName}</span>
              <span className={styles.reviewDate}>
                {new Date(r.createdAt).toLocaleDateString()}
              </span>
            </div>
            <Stars rating={r.rating} />
            {r.comment && <p className={styles.reviewComment}>{r.comment}</p>}
          </div>
        ))}
      </div>

      {user ? (
        submitted ? (
          <p className={styles.empty} style={{ color: 'var(--color-success)' }}>
            ✓ Review submitted!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <h3 className={styles.formTitle}>Write a Review</h3>
            <div className={styles.ratingInput}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={styles.starBtn}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  aria-label={`Rate ${star} stars`}
                >
                  {star <= (hoverRating || rating) ? '★' : '☆'}
                </button>
              ))}
            </div>
            <textarea
              className={styles.textarea}
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <button
              type="submit"
              className="btn btn--primary"
              disabled={!rating || isLoading}
              style={{ alignSelf: 'flex-start' }}
            >
              {isLoading ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        )
      ) : (
        <div className={styles.loginPrompt}>
          <Link href="/auth/login">Sign in</Link> to leave a review
        </div>
      )}
    </div>
  );
}
