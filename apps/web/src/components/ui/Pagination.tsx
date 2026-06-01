'use client';

import { usePagination } from '@/hooks/usePagination';
import styles from './Pagination.module.scss';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  siblingCount = 1,
}: PaginationProps) {
  const { pages, totalPages } = usePagination({
    totalItems,
    itemsPerPage,
    currentPage,
    siblingCount,
  });

  if (totalPages <= 1) return null;

  return (
    <nav className={styles.nav} aria-label="Pagination">
      <button
        className={styles.btn}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        ←
      </button>

      {pages.map((page, idx) =>
        page === '...' ? (
          <span key={`ellipsis-${idx}`} className={styles.ellipsis}>
            …
          </span>
        ) : (
          <button
            key={page}
            className={`${styles.btn} ${page === currentPage ? styles.active : ''}`}
            onClick={() => onPageChange(page as number)}
            aria-label={`Page ${page}`}
            aria-current={page === currentPage ? 'page' : undefined}
          >
            {page}
          </button>
        ),
      )}

      <button
        className={styles.btn}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        →
      </button>
    </nav>
  );
}
