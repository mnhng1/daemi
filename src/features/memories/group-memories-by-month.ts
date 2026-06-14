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

export interface MonthScaffoldRow {
  monthKey: string;
  year: number;
  month: number; // 0-indexed
  items: MemoryWithAuthor[]; // empty for months with no memories
  isEmpty: boolean;
  isCurrentMonth: boolean;
}

/**
 * Builds a continuous month-by-month scaffold for the year view: every month
 * from the current month (top) down to January of the earliest year that has
 * data (bottom). Months with no memories come back with `isEmpty: true` so the
 * UI can render them as faint placeholders — this keeps the year view feeling
 * like a *year* (and not cramped to the top) when data is sparse.
 *
 * `now` is injected so the function stays pure/testable.
 */
export function scaffoldMonths(
  memories: MemoryWithAuthor[],
  now: Date
): MonthScaffoldRow[] {
  const groups = groupByMonth(memories);
  if (groups.length === 0) return [];

  // Key items by an absolute month index (year*12 + 0-indexed month) to avoid
  // any string-format coupling with monthKey().
  const byVal: Record<number, MemoryWithAuthor[]> = {};
  for (const g of groups) byVal[g.year * 12 + g.month] = g.items;

  const curVal = now.getFullYear() * 12 + now.getMonth();
  const newest = groups[0]; // groupByMonth is most-recent-first
  const oldest = groups[groups.length - 1];

  // Top = whichever is later: this month, or the newest memory's month.
  const topVal = Math.max(curVal, newest.year * 12 + newest.month);
  // Bottom = January of the earliest year that has data.
  const bottomVal = oldest.year * 12 + 0;

  const rows: MonthScaffoldRow[] = [];
  for (let v = topVal; v >= bottomVal; v--) {
    const year = Math.floor(v / 12);
    const month = v % 12;
    const items = byVal[v] ?? [];
    rows.push({
      monthKey: `${year}-${month}`,
      year,
      month,
      items,
      isEmpty: items.length === 0,
      isCurrentMonth: v === curVal,
    });
  }
  return rows;
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
