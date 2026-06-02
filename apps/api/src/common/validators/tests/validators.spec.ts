import { IsFutureDateConstraint } from '../is-future-date.validator';
import { IsStrongPasswordConstraint } from '../is-strong-password.validator';

describe('IsFutureDateConstraint', () => {
  const validator = new IsFutureDateConstraint();

  it('returns true for a future date string', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    expect(validator.validate(future)).toBe(true);
  });

  it('returns false for a past date string', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    expect(validator.validate(past)).toBe(false);
  });

  it('returns false for invalid date string', () => {
    expect(validator.validate('not-a-date')).toBe(false);
  });

  it('returns false for non-string/non-date value', () => {
    expect(validator.validate(12345)).toBe(false);
    expect(validator.validate(null)).toBe(false);
  });

  it('returns true for future Date object', () => {
    expect(validator.validate(new Date(Date.now() + 3600000))).toBe(true);
  });
});

describe('IsStrongPasswordConstraint', () => {
  const validator = new IsStrongPasswordConstraint();

  it('returns true for a valid strong password', () => {
    expect(validator.validate('Secure1Pass')).toBe(true);
  });

  it('returns false for password without uppercase', () => {
    expect(validator.validate('secure1pass')).toBe(false);
  });

  it('returns false for password without lowercase', () => {
    expect(validator.validate('SECURE1PASS')).toBe(false);
  });

  it('returns false for password without digit', () => {
    expect(validator.validate('SecurePass!')).toBe(false);
  });

  it('returns false for password shorter than 8 chars', () => {
    expect(validator.validate('Sec1!')).toBe(false);
  });

  it('returns false for non-string value', () => {
    expect(validator.validate(123)).toBe(false);
  });
});
