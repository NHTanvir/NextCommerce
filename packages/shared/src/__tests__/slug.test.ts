import { createSlug, isValidSlug } from '../utils/slug';

describe('createSlug', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(createSlug('Air Max 90')).toBe('air-max-90');
  });

  it('removes special characters', () => {
    expect(createSlug('Nike Ultra-Boost!')).toBe('nike-ultra-boost');
  });

  it('handles accented characters', () => {
    expect(createSlug('Été Chaussures')).toBe('ete-chaussures');
  });

  it('collapses multiple spaces/hyphens', () => {
    expect(createSlug('  Air   Max  ')).toBe('air-max');
  });

  it('trims leading/trailing hyphens', () => {
    expect(createSlug('--test--')).toBe('test');
  });
});

describe('isValidSlug', () => {
  it('accepts valid slugs', () => {
    expect(isValidSlug('air-max-90')).toBe(true);
    expect(isValidSlug('nike')).toBe(true);
    expect(isValidSlug('ultra-boost-5')).toBe(true);
  });

  it('rejects slugs with uppercase', () => {
    expect(isValidSlug('Air-Max')).toBe(false);
  });

  it('rejects slugs with consecutive hyphens', () => {
    expect(isValidSlug('air--max')).toBe(false);
  });

  it('rejects slugs starting/ending with hyphens', () => {
    expect(isValidSlug('-air-max')).toBe(false);
    expect(isValidSlug('air-max-')).toBe(false);
  });
});
