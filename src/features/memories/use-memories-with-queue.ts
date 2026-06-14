import { useMemo } from "react";
import type { MemoryWithAuthor } from "../../types/database";
import { useUploadQueue } from "../queue";
import type { QueuedMemory } from "../queue";
import { useMemories } from "./use-memories";
import type { MemoryTypeFilter } from "./types";

export type MemoryOrQueued = MemoryWithAuthor | QueuedMemory;

export function useMemoriesWithQueue(
  spaceId: string | undefined,
  typeFilter: MemoryTypeFilter,
) {
  const remote = useMemories(spaceId, typeFilter);
  const { queued } = useUploadQueue(
    spaceId,
    typeFilter !== "all" ? typeFilter : undefined,
  );

  const data = useMemo<MemoryOrQueued[]>(() => {
    const remoteItems: MemoryWithAuthor[] = remote.data ?? [];
    // Once a queued row's upload completes the processor inserts the real row
    // (keyed by memoryId) and deletes the queued row, but the two list sources
    // (SQLite queue + remote query/realtime) settle independently — so for a
    // brief window both can be present. Key the merge by memoryId so the real
    // row is dropped while its queued twin is still showing, preventing a
    // double-card flash (Phase 12 Step 6: "no duplicate timeline entry").
    const queuedMemoryIds = new Set(queued.map((q) => q.memoryId));
    const deduped = remoteItems.filter((m) => !queuedMemoryIds.has(m.id));
    return [...queued, ...deduped];
  }, [queued, remote.data]);

  return { ...remote, data };
}
