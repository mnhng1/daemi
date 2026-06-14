import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useCallback } from "react";
import * as Crypto from "expo-crypto";
import { supabase } from "../../lib/supabase/client";
import { uploadMemoryImage } from "../media";
import type { Database } from "../../types/database";
import { normalizeTags } from "../../lib/utils/text";
import { insertQueueRow, refreshQueue, triggerDrain } from '../queue';
import { getIsOnline } from '../network';

const MULTIPART_THRESHOLD_BYTES = 4.5 * 1024 * 1024 * 1024;

function getCurrentISOTimestamp(): string {
  return new Date().toISOString();
}

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

// ---------------------------------------------------------------------------
// Network-class error detection
// Matches error messages from upload-memory-image.ts and Supabase fetch
// ---------------------------------------------------------------------------

function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message;
  return (
    msg.includes("status 0") ||
    msg.includes("network error") ||
    msg.includes("request timed out") ||
    msg.includes("Network request failed")
  );
}

// ---------------------------------------------------------------------------
// enqueueDraft — persist any memory type to the SQLite queue and trigger drain
// Returns the queued-sentinel shape the composer treats as success.
// ---------------------------------------------------------------------------

async function enqueueDraft(
  input: CreateMemoryInput,
  memoryId: string,
  thumbnailKey?: string | null,
): Promise<{ id: string; type: string; _queued: true }> {
  const localId = Crypto.randomUUID();

  let localMediaUri: string | null = null;
  let mimeType: string | null = null;
  let posterUri: string | null = null;
  let durationSeconds: number | null = null;
  let mediaSizeBytes: number | null = null;
  let body: string | null = null;

  if (input.type === "photo") {
    localMediaUri = input.imageUri;
    mimeType = input.mimeType;
    posterUri = input.imageUri; // queued card thumbnail
    body = input.body ?? null;
  } else if (input.type === "ticket") {
    localMediaUri = input.imageUri ?? null;
    mimeType = input.mimeType ?? null;
    body = input.body ?? null;
  } else if (input.type === "video") {
    localMediaUri = input.videoUri;
    mimeType = input.mimeType;
    posterUri = input.posterUri;
    durationSeconds = input.durationSeconds || null;
    mediaSizeBytes = input.sizeBytes || null;
    body = input.body ?? null;
  } else if (input.type === "letter") {
    body = input.body;
  }

  await insertQueueRow({
    localId,
    coupleSpaceId: input.coupleSpaceId,
    memoryId,
    userId: input.userId,
    type: input.type,
    title: input.title ?? null,
    body,
    localMediaUri,
    posterUri,
    thumbnailKey: thumbnailKey ?? null,
    mimeType,
    dateHappened: input.dateHappened,
    tags: normalizeTags(input.tags ?? []),
    placeName: input.place_name ?? null,
    latitude: input.latitude ?? null,
    longitude: input.longitude ?? null,
    durationSeconds,
    mediaSizeBytes,
    createdAt: getCurrentISOTimestamp(),
    status: "queued",
    error: null,
    retryCount: 0,
    uploadId: null,
    uploadKey: null,
    parts: [],
    bytesUploaded: 0,
    bytesTotal: 0,
  });

  refreshQueue();
  // Only trigger a drain if we're actually online — no point starting a cycle
  // that will immediately fail and burn retry counts.
  getIsOnline().then((isOnline) => {
    if (isOnline) triggerDrain();
  });

  return { id: memoryId, type: input.type, _queued: true };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

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

      // Offline fast-path: enqueue immediately without attempting any upload
      const online = await getIsOnline();
      if (!online) {
        return enqueueDraft(input, memoryId);
      }

      // Online path — attempt inline upload + insert.
      // Wrap in try/catch: on a network-class error (connection dropped mid-flight),
      // fall back to enqueue so the memory is not lost (audit #3).
      try {
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
          if ((input.sizeBytes ?? 0) > MULTIPART_THRESHOLD_BYTES) {
            // Heavy video: upload poster immediately then queue the main file.
            // Poster upload can also fail with a network error — let it propagate
            // to the outer catch so the whole thing is enqueued (with null thumbnailKey).
            const posterHandle = uploadMemoryImage({
              fileUri: input.posterUri,
              coupleSpaceId: input.coupleSpaceId,
              memoryId,
              mimeType: 'image/jpeg',
              variant: 'thumb',
            });
            const { key: uploadedThumbnailKey } = await posterHandle.result;
            return enqueueDraft(input, memoryId, uploadedThumbnailKey);
          }

          // Normal-size video: single-PUT inline
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
          body: input.type === "letter" ? input.body
              : input.type === "photo" || input.type === "video" || input.type === "ticket"
                ? (input.body ?? null)
                : null,
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
      } catch (err) {
        // On network-class errors, fall back to queue rather than surfacing failure
        if (isNetworkError(err)) {
          return enqueueDraft(input, memoryId);
        }
        throw err;
      }
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
