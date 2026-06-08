import { supabase } from "../../lib/supabase/client";

type UploadParams = {
  fileUri: string;
  coupleSpaceId: string;
  memoryId: string;
  mimeType: string;
  variant?: "original" | "thumb";
  onProgress?: (percent: number) => void;
};

export type UploadHandle = {
  abort: () => void;
  result: Promise<{ key: string }>;
};

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000;

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function uploadWithProgress(
  url: string,
  fileUri: string,
  contentType: string,
  signal: AbortSignal,
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

    // Wire AbortController to xhr.abort()
    signal.addEventListener("abort", () => {
      xhr.abort();
      reject(new Error("Upload aborted by user"));
    });

    xhr.send({ uri: fileUri, type: contentType, name: "upload" } as unknown as Blob);
  });
}

export function uploadMemoryImage(params: UploadParams): UploadHandle {
  const controller = new AbortController();

  const result = (async () => {
    const { fileUri, coupleSpaceId, memoryId, mimeType, variant, onProgress } = params;

    let lastError: Error | undefined;
    let key: string | undefined;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      if (controller.signal.aborted) throw new Error("Upload aborted by user");

      if (attempt > 0) {
        const retryDelay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
        console.log(`[upload] retry ${attempt}/${MAX_RETRIES} after ${retryDelay}ms`);
        onProgress?.(0);
        await delay(retryDelay);
        if (controller.signal.aborted) throw new Error("Upload aborted by user");
      }

      // Re-fetch a fresh presigned URL on every attempt — avoids iOS reusing a
      // stale connection state that caused the previous status-0 failure.
      console.log("[upload] requesting presigned URL", { coupleSpaceId, memoryId, mimeType, variant, attempt });
      const { data, error } = await supabase.functions.invoke("media-presign", {
        body: { action: "upload", coupleSpaceId, memoryId, mimeType, variant },
      });
      if (error) {
        console.error("[upload] presign failed", error);
        throw error;
      }
      const { url, key: k } = data as { url: string; key: string };
      if (!url || !k) throw new Error("media-presign returned invalid response");
      key = k;

      console.log("[upload] got presigned URL, starting XHR PUT", { key, fileUri: fileUri.slice(0, 60) });

      try {
        await uploadWithProgress(url, fileUri, mimeType, controller.signal, onProgress);
        console.log("[upload] success", { key, attempt });
        return { key };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.warn(`[upload] attempt ${attempt} failed:`, lastError.message);

        if (controller.signal.aborted || lastError.message === "Upload aborted by user") {
          throw lastError;
        }

        if (!lastError.message.includes("status 0")) {
          throw lastError;
        }
      }
    }

    console.error("[upload] all retries exhausted", lastError);
    throw lastError;
  })();

  return { abort: () => controller.abort(), result };
}
