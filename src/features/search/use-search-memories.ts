import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import type { MemoryWithAuthor } from "../../types/database";

const SELECT =
  "*, author:profiles!created_by_user_id(display_name), reactions:memory_reactions(user_id,type)";

function escapeForOr(raw: string): string {
  return raw
    .replace(/[%_]/g, (m) => `\\${m}`) // ILIKE wildcards → literal
    .replace(/[(),"*]/g, " "); // PostgREST filter metachars + ILIKE '*'
}

export function useSearchMemories(
  spaceId: string | undefined,
  rawQuery: string,
) {
  const q = rawQuery.trim();
  const isTag = q.startsWith("#");
  const tagTokens = isTag
    ? q
        .split(/\s+/)
        .map((t) => t.replace(/^#/, "").trim().toLowerCase())
        .filter(Boolean)
    : [];

  return useQuery({
    queryKey: ["search", spaceId, q.toLowerCase()],
    queryFn: async () => {
      let query = supabase
        .from("memories")
        .select(SELECT)
        .eq("couple_space_id", spaceId!)
        .is("deleted_at", null);

      if (isTag) {
        query = query.contains("tags", tagTokens); // @> → AND semantics
      } else {
        const term = `%${escapeForOr(q)}%`;
        query = query.or(
          `title.ilike.${term},body.ilike.${term},place_name.ilike.${term}`,
        );
      }

      const { data, error } = await query.order("date_happened", {
        ascending: false,
      });
      if (error) throw error;
      return data as unknown as MemoryWithAuthor[];
    },
    enabled: !!spaceId && (isTag ? tagTokens.length > 0 : q.length > 0),
  });
}
