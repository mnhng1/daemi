import * as FileSystem from "expo-file-system";
import { supabase } from "../../lib/supabase/client";
import {
  getQueueRow,
  updateQueueUploadMeta,
  updateQueueParts,
  updateQueueProgress,
  QueuePart,
} from "../queue/db";
import { UploadHandle } from "./upload-memory-image";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PART_SIZE = 50 * 1024 * 1024; // 50 MiB
const MAX_CONCURRENT = 3;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MultipartParams {
  localId: string;
  fileUri: string;
  coupleSpaceId: string;
  memoryId: string;
  mimeType: string;
  onProgress?: (percent: number) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a base64 string to Uint8Array without btoa size limits. */
function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** PUT a single part to a presigned URL and return the ETag. */
function putPart(url: string, data: Uint8Array): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    // S3/R2 multipart parts must NOT include a Content-Type header — omit it.
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          const etag =
            xhr.getResponseHeader("ETag") ??
            xhr.getResponseHeader("etag");
          if (!etag) {
            reject(new Error("Part upload succeeded but response contained no ETag header — cannot complete multipart upload"));
            return;
          }
          resolve(etag);
        } else if (xhr.status === 0) {
          reject(new Error(`Part upload failed: status 0 — "${xhr.responseText}"`));
        } else {
          reject(
            new Error(
              `Part upload failed: HTTP ${xhr.status} — ${xhr.responseText || "no response body"}`,
            ),
          );
        }
      }
    };
    xhr.onerror = () => reject(new Error("Part upload failed: network error (onerror fired)"));
    xhr.ontimeout = () => reject(new Error("Part upload failed: request timed out"));
    xhr.send(data);
  });
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export function uploadMultipart(params: MultipartParams): UploadHandle {
  const { localId, fileUri, coupleSpaceId, memoryId, mimeType, onProgress } = params;

  let aborted = false;

  const result = (async (): Promise<{ key: string }> => {
    // ------------------------------------------------------------------
    // 1. Get file size
    // ------------------------------------------------------------------
    const info = await FileSystem.getInfoAsync(fileUri);
    if (!info.exists) throw new Error(`File not found: ${fileUri}`);
    const fileSize: number = info.size ?? 0;
    if (fileSize === 0) throw new Error("File size is 0 — cannot multipart upload");

    const totalParts = Math.ceil(fileSize / PART_SIZE);
    console.log("[multipart] file size", fileSize, "total parts", totalParts);

    // ------------------------------------------------------------------
    // 2. Resume: check existing uploadId in queue row
    // ------------------------------------------------------------------
    let uploadId: string;
    let key: string;

    const queueRow = await getQueueRow(localId);

    if (queueRow?.uploadId) {
      // Resume: read both uploadId AND key from the persisted DB row so we
      // never silently reconstruct a path that differs from what the edge fn
      // originally generated.
      uploadId = queueRow.uploadId;
      if (!queueRow.uploadKey) {
        throw new Error(
          "Queue row has uploadId but no uploadKey — cannot safely resume multipart upload",
        );
      }
      key = queueRow.uploadKey;
      console.log("[multipart] resuming upload", { uploadId, key });
    } else {
      // Fresh start: invoke create-multipart
      console.log("[multipart] creating multipart upload", { coupleSpaceId, memoryId, mimeType });
      const { data, error } = await supabase.functions.invoke("media-presign", {
        body: { action: "create-multipart", coupleSpaceId, memoryId, mimeType },
      });
      if (error) {
        console.error("[multipart] create-multipart failed", error);
        throw error;
      }
      const resp = data as { uploadId: string; key: string };
      if (!resp.uploadId || !resp.key) {
        throw new Error("media-presign create-multipart returned invalid response");
      }
      uploadId = resp.uploadId;
      key = resp.key;
      // Persist both uploadId and key together so a future resume can read the
      // canonical key back from the DB rather than reconstructing it.
      await updateQueueUploadMeta(localId, uploadId, key);
      console.log("[multipart] created upload", { uploadId, key });
    }

    // ------------------------------------------------------------------
    // 3. Build pending part numbers (skip already-done parts)
    // ------------------------------------------------------------------
    const refreshedRow = await getQueueRow(localId);
    const doneParts: QueuePart[] = refreshedRow?.parts ?? [];
    const doneSet = new Set(doneParts.map((p) => p.partNumber));

    const allPartNumbers = Array.from({ length: totalParts }, (_, i) => i + 1);
    const pendingPartNumbers = allPartNumbers.filter((n) => !doneSet.has(n));

    console.log(
      "[multipart] done parts",
      doneParts.length,
      "pending",
      pendingPartNumbers.length,
    );

    // Running list of all completed parts (done + newly uploaded)
    const completedParts: QueuePart[] = [...doneParts];

    let bytesUploaded = doneParts.length * PART_SIZE; // approximate for resume

    // ------------------------------------------------------------------
    // 4. Upload pending parts in batches of MAX_CONCURRENT
    // ------------------------------------------------------------------
    for (let batchStart = 0; batchStart < pendingPartNumbers.length; batchStart += MAX_CONCURRENT) {
      if (aborted) throw new Error("Upload aborted by user");

      const batch = pendingPartNumbers.slice(batchStart, batchStart + MAX_CONCURRENT);

      const batchResults = await Promise.all(
        batch.map(async (partNumber) => {
          // Check abort before starting any work for this part so that parts
          // launched in the same Promise.all batch can bail out early rather
          // than running to completion after the user taps abort.
          if (aborted) throw new Error("Upload aborted by user");

          const offset = (partNumber - 1) * PART_SIZE;
          const length = Math.min(PART_SIZE, fileSize - offset);

          // a. Get presigned URL for this part
          console.log("[multipart] signing part", { partNumber, uploadId, key });
          const { data: signData, error: signError } = await supabase.functions.invoke(
            "media-presign",
            {
              body: { action: "sign-part", coupleSpaceId, memoryId, uploadId, key, partNumber },
            },
          );
          if (signError) {
            console.error("[multipart] sign-part failed", signError);
            throw signError;
          }
          const { url: partUrl } = signData as { url: string };
          if (!partUrl) throw new Error(`sign-part returned no url for part ${partNumber}`);

          // b. Read the chunk from the local file as base64
          console.log("[multipart] reading part", { partNumber, offset, length });
          const b64 = await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType.Base64,
            position: offset,
            length,
          });

          // c. Convert base64 -> Uint8Array
          const partData = base64ToUint8Array(b64);

          // d. XHR PUT -> capture ETag
          console.log("[multipart] uploading part", { partNumber, bytes: partData.length });
          const etag = await putPart(partUrl, partData);
          console.log("[multipart] part done", { partNumber, etag });

          return { partNumber, etag } as QueuePart;
        }),
      );

      // e. After batch: persist completed parts and progress
      completedParts.push(...batchResults);
      completedParts.sort((a, b) => a.partNumber - b.partNumber);

      bytesUploaded = Math.min(completedParts.length * PART_SIZE, fileSize);

      await updateQueueParts(localId, completedParts);
      await updateQueueProgress(localId, bytesUploaded, fileSize);

      const percent = Math.round((completedParts.length / totalParts) * 100);
      onProgress?.(percent);
      console.log("[multipart] batch done, progress", percent, "%");
    }

    // ------------------------------------------------------------------
    // 5. Complete the multipart upload
    // ------------------------------------------------------------------
    console.log("[multipart] completing upload", { uploadId, key, parts: completedParts.length });
    const partsPayload = completedParts
      .slice()
      .sort((a, b) => a.partNumber - b.partNumber)
      .map((p) => ({ partNumber: p.partNumber, etag: p.etag }));

    const { data: completeData, error: completeError } = await supabase.functions.invoke(
      "media-presign",
      {
        body: { action: "complete-multipart", coupleSpaceId, memoryId, uploadId, key, parts: partsPayload },
      },
    );
    if (completeError) {
      console.error("[multipart] complete-multipart failed", completeError);
      throw completeError;
    }
    console.log("[multipart] upload complete", { key, completeData });

    onProgress?.(100);
    return { key };
  })();

  // Wrap the promise to call abort-multipart on unexpected error
  const wrappedResult = result.then(
    (val) => val,
    async (err: unknown) => {
      const message = err instanceof Error ? err.message : String(err);
      const intentionalAbort = aborted || message === "Upload aborted by user";

      if (!intentionalAbort) {
        // Try to retrieve uploadId and the persisted key for the abort call.
        // Never reconstruct the key from coupleSpaceId/memoryId — use only
        // the value the edge fn originally returned and we persisted.
        try {
          const row = await getQueueRow(localId);
          if (row?.uploadId && row.uploadKey) {
            console.warn("[multipart] aborting due to error", message);
            await supabase.functions.invoke("media-presign", {
              body: { action: "abort-multipart", coupleSpaceId, memoryId, uploadId: row.uploadId, key: row.uploadKey },
            });
          } else if (row?.uploadId) {
            console.warn("[multipart] skipping abort-multipart — uploadKey not persisted yet");
          }
        } catch (abortErr) {
          console.warn("[multipart] abort-multipart call failed (ignoring)", abortErr);
        }
      }

      throw err;
    },
  );

  return {
    abort: () => {
      aborted = true;
    },
    result: wrappedResult,
  };
}
