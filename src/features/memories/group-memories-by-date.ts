import { Memory } from "../../types/database";
import { toDateKey, formatTimelineDate } from "../../lib/utils/date";
import { TimelineDateSection } from "./types";

export function groupMemoriesByDate(memories: Memory[]): TimelineDateSection[] {
  const map = new Map<string, Memory[]>();

  for (const memory of memories) {
    const key = toDateKey(memory.date_happened);
    const group = map.get(key);
    if (group) {
      group.push(memory);
    } else {
      map.set(key, [memory]);
    }
  }

  return Array.from(map.entries()).map(([dateKey, data]) => ({
    title: formatTimelineDate(dateKey),
    dateKey,
    data,
  }));
}
