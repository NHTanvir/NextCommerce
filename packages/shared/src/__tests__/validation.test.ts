import {
  isValidEmail,
  isStrongPassword,
  isValidPhone,
  isValidPostalCode,
  sanitizeString,
  isValidUUID,
} from '../utils/validation';

describe('validation utils', () => {
  describe('isValidEmail', () => {
    it('returns true for valid email', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('user+tag@sub.domain.co')).toBe(true);
    });
    it('returns false for invalid email', () => {
      expect(isValidEmail('not-an-email')).toBe(false);
      expect(isValidEmail('@no-local.com')).toBe(false);
      expect(isValidEmail('no-at-sign')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('returns true for password with uppercase, lowercase, number', () => {
      expect(isStrongPassword('Secure1234')).toBe(true);
    });
    it('returns false for short password', () => {
      expect(isStrongPassword('Abc1')).toBe(false);
    });
    it('returns false if missing uppercase', () => {
      expect(isStrongPassword('secure1234')).toBe(false);
    });
    it('returns false if missing number', () => {
      expect(isStrongPassword('SecurePass')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('returns true for valid international phone', () => {
      expect(isValidPhone('+1-555-555-5555')).toBe(true);
      expect(isValidPhone('+8801711123456')).toBe(true);
    });
    it('returns false for too short number', () => {
      expect(isValidPhone('123')).toBe(false);
    });
  });

  describe('isValidPostalCode', () => {
    it('validates US zip codes', () => {
      expect(isValidPostalCode('10001', 'US')).toBe(true);
      expect(isValidPostalCode('10001-1234', 'US')).toBe(true);
      expect(isValidPostalCode('AAAAA', 'US')).toBe(false);
    });

    it('validates BD postal codes', () => {
      expect(isValidPostalCode('1207', 'BD')).toBe(true);
      expect(isValidPostalCode('99999', 'BD')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('trims whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });
    it('removes angle brackets', () => {
      expect(sanitizeString('<script>alert(1)</script>')).toBe('scriptalert(1)/script');
    });
    it('truncates to maxLength', () => {
      expect(sanitizeString('a'.repeat(100), 10)).toHaveLength(10);
    });
  });

  describe('isValidUUID', () => {
    it('returns true for valid UUID v4', () => {
      expect(isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
    });
    it('returns false for invalid UUID', () => {
      expect(isValidUUID('not-a-uuid')).toBe(false);
      expect(isValidUUID('550e8400-e29b-41d4')).toBe(false);
    });
  });
});
