import { useQuery } from "@tanstack/react-query";
import { getMediaUrlForKey } from "./get-media-url";

/**
 * Presigns the thumbnail_url key (thumb.jpg) for a memory.
 * Note: thumbnail_url stores a storage KEY, not a URL.
 * Must pass memoryId=memory.id so the edge function's memory-existence check passes.
 */
export function useThumbnailUrl(memory: {
  id: string;
  couple_space_id: string;
  thumbnail_url: string | null;
} | null) {
  return useQuery({
    queryKey: ["thumbnail-url", memory?.id, memory?.thumbnail_url],
    queryFn: () =>
      getMediaUrlForKey(
        memory!.couple_space_id,
        memory!.id,
        memory!.thumbnail_url!,
      ),
    staleTime: 50 * 60 * 1000,
    enabled: !!memory && !!memory.thumbnail_url,
  });
}
