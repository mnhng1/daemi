import { MemoryWithAuthor } from "../../types/database";
import type { QueuedMemory } from "../queue";
import { groupMemoriesByDate } from "./group-memories-by-date";
import { monDay, dayOfWeek } from "../../lib/utils/date";
import { tilt } from "../../lib/utils/tilt";
import type { MemoryTypeFilter } from "./types";

// Flattened day-view rows, mirroring the prototype DayView (04-timeline.js:124-164)
// and its filtered variant with ghost rows (:301-323).
export type DayRow =
  | { kind: "today"; key: string }
  | { kind: "queued"; key: string; item: QueuedMemory }
  | { kind: "month-marker"; key: string; label: string; sub: string; accent: boolean }
  | {
      kind: "cluster";
      key: string;
      items: MemoryWithAuthor[];
      dateLabel?: string;
      dowLabel?: string;
    }
  | {
      kind: "memory";
      key: string;
      item: MemoryWithAuthor;
      dateLabel?: string;
      dowLabel?: string;
      accent: boolean;
      rotation: number;
    }
  | { kind: "ghost"; key: string; count: number };

const monthShort = (dateStr: string) =>
  new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(dateStr + "T00:00:00"));
const monthIndex = (dateStr: string) => new Date(dateStr + "T00:00:00").getMonth();
const yearOf = (dateStr: string) => new Date(dateStr + "T00:00:00").getFullYear();
const monthKeyOf = (dateStr: string) => dateStr.slice(0, 7);

const isPic = (m: MemoryWithAuthor) => m.type === "photo" || m.type === "video";

/**
 * Builds the flat day-view row list. `remote` must be sorted most-recent-first
 * (as returned by useMemoriesWithQueue). When `typeFilter !== "all"`, non-matching
 * items collapse into "N hidden by filter" ghost rows and grouping/markers are skipped
 * (prototype filtered branch).
 */
export function buildDayRows(
  remote: MemoryWithAuthor[],
  queued: QueuedMemory[],
  anniversaryMonth: number | null,
  typeFilter: MemoryTypeFilter
): DayRow[] {
  const rows: DayRow[] = [{ kind: "today", key: "__today__" }];
  for (const q of queued) rows.push({ kind: "queued", key: `q-${q.id}`, item: q });

  if (typeFilter !== "all") {
    let hidden = 0;
    remote.forEach((m, idx) => {
      if (m.type === typeFilter) {
        if (hidden) {
          rows.push({ kind: "ghost", key: `g-${idx}`, count: hidden });
          hidden = 0;
        }
        rows.push({
          kind: "memory",
          key: m.id,
          item: m,
          dateLabel: monDay(m.date_happened),
          dowLabel: dayOfWeek(m.date_happened),
          accent: m.type === "letter",
          rotation: isPic(m) ? tilt(m.id) : 0,
        });
      } else {
        hidden++;
      }
    });
    if (hidden) rows.push({ kind: "ghost", key: "g-end", count: hidden });
    return rows;
  }

  // Unfiltered: group by day, insert month markers, cluster same-day photos.
  const groups = groupMemoriesByDate(remote);
  let lastMonth: string | null = null;

  for (const g of groups) {
    const firstDate = g.data[0].date_happened;
    const mk = monthKeyOf(firstDate);
    if (mk !== lastMonth) {
      const accent = anniversaryMonth !== null && monthIndex(firstDate) === anniversaryMonth;
      if (rows.length > 1 + queued.length) {
        rows.push({
          kind: "month-marker",
          key: `mk-${mk}`,
          label: monthShort(firstDate),
          sub: accent ? "anniversary month" : String(yearOf(firstDate)),
          accent,
        });
      }
      lastMonth = mk;
    }

    const pics = g.data.filter(isPic);
    const others = g.data.filter((m) => !isPic(m));
    let usedDate = false;
    const dateProps = () => {
      const p = usedDate
        ? {}
        : { dateLabel: monDay(g.dateKey), dowLabel: dayOfWeek(g.dateKey) };
      usedDate = true;
      return p;
    };

    if (pics.length >= 2) {
      rows.push({ kind: "cluster", key: `cl-${g.dateKey}`, items: pics, ...dateProps() });
    } else if (pics.length === 1) {
      const m = pics[0];
      rows.push({
        kind: "memory",
        key: m.id,
        item: m,
        accent: false,
        rotation: tilt(m.id),
        ...dateProps(),
      });
    }

    for (const m of others) {
      rows.push({
        kind: "memory",
        key: m.id,
        item: m,
        accent: m.type === "letter",
        rotation: 0,
        ...dateProps(),
      });
    }
  }

  return rows;
}
