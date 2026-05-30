import { formatCents, parseDollars, applyDiscount } from '../utils/currency';

describe('formatCents', () => {
  it('formats 999 cents as $9.99', () => {
    expect(formatCents(999)).toBe('$9.99');
  });

  it('formats 0 cents as $0.00', () => {
    expect(formatCents(0)).toBe('$0.00');
  });

  it('formats large values with commas', () => {
    expect(formatCents(100000)).toBe('$1,000.00');
  });
});

describe('parseDollars', () => {
  it('parses "$9.99" as 999', () => {
    expect(parseDollars('$9.99')).toBe(999);
  });

  it('parses "10.00" as 1000', () => {
    expect(parseDollars('10.00')).toBe(1000);
  });

  it('handles values with commas', () => {
    expect(parseDollars('$1,000.00')).toBe(100000);
  });
});

describe('applyDiscount', () => {
  it('applies 10% discount to 10000 cents → 9000', () => {
    expect(applyDiscount(10000, 10)).toBe(9000);
  });

  it('applies 0% discount unchanged', () => {
    expect(applyDiscount(9999, 0)).toBe(9999);
  });

  it('applies 100% discount → 0', () => {
    expect(applyDiscount(9999, 100)).toBe(0);
  });

  it('rounds fractional cents', () => {
    expect(applyDiscount(999, 50)).toBe(500);
  });
});
