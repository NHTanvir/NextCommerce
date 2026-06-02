import {
  truncate,
  capitalize,
  titleCase,
  pluralize,
  maskEmail,
  formatOrderId,
  formatPhoneNumber,
} from '../utils/formatters';

describe('truncate', () => {
  it('returns text unchanged if within limit', () => {
    expect(truncate('Hello', 10)).toBe('Hello');
  });

  it('truncates text and appends ellipsis', () => {
    expect(truncate('Hello World', 8)).toBe('Hello W…');
  });

  it('uses custom ellipsis', () => {
    expect(truncate('Hello World', 8, '...')).toBe('Hello...');
  });
});

describe('capitalize', () => {
  it('capitalizes first letter and lowercases rest', () => {
    expect(capitalize('HELLO')).toBe('Hello');
    expect(capitalize('hello')).toBe('Hello');
  });

  it('returns empty string unchanged', () => {
    expect(capitalize('')).toBe('');
  });
});

describe('titleCase', () => {
  it('converts each word to title case', () => {
    expect(titleCase('hello world')).toBe('Hello World');
    expect(titleCase('the QUICK brown FOX')).toBe('The Quick Brown Fox');
  });
});

describe('pluralize', () => {
  it('returns singular for count of 1', () => {
    expect(pluralize(1, 'item')).toBe('1 item');
  });

  it('returns plural for count !== 1', () => {
    expect(pluralize(3, 'item')).toBe('3 items');
    expect(pluralize(0, 'review')).toBe('0 reviews');
  });

  it('uses custom plural form', () => {
    expect(pluralize(2, 'ox', 'oxen')).toBe('2 oxen');
  });
});

describe('maskEmail', () => {
  it('masks middle of local part', () => {
    expect(maskEmail('john@example.com')).toBe('jo**@example.com');
  });

  it('handles short local part', () => {
    expect(maskEmail('j@example.com')).toBe('j@example.com');
  });
});

describe('formatOrderId', () => {
  it('returns last 8 chars uppercased with # prefix', () => {
    expect(formatOrderId('abc-def-12345678')).toBe('#12345678');
  });
});

describe('formatPhoneNumber', () => {
  it('formats 10-digit US number', () => {
    expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
  });

  it('formats 11-digit US number with country code', () => {
    expect(formatPhoneNumber('15551234567')).toBe('+1 (555) 123-4567');
  });

  it('returns unformatted number for unknown length', () => {
    expect(formatPhoneNumber('12345')).toBe('12345');
  });
});
