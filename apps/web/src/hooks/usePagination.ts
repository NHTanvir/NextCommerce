import { useMemo } from 'react';

interface PaginationConfig {
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  siblingCount?: number;
}

type PaginationItem = number | '...';

export function usePagination({
  totalItems,
  itemsPerPage,
  currentPage,
  siblingCount = 1,
}: PaginationConfig): { pages: PaginationItem[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const pages = useMemo<PaginationItem[]>(() => {
    if (totalPages <= 5 + siblingCount * 2) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSibling = Math.max(currentPage - siblingCount, 1);
    const rightSibling = Math.min(currentPage + siblingCount, totalPages);

    const showLeftEllipsis = leftSibling > 2;
    const showRightEllipsis = rightSibling < totalPages - 1;

    const result: PaginationItem[] = [1];

    if (showLeftEllipsis) result.push('...');
    for (let p = leftSibling; p <= rightSibling; p++) {
      if (p !== 1 && p !== totalPages) result.push(p);
    }
    if (showRightEllipsis) result.push('...');
    result.push(totalPages);

    return result;
  }, [totalItems, itemsPerPage, currentPage, siblingCount, totalPages]);

  return { pages, totalPages };
}
