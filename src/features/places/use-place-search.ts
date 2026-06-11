import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import type { PlaceSuggestion, ResolvedPlace } from "./types";

export function usePlaceSearch(
  spaceId: string | undefined,
  input: string,
  sessionToken: string,
) {
  const [debouncedInput, setDebouncedInput] = useState(input);

  // Debounce: 250ms (mirrors the search screen)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedInput(input), 250);
    return () => clearTimeout(t);
  }, [input]);

  return useQuery({
    queryKey: ["place-search", spaceId, debouncedInput],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("places-search", {
        body: {
          action: "autocomplete",
          coupleSpaceId: spaceId,
          input: debouncedInput,
          sessionToken,
        },
      });
      if (error) throw error;
      return (data?.suggestions ?? []) as PlaceSuggestion[];
    },
    enabled: !!spaceId && debouncedInput.trim().length >= 2,
    retry: 0,
  });
}

export async function resolvePlaceDetails(
  spaceId: string,
  placeId: string,
  sessionToken: string,
): Promise<ResolvedPlace> {
  const { data, error } = await supabase.functions.invoke("places-search", {
    body: {
      action: "details",
      coupleSpaceId: spaceId,
      placeId,
      sessionToken,
    },
  });
  if (error) throw error;
  return data as ResolvedPlace;
}
