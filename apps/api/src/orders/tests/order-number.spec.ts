import { toOrderNumber } from '../order-number';

describe('toOrderNumber', () => {
  it('removes hyphens and uppercases the first 8 chars', () => {
    expect(toOrderNumber('abcdef12-3456-7890-1234-567890abcdef')).toBe('ABCDEF12');
  });

  it('handles UUIDs without hyphens', () => {
    expect(toOrderNumber('abcdef123456789012345678901234ef')).toBe('ABCDEF12');
  });

  it('produces 8 character output', () => {
    expect(toOrderNumber('11111111-2222-3333-4444-555555555555')).toHaveLength(8);
  });
});
