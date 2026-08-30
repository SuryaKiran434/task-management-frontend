/**
 * parseDate and formatDate.
 *
 * These exist because `new Date("2026-05-25")` parses a date-only string as UTC
 * midnight, so anywhere west of UTC renders the previous calendar day -- a due
 * date shown one day early. parseISO reads it as local midnight instead. That
 * is the behaviour worth pinning, so the tests run under a fixed westward zone.
 */

import { parseDate } from '../dates';
import { formatDate } from '../helpers';

describe('parseDate', () => {
  it('returns null for an absent value', () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate('')).toBeNull();
  });

  it('passes a Date straight through, without copying it', () => {
    const d = new Date(2026, 4, 25);
    expect(parseDate(d)).toBe(d);
  });

  it('reads a date-only string as local midnight, not UTC midnight', () => {
    const d = parseDate('2026-05-25');
    // The whole point: the calendar day survives a westward timezone.
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(4);
    expect(d.getDate()).toBe(25);
    expect(d.getHours()).toBe(0);
  });

  it('keeps the instant of a full timestamp', () => {
    const d = parseDate('2026-05-25T13:45:00Z');
    expect(d.toISOString()).toBe('2026-05-25T13:45:00.000Z');
  });
});

describe('formatDate', () => {
  it('returns an empty string for an absent date rather than "Invalid Date"', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDate('')).toBe('');
  });

  it('formats a date-only string on its own calendar day', () => {
    const out = formatDate('2026-05-25');
    expect(out).toMatch(/25/);
    expect(out).toMatch(/2026/);
    // The bug this guards against rendered the 24th.
    expect(out).not.toMatch(/24/);
  });

  it('accepts a Date as readily as a string', () => {
    expect(formatDate(new Date(2026, 4, 25))).toBe(formatDate('2026-05-25'));
  });
});
