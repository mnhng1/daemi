import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import type { Collection } from "../../types/database";

export type CollectionWithMeta = Collection & {
  memory_count: number;
  cover_storage_key: string | null;
  cover_memory_id: string | null;
};

type MemoryRow = {
  id: string;
  storage_key: string | null;
  type: "photo" | "video" | "letter" | "ticket";
  date_happened: string;
  deleted_at: string | null;
};

type CollectionRow = Collection & {
  memories: MemoryRow[];
};

export function useCollections(spaceId: string | undefined) {
  return useQuery({
    queryKey: ["collections", spaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("collections")
        .select("*, memories(id, storage_key, type, date_happened, deleted_at)")
        .eq("couple_space_id", spaceId!)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const rows = data as unknown as CollectionRow[];

      return rows.map((col): CollectionWithMeta => {
        const liveMemories = col.memories.filter((m) => m.deleted_at === null);
        const memory_count = liveMemories.length;

        // Cover: earliest (by date_happened asc) photo-type live memory with a storage_key
        const photoMemories = liveMemories
          .filter((m) => m.type === "photo" && m.storage_key !== null)
          .sort((a, b) => a.date_happened.localeCompare(b.date_happened));

        const cover = photoMemories[0] ?? null;

        const { memories: _memories, ...collectionFields } = col;
        return {
          ...collectionFields,
          memory_count,
          cover_storage_key: cover?.storage_key ?? null,
          cover_memory_id: cover?.id ?? null,
        };
      });
    },
    enabled: !!spaceId,
  });
}
