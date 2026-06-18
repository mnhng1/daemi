import { supabase } from "../../lib/supabase/client";

type UploadAvatarParams = {
  fileUri: string;
  coupleSpaceId: string;
  mimeType: string;
};

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function putAvatar(url: string, fileUri: string, contentType: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else if (xhr.status === 0) {
          reject(new Error(`Avatar upload failed: status 0 — native: "${xhr.responseText}"`));
        } else {
          reject(
            new Error(`Avatar upload failed: HTTP ${xhr.status} — ${xhr.responseText || "no response body"}`),
          );
        }
      }
    };
    xhr.onerror = () => reject(new Error("Avatar upload failed: network error (onerror fired)"));
    xhr.ontimeout = () => reject(new Error("Avatar upload failed: request timed out"));

    xhr.send({ uri: fileUri, type: contentType, name: "avatar" } as unknown as Blob);
  });
}

/**
 * Upload a profile avatar via a single presigned PUT to R2 (no multipart, no queue).
 * Mirrors the memory-image upload mechanic but uses the `avatar-upload` action, which
 * needs no memoryId — the Edge Function derives the key from the authenticated user.
 * Returns the R2 object key to persist in `profiles.avatar_url`.
 */
export async function uploadAvatarImage(params: UploadAvatarParams): Promise<{ key: string }> {
  const { fileUri, coupleSpaceId, mimeType } = params;

  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      await delay(RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1));
    }

    // Re-fetch a fresh presigned URL on every attempt — avoids iOS reusing a stale
    // connection state that can cause a status-0 failure.
    const { data, error } = await supabase.functions.invoke("media-presign", {
      body: { action: "avatar-upload", coupleSpaceId, mimeType },
    });
    if (error) throw error;
    const { url, key } = data as { url: string; key: string };
    if (!url || !key) throw new Error("media-presign returned invalid response");

    try {
      await putAvatar(url, fileUri, mimeType);
      return { key };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      // Only retry the transient iOS status-0 case; surface everything else immediately.
      if (!lastError.message.includes("status 0")) throw lastError;
    }
  }

  throw lastError ?? new Error("Avatar upload failed");
}
