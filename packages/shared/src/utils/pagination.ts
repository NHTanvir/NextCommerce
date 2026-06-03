export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export function buildPaginationMeta(page: number, limit: number, total: number): PaginationMeta {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;
  return {
    page,
    limit,
    total,
    totalPages,
    hasPreviousPage: page > 1,
    hasNextPage: page < totalPages,
  };
}

export function buildPaginatedResponse<T>(data: T[], page: number, limit: number, total: number): PaginatedResponse<T> {
  return { data, meta: buildPaginationMeta(page, limit, total) };
}

export function clampPage(page: number, totalPages: number): number {
  if (totalPages === 0) return 1;
  return Math.min(Math.max(1, page), totalPages);
}

export function buildPageRange(currentPage: number, totalPages: number, delta = 2): number[] {
  const range: number[] = [];
  const start = Math.max(1, currentPage - delta);
  const end = Math.min(totalPages, currentPage + delta);
  for (let i = start; i <= end; i++) range.push(i);
  return range;
}
