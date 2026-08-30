import {
  addCalendarMonths,
  evaluateWarranty,
  getIstanbulBusinessDate,
  InvalidCalendarDateError,
} from './warranty-policy';

describe('warranty policy', () => {
  it('includes the warranty expiry day', () => {
    const result = evaluateWarranty('2024-08-30', '2026-08-30');

    expect(result.isFuturePurchase).toBe(false);
    expect(result.isWithinWarranty).toBe(true);
    expect(result.warrantyExpiresAt.toISOString()).toBe(
      '2026-08-30T00:00:00.000Z',
    );
  });

  it('rejects the day after warranty expiry', () => {
    const result = evaluateWarranty('2024-08-30', '2026-08-31');

    expect(result.isWithinWarranty).toBe(false);
  });

  it('clamps leap day to the final day of the target February', () => {
    expect(addCalendarMonths('2024-02-29', 24)).toBe('2026-02-28');
    expect(addCalendarMonths('2024-02-29', 48)).toBe('2028-02-29');
  });

  it('marks a future purchase date', () => {
    const result = evaluateWarranty('2026-08-31', '2026-08-30');

    expect(result.isFuturePurchase).toBe(true);
  });

  it('rejects an invalid calendar date', () => {
    expect(() => evaluateWarranty('2025-02-30', '2026-08-30')).toThrow(
      InvalidCalendarDateError,
    );
  });

  it('uses the Europe/Istanbul date at the UTC day boundary', () => {
    expect(getIstanbulBusinessDate(new Date('2025-12-31T21:30:00.000Z'))).toBe(
      '2026-01-01',
    );
  });
});
