interface CalendarDate {
  day: number;
  month: number;
  year: number;
}

export interface WarrantyEvaluation {
  isFuturePurchase: boolean;
  isWithinWarranty: boolean;
  purchaseDate: Date;
  warrantyExpiresAt: Date;
}

const ISTANBUL_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'Europe/Istanbul',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export class InvalidCalendarDateError extends Error {
  constructor(value: string) {
    super(`Invalid calendar date: ${value}`);
    this.name = InvalidCalendarDateError.name;
  }
}

export function getIstanbulBusinessDate(now = new Date()): string {
  const parts = ISTANBUL_DATE_FORMATTER.formatToParts(now);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;

  if (year === undefined || month === undefined || day === undefined) {
    throw new Error('Europe/Istanbul business date could not be calculated.');
  }

  return `${year}-${month}-${day}`;
}

export function addCalendarMonths(date: string, months: number): string {
  const source = parseCalendarDate(date);
  const zeroBasedMonthTotal = source.year * 12 + (source.month - 1) + months;
  const targetYear = Math.floor(zeroBasedMonthTotal / 12);
  const targetMonth = modulo(zeroBasedMonthTotal, 12) + 1;
  const targetDay = Math.min(source.day, daysInMonth(targetYear, targetMonth));

  return formatCalendarDate({
    year: targetYear,
    month: targetMonth,
    day: targetDay,
  });
}

export function evaluateWarranty(
  purchaseDateValue: string,
  businessDateValue: string,
): WarrantyEvaluation {
  const purchaseDate = parseCalendarDate(purchaseDateValue);
  const businessDate = parseCalendarDate(businessDateValue);
  const warrantyExpiresAtValue = addCalendarMonths(purchaseDateValue, 24);
  const warrantyExpiresAt = parseCalendarDate(warrantyExpiresAtValue);

  return {
    isFuturePurchase: compareCalendarDates(purchaseDate, businessDate) > 0,
    isWithinWarranty:
      compareCalendarDates(businessDate, warrantyExpiresAt) <= 0,
    purchaseDate: toUtcDate(purchaseDate),
    warrantyExpiresAt: toUtcDate(warrantyExpiresAt),
  };
}

function parseCalendarDate(value: string): CalendarDate {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (match === null) {
    throw new InvalidCalendarDateError(value);
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (
    year < 1 ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > daysInMonth(year, month)
  ) {
    throw new InvalidCalendarDateError(value);
  }

  return { year, month, day };
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }

  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function compareCalendarDates(left: CalendarDate, right: CalendarDate): number {
  return (
    left.year - right.year || left.month - right.month || left.day - right.day
  );
}

function toUtcDate(value: CalendarDate): Date {
  const date = new Date(0);
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCFullYear(value.year, value.month - 1, value.day);
  return date;
}

function formatCalendarDate(value: CalendarDate): string {
  return `${String(value.year).padStart(4, '0')}-${String(value.month).padStart(2, '0')}-${String(value.day).padStart(2, '0')}`;
}

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}
