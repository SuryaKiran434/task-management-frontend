import { parseISO } from 'date-fns';

// Use this for backend date strings instead of `new Date(value)`.
// `new Date("2026-05-25")` parses as UTC midnight, then displaying it
// in a TZ west of UTC shows the previous calendar day. parseISO parses
// a date-only string as local midnight, so the displayed day matches.
export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  return parseISO(value);
}
