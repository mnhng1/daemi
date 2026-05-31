import { Memory } from "../../types/database";

export type MemoryTypeFilter = "all" | "photo" | "letter";

export interface TimelineDateSection {
  title: string;
  dateKey: string;
  data: Memory[];
}
