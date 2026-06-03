import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { logError } from "../../lib/utils/log";

export function useDeleteMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (memoryId: string) => {
      const { error } = await supabase
        .from("memories")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", memoryId);
      if (error) throw error;
    },
    onError: (error) => {
      logError("delete-memory", error);
    },
  });
}
