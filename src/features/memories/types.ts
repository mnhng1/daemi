import { Memory } from "../../types/database";

export type MemoryTypeFilter = "all" | "photo" | "letter";

export interface TimelineDateSection {
  title: string;
  dateKey: string;
  data: Memory[];
}

export interface MemoryGroup {
  _group: true;
  memories: Memory[];
  id: string;
}

export type TimelineItem = Memory | MemoryGroup;

export function isMemoryGroup(item: TimelineItem): item is MemoryGroup {
  return "_group" in item && item._group === true;
}
