import { formatPrice, formatOrderId, slugify, isTokenExpired } from '../lib/formatters';
import { isTokenExpired as isExpiredFromAuth } from '../lib/auth';

describe('formatPrice', () => {
  it('formats cents to dollar string', () => {
    expect(formatPrice(9999)).toBe('$99.99');
    expect(formatPrice(100)).toBe('$1.00');
    expect(formatPrice(0)).toBe('$0.00');
  });

  it('handles large values', () => {
    expect(formatPrice(100000)).toBe('$1,000.00');
  });
});

describe('formatOrderId', () => {
  it('takes last 8 chars and uppercases', () => {
    expect(formatOrderId('abc123def456')).toBe('#DEF456');
    // Only last 8
    const id = 'a'.repeat(20);
    expect(formatOrderId(id)).toBe('#AAAAAAAA');
  });
});

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Air Max 90')).toBe('air-max-90');
  });

  it('handles special characters', () => {
    expect(slugify('Nike Ultra-Boost!')).toBe('nike-ultra-boost');
  });

  it('trims leading/trailing hyphens', () => {
    expect(slugify('--test--')).toBe('test');
  });
});

describe('isTokenExpired (lib/auth)', () => {
  it('returns true for malformed token', () => {
    expect(isExpiredFromAuth('not-a-token')).toBe(true);
  });

  it('returns true for expired token (exp in the past)', () => {
    // Create a fake JWT with past expiry
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 3600 }));
    const fakeToken = `header.${payload}.sig`;
    expect(isExpiredFromAuth(fakeToken)).toBe(true);
  });

  it('returns false for valid token (exp in the future)', () => {
    const payload = btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 }));
    const fakeToken = `header.${payload}.sig`;
    expect(isExpiredFromAuth(fakeToken)).toBe(false);
  });
});
