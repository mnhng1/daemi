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
