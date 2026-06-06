import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import type { Collection, MemoryWithAuthor } from "../../types/database";

type EmbeddedMemory = MemoryWithAuthor & { deleted_at: string | null };

type CollectionDetailRow = Collection & {
  memories: EmbeddedMemory[];
};

export type CollectionDetail = {
  collection: Collection;
  memories: MemoryWithAuthor[];
};

export function useCollection(collectionId: string | undefined) {
  return useQuery({
    queryKey: ["collections", "detail", collectionId],
    queryFn: async (): Promise<CollectionDetail> => {
      const { data, error } = await supabase
        .from("collections")
        .select(
          "*, memories(*, author:profiles!created_by_user_id(display_name), reactions:memory_reactions(user_id,type))",
        )
        .eq("id", collectionId!)
        .single();

      if (error) throw error;

      const row = data as unknown as CollectionDetailRow;
      const { memories: rawMemories, ...collectionFields } = row;

      const memories = (rawMemories ?? [])
        .filter((m) => m.deleted_at === null)
        .sort((a, b) => b.date_happened.localeCompare(a.date_happened)) as MemoryWithAuthor[];

      return { collection: collectionFields, memories };
    },
    enabled: !!collectionId,
  });
}
