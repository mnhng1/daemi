import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import type { SpacePlace } from "./types";

export function useSpacePlaces(spaceId?: string) {
  return useQuery({
    queryKey: ["space-places", spaceId],
    queryFn: async () => {
      console.log("[Places] useSpacePlaces — spaceId:", spaceId);
      const { data, error } = await supabase.rpc("list_space_places", {
        space_id: spaceId!,
      });
      console.log("[Places] useSpacePlaces — raw data:", data, "error:", error);
      if (error) throw error;
      return (data ?? []) as SpacePlace[];
    },
    enabled: !!spaceId,
  });
}
