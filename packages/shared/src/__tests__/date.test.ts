import {
  formatISODate,
  formatRelativeDate,
  addDays,
  isSameDay,
  startOfDay,
  endOfDay,
} from '../utils/date';

describe('date utils', () => {
  describe('formatISODate', () => {
    it('formats ISO string to readable date', () => {
      const result = formatISODate('2024-03-15T10:00:00Z');
      expect(result).toMatch(/March 15, 2024/);
    });
  });

  describe('formatRelativeDate', () => {
    it('returns "just now" for very recent date', () => {
      const now = new Date().toISOString();
      expect(formatRelativeDate(now)).toBe('just now');
    });

    it('returns minutes ago for a minute-old date', () => {
      const twoMinsAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
      expect(formatRelativeDate(twoMinsAgo)).toMatch(/2 minutes ago/);
    });

    it('returns hours ago for an hour-old date', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeDate(twoHoursAgo)).toMatch(/2 hours ago/);
    });

    it('returns days ago for a 3-day-old date', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeDate(threeDaysAgo)).toMatch(/3 days ago/);
    });
  });

  describe('addDays', () => {
    it('adds days to a date', () => {
      const base = new Date('2024-01-01');
      const result = addDays(base, 5);
      expect(result.getDate()).toBe(6);
    });

    it('handles negative days', () => {
      const base = new Date('2024-01-10');
      const result = addDays(base, -3);
      expect(result.getDate()).toBe(7);
    });

    it('does not mutate the input date', () => {
      const base = new Date('2024-01-01');
      addDays(base, 5);
      expect(base.getDate()).toBe(1);
    });
  });

  describe('isSameDay', () => {
    it('returns true for same day at different times', () => {
      const a = new Date('2024-03-15T08:00:00');
      const b = new Date('2024-03-15T22:00:00');
      expect(isSameDay(a, b)).toBe(true);
    });

    it('returns false for different days', () => {
      const a = new Date('2024-03-15');
      const b = new Date('2024-03-16');
      expect(isSameDay(a, b)).toBe(false);
    });
  });

  describe('startOfDay / endOfDay', () => {
    it('sets time to 00:00:00 for startOfDay', () => {
      const d = startOfDay(new Date('2024-03-15T14:30:00'));
      expect(d.getHours()).toBe(0);
      expect(d.getMinutes()).toBe(0);
      expect(d.getSeconds()).toBe(0);
    });

    it('sets time to 23:59:59 for endOfDay', () => {
      const d = endOfDay(new Date('2024-03-15T08:00:00'));
      expect(d.getHours()).toBe(23);
      expect(d.getMinutes()).toBe(59);
      expect(d.getSeconds()).toBe(59);
    });
  });
});
