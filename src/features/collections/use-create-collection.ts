import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import type { Database } from "../../types/database";
import { logError } from "../../lib/utils/log";

type CollectionInsert = Database["public"]["Tables"]["collections"]["Insert"];

type CreateCollectionInput = {
  coupleSpaceId: string;
  userId: string;
  name: string;
  type: "trip" | "anniversary" | "custom";
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
};

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCollectionInput) => {
      const insert: CollectionInsert = {
        couple_space_id: input.coupleSpaceId,
        created_by_user_id: input.userId,
        name: input.name.trim(),
        type: input.type,
        start_date: input.startDate || null,
        end_date: input.endDate || null,
        description: input.description?.trim() || null,
      };

      const { data, error } = await supabase
        .from("collections")
        .insert([insert])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
    onError: (error) => {
      logError("create-collection", error);
    },
  });
}
