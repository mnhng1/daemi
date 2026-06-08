import * as SQLite from 'expo-sqlite';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface QueuePart {
  partNumber: number;
  etag: string;
}

export interface QueueRow {
  localId: string;
  coupleSpaceId: string;
  memoryId: string;
  userId: string;
  type: string;
  title: string | null;
  body: string | null;
  localMediaUri: string | null;
  posterUri: string | null;
  thumbnailKey: string | null;
  mimeType: string | null;
  dateHappened: string;
  tags: string[];
  /** Places lens: carried through the queue so a location picked on a heavy
   *  video survives until the queue processor inserts the memory row. */
  placeName: string | null;
  latitude: number | null;
  longitude: number | null;
  durationSeconds: number | null;
  mediaSizeBytes: number | null;
  createdAt: string;
  status: string;
  error: string | null;
  retryCount: number;
  uploadId: string | null;
  /** R2 object key for the in-progress multipart upload — persisted so resume
   *  does not have to reconstruct the path from function parameters. */
  uploadKey: string | null;
  parts: QueuePart[];
  bytesUploaded: number;
  bytesTotal: number;
}

// ---------------------------------------------------------------------------
// Raw SQL row shape (as returned by expo-sqlite)
// ---------------------------------------------------------------------------

interface RawRow {
  local_id: string;
  couple_space_id: string;
  memory_id: string;
  user_id: string;
  type: string;
  title: string | null;
  body: string | null;
  local_media_uri: string | null;
  poster_uri: string | null;
  thumbnail_key: string | null;
  mime_type: string | null;
  date_happened: string;
  tags: string;
  place_name: string | null;
  latitude: number | null;
  longitude: number | null;
  duration_seconds: number | null;
  media_size_bytes: number | null;
  created_at: string;
  status: string;
  error: string | null;
  retry_count: number;
  upload_id: string | null;
  upload_key: string | null;
  parts: string | null;
  bytes_uploaded: number;
  bytes_total: number;
}

// ---------------------------------------------------------------------------
// Singleton DB handle
// ---------------------------------------------------------------------------

let _db: SQLite.SQLiteDatabase | null = null;

