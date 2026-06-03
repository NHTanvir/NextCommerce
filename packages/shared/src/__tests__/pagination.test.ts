import {
  buildPaginationMeta,
  buildPaginatedResponse,
  clampPage,
  buildPageRange,
} from '../utils/pagination';

describe('buildPaginationMeta', () => {
  it('computes totalPages correctly', () => {
    const meta = buildPaginationMeta(1, 10, 95);
    expect(meta.totalPages).toBe(10);
  });

  it('sets hasPreviousPage false on first page', () => {
    expect(buildPaginationMeta(1, 10, 50).hasPreviousPage).toBe(false);
  });

  it('sets hasNextPage false on last page', () => {
    expect(buildPaginationMeta(5, 10, 50).hasNextPage).toBe(false);
  });

  it('sets both hasPreviousPage and hasNextPage on middle page', () => {
    const meta = buildPaginationMeta(3, 10, 100);
    expect(meta.hasPreviousPage).toBe(true);
    expect(meta.hasNextPage).toBe(true);
  });

  it('handles zero total', () => {
    const meta = buildPaginationMeta(1, 10, 0);
    expect(meta.totalPages).toBe(0);
    expect(meta.hasNextPage).toBe(false);
  });
});

describe('buildPaginatedResponse', () => {
  it('wraps data with meta', () => {
    const result = buildPaginatedResponse([1, 2, 3], 1, 10, 3);
    expect(result.data).toEqual([1, 2, 3]);
    expect(result.meta.total).toBe(3);
    expect(result.meta.totalPages).toBe(1);
  });
});

describe('clampPage', () => {
  it('clamps below 1', () => {
    expect(clampPage(0, 5)).toBe(1);
    expect(clampPage(-3, 5)).toBe(1);
  });

  it('clamps above totalPages', () => {
    expect(clampPage(10, 5)).toBe(5);
  });

  it('returns 1 when totalPages is 0', () => {
    expect(clampPage(1, 0)).toBe(1);
  });
});

describe('buildPageRange', () => {
  it('returns range around current page', () => {
    expect(buildPageRange(5, 10, 2)).toEqual([3, 4, 5, 6, 7]);
  });

  it('clamps to start', () => {
    expect(buildPageRange(1, 10, 2)).toEqual([1, 2, 3]);
  });

  it('clamps to end', () => {
    expect(buildPageRange(10, 10, 2)).toEqual([8, 9, 10]);
  });
});
