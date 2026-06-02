import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import type { MemoryWithAuthor } from "../../types/database";

export function useMemory(memoryId: string | undefined) {
  return useQuery({
    queryKey: ["memories", "detail", memoryId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("*, author:profiles!created_by_user_id(display_name)")
        .eq("id", memoryId!)
        .is("deleted_at", null)
        .single();
      if (error) throw error;
      return data as unknown as MemoryWithAuthor;
    },
    enabled: !!memoryId,
  });
}
