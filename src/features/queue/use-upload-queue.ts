import { useEffect, useRef, useState } from 'react';
import { getQueueRows } from './db';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QueuedMemory = {
  _isQueued: true;
  id: string;
  coupleSpaceId: string;
  memoryId: string;
  type: 'photo' | 'video' | 'ticket' | 'letter';
  title: string | null;
  body: string | null;
  posterUri: string | null;
  thumbnailKey: string | null;
  localMediaUri: string | null;
  dateHappened: string;
  tags: string[];
  status: 'queued' | 'uploading' | 'failed';
  bytesUploaded: number;
  bytesTotal: number;
  retryCount: number;
  error: string | null;
};

// ---------------------------------------------------------------------------
// Module-level listener registry for refreshQueue()
// ---------------------------------------------------------------------------

type ReloadCallback = () => void;
const _listeners = new Set<ReloadCallback>();

/**
 * Notify all active useUploadQueue hooks to reload from SQLite immediately.
 * Call this after inserting, updating, or deleting rows outside the hook.
 */
export function refreshQueue(): void {
  _listeners.forEach((cb) => cb());
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useUploadQueue(
  spaceId?: string,
  typeFilter?: string,
): { queued: QueuedMemory[] } {
  const [queued, setQueued] = useState<QueuedMemory[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = async () => {
    if (!spaceId) {
      setQueued([]);
      return;
    }

    try {
      const rows = await getQueueRows(spaceId, typeFilter);
      const mapped: QueuedMemory[] = rows
        .filter(
          (r) =>
            r.status === 'queued' ||
            r.status === 'uploading' ||
            r.status === 'failed',
        )
        .map((r) => ({
          _isQueued: true as const,
          id: r.localId,
          coupleSpaceId: r.coupleSpaceId,
          memoryId: r.memoryId,
          type: r.type as 'photo' | 'video' | 'ticket' | 'letter',
          title: r.title,
          body: r.body,
          posterUri: r.posterUri,
          thumbnailKey: r.thumbnailKey,
          localMediaUri: r.localMediaUri,
          dateHappened: r.dateHappened,
          tags: r.tags,
          status: r.status as 'queued' | 'uploading' | 'failed',
          bytesUploaded: r.bytesUploaded,
          bytesTotal: r.bytesTotal,
          retryCount: r.retryCount,
          error: r.error,
        }));

      setQueued(mapped);

      // Poll while any item is actively uploading
      const hasUploading = mapped.some((m) => m.status === 'uploading');
      if (hasUploading && !intervalRef.current) {
        intervalRef.current = setInterval(load, 2000);
      } else if (!hasUploading && intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } catch (_err) {
      // SQLite not yet initialised or unavailable — silently ignore
    }
  };

  useEffect(() => {
    // Register as a refresh listener
    _listeners.add(load);

    // Initial load
    load();

    return () => {
      _listeners.delete(load);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceId, typeFilter]);

  return { queued };
}
