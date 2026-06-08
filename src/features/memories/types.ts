import { MemoryWithAuthor } from "../../types/database";
import type { QueuedMemory } from "../queue";

export type MemoryTypeFilter = "all" | "photo" | "video" | "letter" | "ticket";

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

export type TimelineItem = MemoryWithAuthor | MemoryGroup | QueuedMemory;

export function isMemoryGroup(item: TimelineItem): item is MemoryGroup {
  return "_group" in item && item._group === true;
}

export function isQueuedMemory(item: TimelineItem): item is QueuedMemory {
  return "_isQueued" in item && (item as any)._isQueued === true;
}
