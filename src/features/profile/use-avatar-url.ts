import { useQuery } from "@tanstack/react-query";
import { getAvatarUrl } from "./get-avatar-url";

/**
 * Resolve a renderable URL for a stored avatar key. `avatarKey` is the value held in
 * `profiles.avatar_url` (an R2 object key). Disabled when no space or key is present.
 */
export function useAvatarUrl(coupleSpaceId: string | undefined, avatarKey: string | null | undefined) {
  return useQuery({
    queryKey: ["avatar-url", coupleSpaceId, avatarKey],
    queryFn: () => getAvatarUrl(coupleSpaceId!, avatarKey!),
    staleTime: 50 * 60 * 1000,
    enabled: !!coupleSpaceId && !!avatarKey,
  });
}
