import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Crypto from "expo-crypto";
import { supabase } from "../../lib/supabase/client";
import { uploadMemoryImage } from "../media";
import type { Database } from "../../types/database";
import { normalizeTags } from "../../lib/utils/text";

type MemoryInsert = Database["public"]["Tables"]["memories"]["Insert"];

type CreateMemoryBase = {
  coupleSpaceId: string;
  userId: string;
  title?: string;
  dateHappened: string;
  tags?: string[];
};

type CreatePhotoInput = CreateMemoryBase & {
  type: "photo";
  body?: string;
  imageUri: string;
  mimeType: string;
  onProgress?: (percent: number) => void;
};

type CreateLetterInput = CreateMemoryBase & {
  type: "letter";
  body: string;
};

type CreateMemoryInput = CreatePhotoInput | CreateLetterInput;

export function useCreateMemory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMemoryInput) => {
      const memoryId = Crypto.randomUUID();

      let storageKey: string | null = null;
      if (input.type === "photo") {
        const { key } = await uploadMemoryImage({
          imageUri: input.imageUri,
          coupleSpaceId: input.coupleSpaceId,
          memoryId,
          mimeType: input.mimeType,
          onProgress: input.onProgress,
        });
        storageKey = key;
      }

      const memoryInsert: MemoryInsert = {
        id: memoryId,
        couple_space_id: input.coupleSpaceId,
        type: input.type,
        title: input.title ?? null,
        body: input.body ?? null,
        storage_key: storageKey,
        date_happened: input.dateHappened,
        created_by_user_id: input.userId,
        tags: normalizeTags(input.tags),
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
      queryClient.invalidateQueries({ queryKey: ["search"] });
      queryClient.invalidateQueries({ queryKey: ["space-tags"] });
    },
  });
}
