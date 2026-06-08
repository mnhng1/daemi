import { supabase } from "../../lib/supabase/client";

export async function getMediaUrl(memory: {
  id: string;
  couple_space_id: string;
  storage_key: string | null;
  media_url: string | null;
}): Promise<string | null> {
  if (memory.storage_key) {
    const { data, error } = await supabase.functions.invoke("media-presign", {
      body: {
        action: "download",
        coupleSpaceId: memory.couple_space_id,
        memoryId: memory.id,
        key: memory.storage_key,
      },
    });
    if (error) throw error;
    const { url } = data as { url: string };
    if (!url) throw new Error("media-presign returned no URL");
    return url;
  }
  return memory.media_url;
}

/** Presign an arbitrary key (e.g. thumb.jpg) within a memory's folder. */
export async function getMediaUrlForKey(
  coupleSpaceId: string,
  memoryId: string,
  key: string,
  expires?: number,
): Promise<string> {
  const body: Record<string, unknown> = {
    action: "download",
    coupleSpaceId,
    memoryId,
    key,
  };
  if (expires !== undefined) {
    body.expires = expires;
  }
  const { data, error } = await supabase.functions.invoke("media-presign", { body });
  if (error) throw error;
  const { url } = data as { url: string };
  if (!url) throw new Error("media-presign returned no URL");
  return url;
}
