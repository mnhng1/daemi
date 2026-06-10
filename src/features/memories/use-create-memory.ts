import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useCallback } from "react";
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
  place_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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

type CreateVideoInput = CreateMemoryBase & {
  type: "video";
  body?: string;
  videoUri: string;
  mimeType: string; // "video/mp4" | "video/quicktime"
  durationSeconds: number;
  sizeBytes: number;
  posterUri: string; // local poster frame produced by the composer
  onProgress?: (percent: number) => void;
};

type CreateTicketInput = CreateMemoryBase & {
  type: "ticket";
  body?: string; // the "note"
  imageUri?: string; // optional stub photo
  mimeType?: string;
  onProgress?: (percent: number) => void;
};

type CreateMemoryInput = CreatePhotoInput | CreateLetterInput | CreateVideoInput | CreateTicketInput;

export function useCreateMemory() {
  const queryClient = useQueryClient();
  // Holds the abort handle for the currently in-flight video upload (original only).
  // Set before the XHR starts, cleared on completion or error.
  const abortRef = useRef<(() => void) | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.();
    abortRef.current = null;
  }, []);

  const mutation = useMutation({
    mutationFn: async (input: CreateMemoryInput) => {
      const memoryId = Crypto.randomUUID();

      let storageKey: string | null = null;
      let thumbnailUrl: string | null = null;
      let durationSeconds: number | null = null;
      let mediaSizeBytes: number | null = null;
      let mediaMime: string | null = null;

      if (input.type === "photo") {
        const handle = uploadMemoryImage({
          fileUri: input.imageUri,
          coupleSpaceId: input.coupleSpaceId,
          memoryId,
          mimeType: input.mimeType,
          onProgress: input.onProgress,
        });
        const { key } = await handle.result;
        storageKey = key;
      } else if (input.type === "video") {
        // Upload the original video — store abort handle so the host can cancel
        const videoHandle = uploadMemoryImage({
          fileUri: input.videoUri,
          coupleSpaceId: input.coupleSpaceId,
          memoryId,
          mimeType: input.mimeType,
          variant: "original",
          onProgress: input.onProgress,
        });
        abortRef.current = videoHandle.abort;
        try {
          const { key: videoKey } = await videoHandle.result;
          storageKey = videoKey;
        } finally {
          abortRef.current = null;
        }

        // Upload the poster frame as thumb — also abortable so a cancel during
        // the (small) poster PUT still cancels rather than orphaning the upload.
        const posterHandle = uploadMemoryImage({
          fileUri: input.posterUri,
          coupleSpaceId: input.coupleSpaceId,
          memoryId,
          mimeType: "image/jpeg",
          variant: "thumb",
        });
        abortRef.current = posterHandle.abort;
        try {
          const { key: posterKey } = await posterHandle.result;
          thumbnailUrl = posterKey;
        } finally {
          abortRef.current = null;
        }

        // 0 means "unknown" (asset gave no duration / size read failed) — persist
        // NULL so the duration badge doesn't render "0:00" and size-based routing
        // (I3) treats it as single-PUT.
        durationSeconds = input.durationSeconds || null;
        mediaSizeBytes = input.sizeBytes || null;
        mediaMime = input.mimeType;
      } else if (input.type === "ticket" && input.imageUri && input.mimeType) {
        // Upload optional stub photo
        const handle = uploadMemoryImage({
          fileUri: input.imageUri,
          coupleSpaceId: input.coupleSpaceId,
          memoryId,
          mimeType: input.mimeType,
          onProgress: input.onProgress,
        });
        const { key } = await handle.result;
        storageKey = key;
      }

      const memoryInsert: MemoryInsert = {
        id: memoryId,
        couple_space_id: input.coupleSpaceId,
        type: input.type,
        title: input.title ?? null,
        body: input.body ?? null,
        storage_key: storageKey,
        thumbnail_url: thumbnailUrl,
        duration_seconds: durationSeconds,
        media_size_bytes: mediaSizeBytes,
        media_mime: mediaMime,
        date_happened: input.dateHappened,
        created_by_user_id: input.userId,
        tags: normalizeTags(input.tags),
        place_name: input.place_name ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
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
      queryClient.invalidateQueries({ queryKey: ["space-places"] });
      queryClient.invalidateQueries({ queryKey: ["place-memories"] });
      queryClient.invalidateQueries({ queryKey: ["space-coordinates"] });
    },
  });

  return { ...mutation, abort };
}
