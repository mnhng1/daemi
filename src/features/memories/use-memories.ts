import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { MemoryTypeFilter } from "./types";

export function useMemories(spaceId: string | undefined, typeFilter: MemoryTypeFilter) {
  return useQuery({
    queryKey: ["memories", spaceId, typeFilter],
    queryFn: async () => {
      let query = supabase
        .from("memories")
        .select("*")
        .eq("couple_space_id", spaceId!)
        .is("deleted_at", null)
        .order("date_happened", { ascending: false });

      if (typeFilter !== "all") {
        query = query.eq("type", typeFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!spaceId,
  });
}
