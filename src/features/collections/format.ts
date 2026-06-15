import type { Collection } from "../../types/database";

export const COLLECTION_TYPE_LABELS: Record<Collection["type"], string> = {
  trip: "Trip",
  anniversary: "Anniversary",
  custom: "Collection",
};

export const COLLECTION_STICKER_TAGS: Record<Collection["type"], string> = {
  trip: "trip",
  anniversary: "anniv.",
  custom: "custom",
};

export function formatCollectionSubtitle(
  start: string | null,
  end: string | null,
  count: number,
): string {
  const n = `${count} ${count === 1 ? "memory" : "memories"}`;
  if (!start) return `ongoing · ${n}`;
  const monDay = (d: string) =>
    new Date(`${d}T00:00:00`)
      .toLocaleDateString(undefined, { month: "short", day: "numeric" })
      .toLowerCase();
  return `${monDay(start)}${end ? ` – ${monDay(end)}` : ""} · ${n}`;
}

export function formatCollectionDateRange(
  start: string | null,
  end: string | null,
): string | null {
  if (!start) return null;
  // Append a local-midnight time so a bare YYYY-MM-DD isn't parsed as UTC and
  // shifted to the previous day/month in negative-offset timezones.
  const fmt = (d: string) =>
    new Date(`${d}T00:00:00`).toLocaleDateString(undefined, {
      month: "short",
      year: "numeric",
    });
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start);
}
