import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { supabase } from "../../lib/supabase/client";
import { uploadMemoryImage } from "../media";
import type { Database } from "../../types/database";

type MemoryInsert = Database["public"]["Tables"]["memories"]["Insert"];

type CreateMemoryInput = {
  coupleSpaceId: string;
  userId: string;
  imageUri: string;
  mimeType: string;
  title?: string;
  body?: string;
  dateHappened: string;
  onProgress?: (percent: number) => void;
};

export function useCreateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMemoryInput) => {
      const memoryId = Crypto.randomUUID();

      const { key } = await uploadMemoryImage({
        imageUri: input.imageUri,
        coupleSpaceId: input.coupleSpaceId,
        memoryId,
        mimeType: input.mimeType,
        onProgress: input.onProgress,
      });

      const memoryInsert: MemoryInsert = {
        id: memoryId,
        couple_space_id: input.coupleSpaceId,
        type: "photo",
        title: input.title ?? null,
        body: input.body ?? null,
        storage_key: key,
        date_happened: input.dateHappened,
        created_by_user_id: input.userId,
      };

      const { data, error } = await supabase
        .from("memories")
        .insert([memoryInsert])
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
