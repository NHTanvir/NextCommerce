import { BadRequestException } from '@nestjs/common';
import { ParsePositiveIntPipe } from '../parse-positive-int.pipe';
import { ParseUUIDPipe } from '../parse-uuid.pipe';
import { ParseEnumPipe } from '../parse-enum.pipe';

enum TestStatus {
  Active = 'active',
  Inactive = 'inactive',
  Pending = 'pending',
}

describe('Custom Pipes', () => {
  describe('ParsePositiveIntPipe', () => {
    const pipe = new ParsePositiveIntPipe();

    it('parses valid positive integer string', () => {
      expect(pipe.transform('42')).toBe(42);
    });

    it('throws for zero', () => {
      expect(() => pipe.transform('0')).toThrow(BadRequestException);
    });

    it('throws for negative number', () => {
      expect(() => pipe.transform('-5')).toThrow(BadRequestException);
    });

    it('throws for non-numeric string', () => {
      expect(() => pipe.transform('abc')).toThrow(BadRequestException);
    });

    it('throws for float string', () => {
      expect(() => pipe.transform('3.14')).toThrow(BadRequestException);
    });
  });

  describe('ParseUUIDPipe', () => {
    const pipe = new ParseUUIDPipe();

    it('passes valid UUID unchanged', () => {
      const uuid = '550e8400-e29b-41d4-a716-446655440000';
      expect(pipe.transform(uuid)).toBe(uuid);
    });

    it('is case-insensitive', () => {
      const uuid = '550E8400-E29B-41D4-A716-446655440000';
      expect(pipe.transform(uuid)).toBe(uuid);
    });

    it('throws for invalid UUID', () => {
      expect(() => pipe.transform('not-a-uuid')).toThrow(BadRequestException);
    });

    it('throws for UUID missing segment', () => {
      expect(() => pipe.transform('550e8400-e29b-41d4')).toThrow(BadRequestException);
    });
  });

  describe('ParseEnumPipe', () => {
    const pipe = new ParseEnumPipe(TestStatus);

    it('passes valid enum value', () => {
      expect(pipe.transform('active')).toBe('active');
    });

    it('throws for invalid enum value', () => {
      expect(() => pipe.transform('unknown')).toThrow(BadRequestException);
    });

    it('error message lists valid values', () => {
      try {
        pipe.transform('invalid');
      } catch (e) {
        expect((e as BadRequestException).message).toContain('active');
        expect((e as BadRequestException).message).toContain('inactive');
      }
    });
  });
});
