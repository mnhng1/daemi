import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { logError } from "../../lib/utils/log";

function invalidateMemoryQueries(queryClient: ReturnType<typeof useQueryClient>): void {
  queryClient.invalidateQueries({ queryKey: ["memories"] });
  queryClient.invalidateQueries({ queryKey: ["search"] });
  queryClient.invalidateQueries({ queryKey: ["space-tags"] });
  // Collection cards derive cover/count from memories — refresh them too.
  queryClient.invalidateQueries({ queryKey: ["collections"] });
  // The places lens derives its counts/list from memories — refresh on sync.
  queryClient.invalidateQueries({ queryKey: ["space-places"] });
  queryClient.invalidateQueries({ queryKey: ["place-memories"] });
  queryClient.invalidateQueries({ queryKey: ["space-coordinates"] });
}

export function useRealtimeSync(coupleSpaceId: string | undefined): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!coupleSpaceId) return;

    const channel = supabase
      .channel(`realtime:space:${coupleSpaceId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "memories",
          // Soft delete is the norm (deleted_at), so deletions arrive as UPDATE
          // events that carry couple_space_id and match this filter.
          filter: `couple_space_id=eq.${coupleSpaceId}`,
        },
        () => {
          invalidateMemoryQueries(queryClient);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "memory_reactions",
        },
        () => {
          // Reactions don't change tags, but they're embedded in both timeline
          // and search cards — invalidate those two, not ["space-tags"].
          queryClient.invalidateQueries({ queryKey: ["memories"] });
          queryClient.invalidateQueries({ queryKey: ["search"] });
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collections",
          filter: `couple_space_id=eq.${coupleSpaceId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["collections"] });
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          logError("realtime-sync", new Error(`channel status: ${status}`));
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [coupleSpaceId, queryClient]);
}
