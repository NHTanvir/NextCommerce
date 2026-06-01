import { renderHook } from '@testing-library/react';
import { usePagination } from '../hooks/usePagination';

describe('usePagination', () => {
  it('returns all pages when total pages are few', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 50, itemsPerPage: 10, currentPage: 1 }),
    );
    expect(result.current.totalPages).toBe(5);
    expect(result.current.pages).toEqual([1, 2, 3, 4, 5]);
  });

  it('returns totalPages of 1 when no items', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 0, itemsPerPage: 10, currentPage: 1 }),
    );
    expect(result.current.totalPages).toBe(1);
  });

  it('includes ellipsis when pages exceed visible range', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 200, itemsPerPage: 10, currentPage: 10 }),
    );
    expect(result.current.pages).toContain('...');
    expect(result.current.pages[0]).toBe(1);
    expect(result.current.pages[result.current.pages.length - 1]).toBe(20);
  });

  it('shows correct sibling range around current page', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 200, itemsPerPage: 10, currentPage: 10, siblingCount: 1 }),
    );
    const pages = result.current.pages;
    expect(pages).toContain(9);
    expect(pages).toContain(10);
    expect(pages).toContain(11);
  });

  it('no leading ellipsis when current page is near start', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 200, itemsPerPage: 10, currentPage: 2 }),
    );
    const pages = result.current.pages;
    expect(pages[0]).toBe(1);
    expect(pages[1]).not.toBe('...');
  });

  it('no trailing ellipsis when current page is near end', () => {
    const { result } = renderHook(() =>
      usePagination({ totalItems: 200, itemsPerPage: 10, currentPage: 19 }),
    );
    const pages = result.current.pages;
    expect(pages[pages.length - 1]).toBe(20);
    expect(pages[pages.length - 2]).not.toBe('...');
  });
});
