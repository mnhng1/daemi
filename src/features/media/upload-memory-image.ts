import { supabase } from "../../lib/supabase/client";

type UploadParams = {
  imageUri: string;
  coupleSpaceId: string;
  memoryId: string;
  mimeType: string;
  onProgress?: (percent: number) => void;
};

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 300;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function uploadWithProgress(
  url: string,
  fileUri: string,
  contentType: string,
  onProgress?: (percent: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else if (xhr.status === 0) {
          reject(new Error(`Upload failed: status 0 — native: "${xhr.responseText}"`));
        } else {
          reject(new Error(`Upload failed: HTTP ${xhr.status} — ${xhr.responseText || "no response body"}`));
        }
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed: network error (onerror fired)"));
    xhr.ontimeout = () => reject(new Error("Upload failed: request timed out"));
    xhr.send({ uri: fileUri, type: contentType, name: "upload" } as unknown as Blob);
  });
}

export async function uploadMemoryImage({
  imageUri,
  coupleSpaceId,
  memoryId,
  mimeType,
  onProgress,
}: UploadParams) {
  console.log("[upload] requesting presigned URL", { coupleSpaceId, memoryId, mimeType });

  const { data, error } = await supabase.functions.invoke("media-presign", {
    body: { action: "upload", coupleSpaceId, memoryId, mimeType },
  });
  if (error) {
    console.error("[upload] presign failed", error);
    throw error;
  }
  const { url, key } = data as { url: string; key: string };
  if (!url || !key) throw new Error("media-presign returned invalid response");

  console.log("[upload] got presigned URL, starting XHR PUT", { key, imageUri: imageUri.slice(0, 60) });

  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[upload] retry ${attempt}/${MAX_RETRIES} after ${RETRY_DELAY_MS}ms`);
        onProgress?.(0);
        await delay(RETRY_DELAY_MS);
      }
      await uploadWithProgress(url, imageUri, mimeType, onProgress);
      console.log("[upload] success", { key, attempt });
      return { key };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[upload] attempt ${attempt} failed:`, lastError.message);
      if (!lastError.message.includes("status 0")) {
        throw lastError;
      }
    }
  }

  console.error("[upload] all retries exhausted", lastError);
  throw lastError;
}
