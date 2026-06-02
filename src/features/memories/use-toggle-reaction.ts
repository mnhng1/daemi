import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { useSession } from "../auth/session-provider";
import type { MemoryWithAuthor } from "../../types/database";

export function useToggleReaction(memoryId: string) {
  const queryClient = useQueryClient();
  const { session } = useSession();
  const userId = session?.user.id ?? "";
  // Captures the pre-patch reaction state so mutationFn always acts on the
  // true pre-toggle value, not the already-patched cache.
  const preToggleHasReacted = useRef(false);

  return useMutation({
    mutationFn: async () => {
      const hasReacted = preToggleHasReacted.current;

      if (hasReacted) {
        const { error } = await supabase
          .from("memory_reactions")
          .delete()
          .eq("memory_id", memoryId)
          .eq("user_id", userId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("memory_reactions")
          .insert({ memory_id: memoryId, user_id: userId, type: "heart" });
        // Swallow unique-violation (already-hearted race)
        if (error && error.code !== "23505") throw error;
      }
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["memories"] });

      // Snapshot detail cache
      const previousDetail = queryClient.getQueryData<MemoryWithAuthor>([
        "memories",
        "detail",
        memoryId,
      ]);

      const alreadyReacted =
        previousDetail?.reactions.some((r) => r.user_id === userId) ?? false;

      // Capture pre-patch state for mutationFn BEFORE any cache writes
      preToggleHasReacted.current = alreadyReacted;

      // Helper: patch a single MemoryWithAuthor's reactions optimistically
      const patchReactions = (memory: MemoryWithAuthor): MemoryWithAuthor => {
        if (memory.id !== memoryId) return memory;
        const filtered = memory.reactions.filter((r) => r.user_id !== userId);
        const next = alreadyReacted
          ? filtered
          : [...filtered, { user_id: userId, type: "heart" as const }];
        return { ...memory, reactions: next };
      };

      // Patch detail cache
      if (previousDetail) {
        queryClient.setQueryData<MemoryWithAuthor>(
          ["memories", "detail", memoryId],
          patchReactions(previousDetail)
        );
      }

      // Patch every list cache that might contain this memory
      queryClient.setQueriesData<MemoryWithAuthor[]>(
        { queryKey: ["memories"], exact: false },
        (old) => {
          if (!Array.isArray(old)) return old;
          return old.map(patchReactions);
        }
      );

      return { previousDetail };
    },

    onError: (_err, _vars, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          ["memories", "detail", memoryId],
          context.previousDetail
        );
      }
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });
}