async function getQueueDb(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  const db = await SQLite.openDatabaseAsync('daemi-queue.db');

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS upload_queue (
      local_id            TEXT PRIMARY KEY,
      couple_space_id     TEXT NOT NULL,
      memory_id           TEXT NOT NULL,
      user_id             TEXT NOT NULL,
      type                TEXT NOT NULL,
      title               TEXT,
      body                TEXT,
      local_media_uri     TEXT,
      poster_uri          TEXT,
      thumbnail_key       TEXT,
      mime_type           TEXT,
      date_happened       TEXT NOT NULL,
      tags                TEXT NOT NULL DEFAULT '[]',
      place_name          TEXT,
      latitude            REAL,
      longitude           REAL,
      duration_seconds    INTEGER,
      media_size_bytes    INTEGER,
      created_at          TEXT NOT NULL,
      status              TEXT NOT NULL DEFAULT 'queued',
      error               TEXT,
      retry_count         INTEGER NOT NULL DEFAULT 0,
      upload_id           TEXT,
      upload_key          TEXT,
      parts               TEXT DEFAULT '[]',
      bytes_uploaded      INTEGER DEFAULT 0,
      bytes_total         INTEGER DEFAULT 0
    );
  `);

  _db = db;
  return db;
}

// ---------------------------------------------------------------------------
// Row mapper
// ---------------------------------------------------------------------------

function mapRow(raw: RawRow): QueueRow {
  return {
    localId: raw.local_id,
    coupleSpaceId: raw.couple_space_id,
    memoryId: raw.memory_id,
    userId: raw.user_id,
    type: raw.type,
    title: raw.title,
    body: raw.body,
    localMediaUri: raw.local_media_uri,
    posterUri: raw.poster_uri,
    thumbnailKey: raw.thumbnail_key,
    mimeType: raw.mime_type,
    dateHappened: raw.date_happened,
    tags: JSON.parse(raw.tags ?? '[]'),
    placeName: raw.place_name ?? null,
    latitude: raw.latitude ?? null,
    longitude: raw.longitude ?? null,
    durationSeconds: raw.duration_seconds,
    mediaSizeBytes: raw.media_size_bytes,
    createdAt: raw.created_at,
    status: raw.status,
    error: raw.error,
    retryCount: raw.retry_count,
    uploadId: raw.upload_id,
    uploadKey: raw.upload_key ?? null,
    parts: JSON.parse(raw.parts ?? '[]'),
    bytesUploaded: raw.bytes_uploaded ?? 0,
    bytesTotal: raw.bytes_total ?? 0,
  };
}

// ---------------------------------------------------------------------------
// CRUD
// ---------------------------------------------------------------------------

export async function insertQueueRow(row: QueueRow): Promise<void> {
  const db = await getQueueDb();
  await db.runAsync(
    `INSERT INTO upload_queue (
      local_id, couple_space_id, memory_id, user_id, type, title, body,
      local_media_uri, poster_uri, thumbnail_key, mime_type, date_happened,
      tags, place_name, latitude, longitude,
      duration_seconds, media_size_bytes, created_at, status, error,
      retry_count, upload_id, upload_key, parts, bytes_uploaded, bytes_total
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?, ?
    )`,
    [
      row.localId,
      row.coupleSpaceId,
      row.memoryId,
      row.userId,
      row.type,
      row.title ?? null,
      row.body ?? null,
      row.localMediaUri ?? null,
      row.posterUri ?? null,
      row.thumbnailKey ?? null,
      row.mimeType ?? null,
      row.dateHappened,
      JSON.stringify(row.tags),
      row.placeName ?? null,
      row.latitude ?? null,
      row.longitude ?? null,
      row.durationSeconds ?? null,
      row.mediaSizeBytes ?? null,
      row.createdAt,
      row.status,
      row.error ?? null,
      row.retryCount,
      row.uploadId ?? null,
      row.uploadKey ?? null,
      JSON.stringify(row.parts),
      row.bytesUploaded,
      row.bytesTotal,
    ],
  );
}

export async function updateQueueStatus(
  localId: string,
  status: string,
  error?: string | null,
): Promise<void> {
  const db = await getQueueDb();
  await db.runAsync(
    `UPDATE upload_queue SET status = ?, error = ? WHERE local_id = ?`,
    [status, error ?? null, localId],
  );
}

export async function updateQueueProgress(
  localId: string,
  bytesUploaded: number,
  bytesTotal: number,
): Promise<void> {
  const db = await getQueueDb();
  await db.runAsync(
    `UPDATE upload_queue SET bytes_uploaded = ?, bytes_total = ? WHERE local_id = ?`,
    [bytesUploaded, bytesTotal, localId],
  );
}

export async function updateQueueParts(
  localId: string,
  parts: QueuePart[],
): Promise<void> {
  const db = await getQueueDb();
  await db.runAsync(
    `UPDATE upload_queue SET parts = ? WHERE local_id = ?`,
    [JSON.stringify(parts), localId],
  );
}

export async function updateQueueUploadId(
  localId: string,
  uploadId: string,
): Promise<void> {
  const db = await getQueueDb();
  await db.runAsync(
    `UPDATE upload_queue SET upload_id = ? WHERE local_id = ?`,
    [uploadId, localId],
  );
}

export async function updateQueueUploadMeta(
  localId: string,
  uploadId: string,
  uploadKey: string,
): Promise<void> {
  const db = await getQueueDb();
  await db.runAsync(
    `UPDATE upload_queue SET upload_id = ?, upload_key = ? WHERE local_id = ?`,
    [uploadId, uploadKey, localId],
  );
}

export async function getQueueRows(
  coupleSpaceId: string,
  typeFilter?: string,
): Promise<QueueRow[]> {
  const db = await getQueueDb();
  let rows: RawRow[];
  if (typeFilter) {
    rows = await db.getAllAsync<RawRow>(
      `SELECT * FROM upload_queue WHERE couple_space_id = ? AND type = ? ORDER BY created_at ASC`,
      [coupleSpaceId, typeFilter],
    );
  } else {
    rows = await db.getAllAsync<RawRow>(
      `SELECT * FROM upload_queue WHERE couple_space_id = ? ORDER BY created_at ASC`,
      [coupleSpaceId],
    );
  }
  return rows.map(mapRow);
}

export async function getQueueRow(localId: string): Promise<QueueRow | null> {
  const db = await getQueueDb();
  const raw = await db.getFirstAsync<RawRow>(
    `SELECT * FROM upload_queue WHERE local_id = ?`,
    [localId],
  );
  return raw ? mapRow(raw) : null;
}

export async function deleteQueueRow(localId: string): Promise<void> {
  const db = await getQueueDb();
  await db.runAsync(
    `DELETE FROM upload_queue WHERE local_id = ?`,
    [localId],
  );
}

export async function resetStuckUploading(): Promise<void> {
  const db = await getQueueDb();
  await db.runAsync(
    `UPDATE upload_queue SET status = 'queued' WHERE status = 'uploading'`,
  );
}

export async function incrementRetry(localId: string): Promise<void> {
  const db = await getQueueDb();
  await db.runAsync(
    `UPDATE upload_queue SET retry_count = retry_count + 1 WHERE local_id = ?`,
    [localId],
  );
}
