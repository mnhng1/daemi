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
