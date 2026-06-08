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
    return [...queued, ...remoteItems];
  }, [queued, remote.data]);

  return { ...remote, data };
}
