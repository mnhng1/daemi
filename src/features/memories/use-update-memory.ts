import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";

type UpdateMemoryInput = {
  id: string;
  title?: string | null;
  body?: string | null;
  date_happened?: string;
  place_name?: string | null;
};

export function useUpdateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...fields }: UpdateMemoryInput) => {
      const { data, error } = await supabase
        .from("memories")
        .update(fields)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["memories"] });
    },
  });
}
