import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { logError } from "../../lib/utils/log";

type SetMemoryCollectionInput = {
  memoryId: string;
  collectionId: string | null;
};

export function useSetMemoryCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ memoryId, collectionId }: SetMemoryCollectionInput) => {
      const { data, error } = await supabase.rpc("set_memory_collection", {
        p_memory_id: memoryId,
        p_collection_id: collectionId,
      });
      if (error) throw error;
      // setof returns an array; empty => the in-DB guard rejected the change
      // (not a member, memory missing/deleted, or cross-space collection).
      if (!data || data.length === 0) {
        throw new Error("Could not update collection");
      }
      return data[0];
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({
        queryKey: ["memories", "detail", variables.memoryId],
      });
    },
    onError: (error) => {
      logError("set-memory-collection", error);
    },
  });
}
