import { AppState, AppStateStatus } from 'react-native';
import { supabase } from '../../lib/supabase/client';
import { normalizeTags } from '../../lib/utils/text';
import { uploadMultipart } from '../media/upload-multipart';
import { uploadMemoryImage } from '../media/upload-memory-image';
import type { UploadHandle } from '../media/upload-memory-image';
import type { Database } from '../../types/database';
import {
  deleteQueueRow,
  getQueueRows,
  incrementRetry,
  resetStuckUploading,
  updateQueueStatus,
} from './db';
import type { QueueRow } from './db';
import { refreshQueue } from './use-upload-queue';

type MemoryInsert = Database['public']['Tables']['memories']['Insert'];

// ---------------------------------------------------------------------------
// Constants & state
// ---------------------------------------------------------------------------

const MAX_RETRIES = 5;

let _onComplete: (() => void) | null = null;

/** Tracks the current AppState subscription so we only register once. */
let _appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

/** Stored context so the AppState handler and triggerDrain can re-trigger the drain. */
let _processorContext: { coupleSpaceId: string; userId: string } | null = null;

/** Map from localId → active upload handle so UI can trigger abort. */
const _activeHandles = new Map<string, UploadHandle>();

/** Drain lock: true while a drain pass is running. */
let _draining = false;

/** Set to true if a drain trigger arrives while a drain is already running.
 *  The finishing drain will run one more pass before releasing the lock. */
let _rerun = false;

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
// Trigger drain (for external callers e.g. post-enqueue)
// ---------------------------------------------------------------------------

/** Call after enqueuing a row (or when connectivity returns) to ensure a drain
 *  pass runs. Safe to call at any time — the drain lock prevents double-runs. */
export function triggerDrain(): void {
  if (!_processorContext) return;
  const { coupleSpaceId, userId } = _processorContext;
  drainQueue(coupleSpaceId, userId);
}

// ---------------------------------------------------------------------------
// Drain
// ---------------------------------------------------------------------------

async function drainQueue(coupleSpaceId: string, userId: string): Promise<void> {
  if (_draining) {
    _rerun = true;
    return;
  }

  _draining = true;
  try {
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
  } finally {
    _draining = false;
    if (_rerun) {
      _rerun = false;
      drainQueue(coupleSpaceId, userId);
    }
  }
}

// ---------------------------------------------------------------------------
// Build the memory insert object (shared by all branches)
// ---------------------------------------------------------------------------

function buildMemoryInsert(
  row: QueueRow,
  storageKey: string | null,
): MemoryInsert {
  return {
    id: row.memoryId,
    couple_space_id: row.coupleSpaceId,
    type: row.type as MemoryInsert['type'],
    title: row.title ?? null,
    body: row.body ?? null,
    storage_key: storageKey,
    thumbnail_url: row.thumbnailKey ?? null,
    duration_seconds: row.durationSeconds ?? null,
    media_size_bytes: row.mediaSizeBytes ?? null,
    media_mime: row.mimeType ?? null,
    date_happened: row.dateHappened,
    created_by_user_id: row.userId,
    tags: normalizeTags(row.tags),
    place_name: row.placeName ?? null,
    latitude: row.latitude ?? null,
    longitude: row.longitude ?? null,
  };
}

// ---------------------------------------------------------------------------
// Process a single row
// ---------------------------------------------------------------------------

async function processRow(
  row: QueueRow,
  coupleSpaceId: string,
  userId: string,
): Promise<void> {
  const { localId, type, localMediaUri, mimeType, retryCount } = row;

  await updateQueueStatus(localId, 'uploading');
  refreshQueue();

  try {
    let storageKey: string | null = null;

    switch (type) {
      case 'video': {
        if (!localMediaUri || !mimeType) throw new Error('video row missing localMediaUri or mimeType');

        const handle = uploadMultipart({
          localId,
          fileUri: localMediaUri,
          coupleSpaceId: row.coupleSpaceId,
          memoryId: row.memoryId,
          mimeType,
          onProgress: refreshQueue,
        });

        _activeHandles.set(localId, handle);
        try {
          const result = await handle.result;
          storageKey = result.key;
        } finally {
          _activeHandles.delete(localId);
        }
        break;
      }

      case 'photo':
      case 'ticket': {
        if (localMediaUri && mimeType) {
          const handle = uploadMemoryImage({
            fileUri: localMediaUri,
            coupleSpaceId: row.coupleSpaceId,
            memoryId: row.memoryId,
            mimeType,
            onProgress: refreshQueue,
          });

          _activeHandles.set(localId, handle);
          try {
            const result = await handle.result;
            storageKey = result.key;
          } finally {
            _activeHandles.delete(localId);
          }
        }
        // ticket with no media: storageKey stays null (note-only)
        break;
      }

      case 'letter': {
        // No upload; storageKey stays null
        break;
      }

      default: {
        throw new Error(`queue-processor: unknown row type "${type}"`);
      }
    }

    // Idempotent upsert — safe to retry if insert succeeded but delete failed
    const { error: insertError } = await supabase
      .from('memories')
      .upsert([buildMemoryInsert(row, storageKey)], { onConflict: 'id', ignoreDuplicates: true });
    if (insertError) throw insertError;

    await deleteQueueRow(localId);
    refreshQueue();
    _onComplete?.();
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
