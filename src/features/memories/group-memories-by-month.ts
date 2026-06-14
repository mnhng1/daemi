import { MemoryWithAuthor } from "../../types/database";
import { monthKey } from "../../lib/utils/date";

// Mirrors prototype MonthView / YearView grouping (04-timeline.js lines 191-194, 225-227).

/**
 * Groups an array of memories by calendar month, sorted most-recent-first.
 * Output `month` is 0-indexed to match JS Date conventions (e.g. "2025-09" → month: 8).
 * Prototype ref: lines 191-194.
 */
export function groupByMonth(
  memories: MemoryWithAuthor[]
): { monthKey: string; year: number; month: number; items: MemoryWithAuthor[] }[] {
  // Accumulate into a map keyed by "YYYY-MM"
  const byMonth: Record<string, MemoryWithAuthor[]> = {};
  for (const m of memories) {
    const k = monthKey(m.date_happened);
    if (!byMonth[k]) byMonth[k] = [];
    byMonth[k].push(m);
  }

  // Sort keys most-recent-first using mval (prototype line 193)
  const mval = (s: string): number => {
    const [y, mo] = s.split("-").map(Number);
    return y * 12 + mo;
  };
  const keys = Object.keys(byMonth).sort((a, b) => mval(b) - mval(a));

  return keys.map((k) => {
    // monthKey string is "YYYY-MM" where month part is 1-indexed
    const [y, mo] = k.split("-").map(Number);
    return {
      monthKey: k,
      year: y,
      month: mo - 1, // convert to 0-indexed for JS Date / formatMonthLabel
      items: byMonth[k],
    };
  });
}

/**
 * Groups items within a single month by week-of-month, sorted descending.
 * Week = ceil(dayOfMonth / 7), matching prototype line 201.
 */
export function groupByWeekOfMonth(
  items: MemoryWithAuthor[]
): { week: number; items: MemoryWithAuthor[] }[] {
  const byWeek: Record<number, MemoryWithAuthor[]> = {};
  for (const m of items) {
    // Parse day-of-month robustly (prototype line 201: DU.fmt.parse(m.date).getDate())
    const day = new Date(m.date_happened + "T00:00:00").getDate();
    const week = Math.ceil(day / 7);
    if (!byWeek[week]) byWeek[week] = [];
    byWeek[week].push(m);
  }

  return (Object.keys(byWeek).map(Number) as number[])
    .sort((a, b) => b - a)
    .map((w) => ({ week: w, items: byWeek[w] }));
}

/**
 * Counts memories by type for a month group.
 * Prototype ref: lines 231-233.
 */
export function monthTypeCounts(items: MemoryWithAuthor[]): {
  photo: number;
  video: number;
  letter: number;
  ticket: number;
  total: number;
} {
  const counts = { photo: 0, video: 0, letter: 0, ticket: 0, total: items.length };
  for (const m of items) {
    counts[m.type]++;
  }
  return counts;
}

/**
 * Returns a marker for the month: "anniversary" takes precedence over "trip".
 * `month` is 0-indexed (JS Date convention).
 * Prototype ref: line 235 (hardcoded isSep + collection check — generalized here).
 */
export function monthTripMarker(
  items: MemoryWithAuthor[],
  anniversaryMonth: number | null,
  month: number
): "anniversary" | "trip" | null {
  if (anniversaryMonth !== null && month === anniversaryMonth) {
    return "anniversary";
  }
  if (items.some((item) => item.collection?.type === "trip")) {
    return "trip";
  }
  return null;
}
