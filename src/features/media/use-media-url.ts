import { useQuery } from "@tanstack/react-query";
import { getMediaUrl } from "./get-media-url";

export function useMediaUrl(memory: {
  id: string;
  couple_space_id: string;
  storage_key: string | null;
  media_url: string | null;
} | null) {
  return useQuery({
    queryKey: ["media-url", memory?.id, memory?.storage_key ?? memory?.media_url],
    queryFn: () => getMediaUrl(memory!),
    staleTime: 50 * 60 * 1000,
    enabled: !!memory && !!(memory.storage_key || memory.media_url),
  });
}
