import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../../lib/supabase/client';
import { normalizeTags } from '../../lib/utils/text';
import { uploadMultipart, MultipartParams } from '../media/upload-multipart';
import type { UploadHandle } from '../media/upload-memory-image';
import {
  deleteQueueRow,
  getQueueRows,
  incrementRetry,
  resetStuckUploading,
  updateQueueStatus,
} from './db';
import type { QueueRow } from './db';
import { refreshQueue } from './use-upload-queue';

// ---------------------------------------------------------------------------
// Constants & state
// ---------------------------------------------------------------------------

const MAX_RETRIES = 5;

let _onComplete: (() => void) | null = null;

/** Tracks the current AppState subscription so we only register once. */
let _appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

/** Stored context so the AppState handler can re-trigger the drain. */
let _processorContext: { coupleSpaceId: string; userId: string } | null = null;

/** Map from localId → active upload handle so UI can trigger abort. */
const _activeHandles = new Map<string, UploadHandle>();

/** Return the abort function for a queued item, or null if not active. */
export function getUploadHandle(localId: string): UploadHandle | null {
  return _activeHandles.get(localId) ?? null;
}

export function setOnUploadComplete(cb: () => void): void {
  _onComplete = cb;
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function startQueueProcessor(
  coupleSpaceId: string,
  userId: string,
): Promise<void> {
  _processorContext = { coupleSpaceId, userId };

  // Re-drain the queue whenever the app returns to the foreground after an
  // OS-level background/suspension event.  This is the pragmatic recovery
  // path: if the process was merely suspended (not killed) in-flight XHRs
  // will be dead, so we reset any stuck 'uploading' rows and restart.
  if (!_appStateSubscription) {
    _appStateSubscription = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active' && _processorContext) {
          const { coupleSpaceId: spaceId, userId: uid } = _processorContext;
          resetStuckUploading().then(() => {
            refreshQueue();
            drainQueue(spaceId, uid);
          });
        }
      },
    );
  }

  await resetStuckUploading();
  refreshQueue();
  // Intentionally NOT awaited — runs in the background
  drainQueue(coupleSpaceId, userId);
}

// ---------------------------------------------------------------------------
// Drain
// ---------------------------------------------------------------------------

async function drainQueue(coupleSpaceId: string, userId: string): Promise<void> {
  const allRows = await getQueueRows(coupleSpaceId);
  const eligible = allRows.filter(
    (row) =>
      row.status === 'queued' &&
      row.userId === userId &&
      row.retryCount < MAX_RETRIES,
  );

  for (const row of eligible) {
    await processRow(row, coupleSpaceId, userId);
  }
}

// ---------------------------------------------------------------------------
// Process a single row
// ---------------------------------------------------------------------------

async function processRow(
  row: QueueRow,
  coupleSpaceId: string,
  userId: string,
): Promise<void> {
  const { localId, memoryId, type, title, body, localMediaUri, mimeType,
          dateHappened, durationSeconds, mediaSizeBytes, retryCount, thumbnailKey } = row;

  await updateQueueStatus(localId, 'uploading');
  refreshQueue();

  try {
    if (type === 'video' && localMediaUri && mimeType) {
      const handle = uploadMultipart({
        localId,
        fileUri: localMediaUri,
        coupleSpaceId,
        memoryId,
        mimeType,
        onProgress: refreshQueue,
      });

      _activeHandles.set(localId, handle);
      let storageKey: string;
      try {
        const result = await handle.result;
        storageKey = result.key;
      } finally {
        _activeHandles.delete(localId);
      }

      const { error: insertError } = await supabase.from('memories').insert([
        {
          id: memoryId,
          couple_space_id: coupleSpaceId,
          type,
          title: title ?? null,
          body: body ?? null,
          storage_key: storageKey,
          thumbnail_url: thumbnailKey ?? null,
          duration_seconds: durationSeconds ?? null,
          media_size_bytes: mediaSizeBytes ?? null,
          media_mime: mimeType,
          date_happened: dateHappened,
          created_by_user_id: userId,
          tags: normalizeTags(row.tags),
          place_name: row.placeName ?? null,
          latitude: row.latitude ?? null,
          longitude: row.longitude ?? null,
        },
      ]);

      if (insertError) throw insertError;

      await deleteQueueRow(localId);
      refreshQueue();
      _onComplete?.();
    }
  } catch (err) {
    await incrementRetry(localId);
    const newCount = retryCount + 1;
    await updateQueueStatus(
      localId,
      newCount >= MAX_RETRIES ? 'failed' : 'queued',
      String(err),
    );
    refreshQueue();
  }
}
