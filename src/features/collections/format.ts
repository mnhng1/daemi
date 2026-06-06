import type { Collection } from "../../types/database";

export const COLLECTION_TYPE_LABELS: Record<Collection["type"], string> = {
  trip: "Trip",
  anniversary: "Anniversary",
  custom: "Collection",
};

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
