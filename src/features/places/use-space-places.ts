import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import type { SpacePlace } from "./types";

export function useSpacePlaces(spaceId?: string) {
  return useQuery({
    queryKey: ["space-places", spaceId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("list_space_places", {
        space_id: spaceId!,
      });
      if (error) throw error;
      return (data ?? []) as SpacePlace[];
    },
    enabled: !!spaceId,
  });
}
