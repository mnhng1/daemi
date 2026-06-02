import { MemoryWithAuthor } from "../../types/database";

export type MemoryTypeFilter = "all" | "photo" | "letter";

export interface TimelineDateSection {
  title: string;
  dateKey: string;
  data: MemoryWithAuthor[];
}

export interface MemoryGroup {
  _group: true;
  memories: MemoryWithAuthor[];
  id: string;
}

export type TimelineItem = MemoryWithAuthor | MemoryGroup;

export function isMemoryGroup(item: TimelineItem): item is MemoryGroup {
  return "_group" in item && item._group === true;
}
