import { useQuery } from "@tanstack/react-query";
import { getMediaUrlForKey } from "./get-media-url";

/**
 * Presigns the video storage_key with a long expiry (12h = 43200s, server-clamped max).
 * staleTime is raised to ~11h to match, so a remount doesn't hand back a stale-but-expired URL.
 *
 * expo-video reuses ONE signed URL for ALL range requests in a session (finding I1),
 * so a seek after the 60min photo URL would 403. This hook uses the long expiry to prevent that.
 */

const VIDEO_EXPIRES_SECONDS = 43200; // 12h — server-clamped max
const VIDEO_STALE_TIME_MS = 11 * 60 * 60 * 1000; // 11h in ms

export function useVideoUrl(memory: {
  id: string;
  couple_space_id: string;
  storage_key: string | null;
} | null) {
  return useQuery({
    queryKey: ["video-url", memory?.id, memory?.storage_key],
    queryFn: () =>
      getMediaUrlForKey(
        memory!.couple_space_id,
        memory!.id,
        memory!.storage_key!,
        VIDEO_EXPIRES_SECONDS,
      ),
    staleTime: VIDEO_STALE_TIME_MS,
    enabled: !!memory && !!memory.storage_key,
  });
}
