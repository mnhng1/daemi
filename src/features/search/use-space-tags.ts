import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";

export function useSpaceTags(spaceId: string | undefined) {
  return useQuery({
    queryKey: ["space-tags", spaceId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_space_tags", {
        space_id: spaceId!,
      });
      if (error) throw error;
      return (data ?? []) as string[];
    },
    enabled: !!spaceId,
  });
}
