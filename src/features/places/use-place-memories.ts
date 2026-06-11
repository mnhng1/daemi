import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import type { MemoryWithAuthor } from "../../types/database";

const SELECT =
  "*, author:profiles!created_by_user_id(display_name), reactions:memory_reactions(user_id,type)";

export function usePlaceMemories(spaceId?: string, placeName?: string) {
  return useQuery({
    queryKey: ["place-memories", spaceId, placeName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memories")
        .select(SELECT)
        .eq("couple_space_id", spaceId!)
        .eq("place_name", placeName!)
        .is("deleted_at", null)
        .order("date_happened", { ascending: false });
      if (error) throw error;
      return data as unknown as MemoryWithAuthor[];
    },
    enabled: !!spaceId && !!placeName,
  });
}
