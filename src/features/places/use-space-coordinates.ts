import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import type { SpaceCoordinate } from "./types";

export function useSpaceCoordinates(spaceId?: string) {
  return useQuery({
    queryKey: ["space-coordinates", spaceId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("id, place_name, latitude, longitude")
        .eq("couple_space_id", spaceId!)
        .is("deleted_at", null)
        .not("latitude", "is", null);
      if (error) throw error;
      // Postgres `numeric` columns serialize as JSON strings via PostgREST, so
      // coerce to number for react-native-maps. Drop any row missing a finite
      // coordinate (e.g. latitude set but longitude null).
      type CoordRow = {
        id: string;
        place_name: string | null;
        latitude: string | number | null;
        longitude: string | number | null;
      };
      return ((data ?? []) as CoordRow[])
        .map((r) => ({
          id: r.id,
          place_name: r.place_name,
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
        }))
        .filter(
          (c): c is SpaceCoordinate =>
            Number.isFinite(c.latitude) && Number.isFinite(c.longitude),
        );
    },
    enabled: !!spaceId,
  });
}
