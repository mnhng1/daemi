import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { logError } from "../../lib/utils/log";
import { normalizeTags } from "../../lib/utils/text";

type UpdateMemoryInput = {
  id: string;
  title?: string | null;
  body?: string | null;
  date_happened?: string;
  place_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  tags?: string[];
};

export function useUpdateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tags, ...fields }: UpdateMemoryInput) => {
      const payload = tags === undefined ? fields : { ...fields, tags: normalizeTags(tags) };
      const { data, error } = await supabase
        .from("memories")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
      queryClient.invalidateQueries({ queryKey: ["search"] });
      queryClient.invalidateQueries({ queryKey: ["space-tags"] });
      queryClient.invalidateQueries({ queryKey: ["space-places"] });
      queryClient.invalidateQueries({ queryKey: ["place-memories"] });
      queryClient.invalidateQueries({ queryKey: ["space-coordinates"] });
    },
    onError: (error) => {
      logError("update-memory", error);
    },
  });
}
