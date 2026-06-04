'use client';

import { useAppSelector } from '@/store/hooks';
import { useGetReviewVotesQuery, useVoteReviewMutation } from '@/store/api/reviews.api';
import styles from './ReviewHelpfulness.module.scss';

interface Props {
  reviewId: string;
}

export function ReviewHelpfulness({ reviewId }: Props) {
  const user = useAppSelector((s) => s.auth.user);
  const { data: votes } = useGetReviewVotesQuery(reviewId);
  const [vote, { isLoading }] = useVoteReviewMutation();

  if (!votes && !user) return null;

  const helpful = votes?.helpfulCount ?? 0;
  const notHelpful = votes?.notHelpfulCount ?? 0;
  const total = helpful + notHelpful;

  return (
    <div className={styles.wrap}>
      <span className={styles.label}>
        {total > 0
          ? `${helpful} of ${total} found this helpful`
          : 'Was this helpful?'}
      </span>
      {user && (
        <div className={styles.buttons}>
          <button
            className={styles.voteBtn}
            onClick={() => vote({ reviewId, isHelpful: true })}
            disabled={isLoading}
            title="Yes, helpful"
          >
            👍 {helpful > 0 && <span>{helpful}</span>}
          </button>
          <button
            className={styles.voteBtn}
            onClick={() => vote({ reviewId, isHelpful: false })}
            disabled={isLoading}
            title="Not helpful"
          >
            👎 {notHelpful > 0 && <span>{notHelpful}</span>}
          </button>
        </div>
      )}
    </div>
  );
}
