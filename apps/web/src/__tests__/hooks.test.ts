import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../hooks/useDebounce';

jest.useFakeTimers();

describe('useDebounce', () => {
  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300));
    expect(result.current).toBe('hello');
  });

  it('delays value update by specified delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    });
    rerender({ value: 'ab' });
    expect(result.current).toBe('a');
    act(() => { jest.advanceTimersByTime(300); });
    expect(result.current).toBe('ab');
  });

  it('only updates to last value when called rapidly', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: '' },
    });
    rerender({ value: 'a' });
    act(() => { jest.advanceTimersByTime(100); });
    rerender({ value: 'ab' });
    act(() => { jest.advanceTimersByTime(100); });
    rerender({ value: 'abc' });
    expect(result.current).toBe('');
    act(() => { jest.advanceTimersByTime(300); });
    expect(result.current).toBe('abc');
  });
});
