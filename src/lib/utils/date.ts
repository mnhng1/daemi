const dateFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function formatTimelineDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);

  if (dateString === today) return "Today";
  if (dateString === yesterday) return "Yesterday";
  return dateFormatter.format(date);
}

export function toDateKey(dateString: string): string {
  return dateString.slice(0, 10);
}

export function formatLetterDate(dateString: string): string {
  const d = new Date(dateString + "T00:00:00");
  const month = d.toLocaleDateString("en-US", { month: "short" }).toLowerCase();
  const day = d.getDate();
  return `${month} ${day}`;
}

// Mirrors prototype DU.fmt.monthKey — returns "YYYY-MM" for a "YYYY-MM-DD" date string.
export function monthKey(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

// Mirrors prototype DU.fmt.monDay — "Sep 14" for a "YYYY-MM-DD" date string.
export function monDay(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(dateStr + "T00:00:00")
  );
}

// Mirrors prototype DU.fmt.dow — "Sat" for a "YYYY-MM-DD" date string.
export function dayOfWeek(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
    new Date(dateStr + "T00:00:00")
  );
}

// Returns e.g. "Sep 2025" for (2025, 8) where month is 0-indexed (JS Date convention).
export function formatMonthLabel(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(
    new Date(year, month, 1)
  );
}
