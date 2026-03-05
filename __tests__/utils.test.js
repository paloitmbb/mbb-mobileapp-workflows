import { formatCurrency, formatDate, maskAccountNumber } from '../src/lib/utils';

describe('Utils', () => {
  describe('formatCurrency', () => {
    it('should format number to MYR currency', () => {
      expect(formatCurrency(100)).toBe('RM 100.00');
    });

    it('should handle decimal values', () => {
      expect(formatCurrency(99.9)).toBe('RM 99.90');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('RM 0.00');
    });

    it('should handle string numbers', () => {
      expect(formatCurrency('1234.5')).toBe('RM 1234.50');
    });
  });

  describe('formatDate', () => {
    it('should format date to DD/MM/YYYY', () => {
      const date = new Date(2026, 2, 4); // March 4, 2026
      expect(formatDate(date)).toBe('04/03/2026');
    });

    it('should handle date strings', () => {
      expect(formatDate('2026-01-15')).toBe('15/01/2026');
    });
  });

  describe('maskAccountNumber', () => {
    it('should mask account number showing last 4 digits', () => {
      expect(maskAccountNumber('1234567890')).toBe('******7890');
    });

    it('should handle short account numbers', () => {
      expect(maskAccountNumber('12')).toBe('12');
    });

    it('should handle null/undefined', () => {
      expect(maskAccountNumber(null)).toBeNull();
      expect(maskAccountNumber(undefined)).toBeUndefined();
    });

    it('should handle exactly 4 characters', () => {
      expect(maskAccountNumber('1234')).toBe('1234');
    });
  });
});
