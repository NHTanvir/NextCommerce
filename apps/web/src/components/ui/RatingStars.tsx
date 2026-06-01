'use client';

import { useState } from 'react';
import styles from './RatingStars.module.scss';

interface RatingStarsProps {
  value: number;
  max?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function RatingStars({
  value,
  max = 5,
  interactive = false,
  onChange,
  size = 'md',
}: RatingStarsProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const displayValue = hovered ?? value;

  return (
    <div
      className={`${styles.stars} ${styles[size]} ${interactive ? styles.interactive : ''}`}
      role={interactive ? 'radiogroup' : 'img'}
      aria-label={`Rating: ${value} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= displayValue;
        const half = !filled && starValue - 0.5 <= displayValue;

        return (
          <button
            key={i}
            type="button"
            className={`${styles.star} ${filled ? styles.filled : ''} ${half ? styles.half : ''}`}
            onClick={interactive && onChange ? () => onChange(starValue) : undefined}
            onMouseEnter={interactive ? () => setHovered(starValue) : undefined}
            onMouseLeave={interactive ? () => setHovered(null) : undefined}
            disabled={!interactive}
            aria-label={`${starValue} star${starValue !== 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
