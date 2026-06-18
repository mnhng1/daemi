import { supabase } from "../../lib/supabase/client";

/**
 * Presign a GET URL for an avatar object key (e.g. couple-spaces/{id}/avatars/{userId}.jpg).
 * Unlike memory media, avatars have no memoryId — uses the `avatar-download` action.
 */
export async function getAvatarUrl(coupleSpaceId: string, key: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke("media-presign", {
    body: { action: "avatar-download", coupleSpaceId, key },
  });
  if (error) throw error;
  const { url } = data as { url: string };
  if (!url) throw new Error("media-presign returned no URL");
  return url;
}
