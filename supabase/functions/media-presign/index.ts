import { createClient } from "npm:@supabase/supabase-js";
import { AwsClient } from "npm:aws4fetch";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, content-type, x-client-info, apikey",
};

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "video/mp4",
  "video/quicktime",
]);

// Avatars are images only — no video.
const AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const R2_ACCOUNT_ID = Deno.env.get("R2_ACCOUNT_ID");
const R2_ACCESS_KEY_ID = Deno.env.get("R2_ACCESS_KEY_ID");
const R2_SECRET_ACCESS_KEY = Deno.env.get("R2_SECRET_ACCESS_KEY");

if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY) {
  throw new Error("Missing required R2 environment variables");
}

const R2_URL = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
const BUCKET = "daemi-media";

const r2 = new AwsClient({
  service: "s3",
  region: "auto",
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function validateMultipartKey(
  k: string | undefined,
  coupleSpaceId: string,
): Response | null {
  if (!k) return jsonResponse({ error: "key is required" }, 400);
  if (!k.startsWith(`couple-spaces/${coupleSpaceId}/`)) {
    return jsonResponse({ error: "Invalid key for this couple space" }, 403);
  }
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return jsonResponse({ error: "Missing authorization header" }, 401);
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } },
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return jsonResponse({ error: "Invalid or expired token" }, 401);
  }

  let body: {
    action: string;
    coupleSpaceId: string;
    memoryId: string;
    mimeType?: string;
    key?: string;
    variant?: "original" | "thumb";
    expires?: number;
    uploadId?: string;
    partNumber?: number;
    parts?: Array<{ partNumber: number; etag: string }>;
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const { action, coupleSpaceId, memoryId, mimeType } = body;

  const VALID_ACTIONS = new Set([
    "upload",
    "download",
    "avatar-upload",
    "avatar-download",
    "create-multipart",
    "sign-part",
    "complete-multipart",
    "abort-multipart",
  ]);
  if (!VALID_ACTIONS.has(action)) {
    return jsonResponse(
      {
        error:
          "Invalid action. Must be one of: upload, download, avatar-upload, avatar-download, create-multipart, sign-part, complete-multipart, abort-multipart",
      },
      400,
    );
  }

  // Avatar actions have no memory row, so they do not carry a memoryId. Every
  // other action still requires both UUIDs exactly as before (behavior preserved).
  const isAvatarAction = action === "avatar-upload" || action === "avatar-download";
  if (!UUID_RE.test(coupleSpaceId)) {
    return jsonResponse({ error: "Invalid coupleSpaceId format" }, 400);
  }
  if (!isAvatarAction && !UUID_RE.test(memoryId)) {
    return jsonResponse({ error: "Invalid coupleSpaceId or memoryId format" }, 400);
  }

  const { data: membership, error: memberError } = await supabase
    .from("couple_members")
    .select("id")
    .eq("couple_space_id", coupleSpaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (memberError || !membership) {
    return jsonResponse({ error: "Not a member of this couple space" }, 403);
  }

  // ── upload ─────────────────────────────────────────────────────────────────

  if (action === "upload") {
    const variant = body.variant ?? "original";

    let uploadMimeType: string;
    let key: string;
    if (variant === "thumb") {
      uploadMimeType = "image/jpeg";
      key = `couple-spaces/${coupleSpaceId}/memories/${memoryId}/thumb.jpg`;
    } else {
      if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
        return jsonResponse({ error: "Unsupported or missing mimeType" }, 400);
      }
      const ext = MIME_TO_EXT[mimeType];
      uploadMimeType = mimeType;
      key = `couple-spaces/${coupleSpaceId}/memories/${memoryId}/original.${ext}`;
    }

    const url = (await r2.sign(
      new Request(`${R2_URL}/${BUCKET}/${key}?X-Amz-Expires=600`, {
        method: "PUT",
        headers: { "Content-Type": uploadMimeType },
      }),
      { aws: { signQuery: true } },
    )).url.toString();

    return jsonResponse({ url, key });
  }

  // ── download ───────────────────────────────────────────────────────────────

  if (action === "download") {
    if (!body.key) {
      return jsonResponse({ error: "key is required for download" }, 400);
    }

    if (!body.key.startsWith(`couple-spaces/${coupleSpaceId}/`)) {
      return jsonResponse({ error: "Invalid key for this couple space" }, 403);
    }

    const { data: memory } = await supabase
      .from("memories")
      .select("id")
      .eq("id", memoryId)
      .eq("couple_space_id", coupleSpaceId)
      .maybeSingle();

    if (!memory) {
      return jsonResponse({ error: "Memory not found in this couple space" }, 404);
    }

    const requestedExpires = typeof body.expires === "number" ? body.expires : 3600;
    const clampedExpires = Math.min(requestedExpires, 43200);

    const url = (await r2.sign(
      new Request(`${R2_URL}/${BUCKET}/${body.key}?X-Amz-Expires=${clampedExpires}`),
      { aws: { signQuery: true } },
    )).url.toString();

    return jsonResponse({ url });
  }

  // ── avatar-upload ────────────────────────────────────────────────────────────
  // No memory row exists for avatars. The key is derived from the authenticated
  // user (JWT `user.id`), never a client-supplied id, so a member cannot overwrite
  // their partner's avatar. The membership check above already gates the space.

  if (action === "avatar-upload") {
    if (!mimeType || !AVATAR_MIME_TYPES.has(mimeType)) {
      return jsonResponse({ error: "Unsupported or missing mimeType for avatar" }, 400);
    }
    const ext = MIME_TO_EXT[mimeType];
    const key = `couple-spaces/${coupleSpaceId}/avatars/${user.id}.${ext}`;

    const url = (await r2.sign(
      new Request(`${R2_URL}/${BUCKET}/${key}?X-Amz-Expires=600`, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
      }),
      { aws: { signQuery: true } },
    )).url.toString();

    return jsonResponse({ url, key });
  }

  // ── avatar-download ──────────────────────────────────────────────────────────
  // Either partner may read an avatar in their shared space (membership-gated),
  // but there is no memories-table lookup — avatars are not memory rows.

  if (action === "avatar-download") {
    if (!body.key) {
      return jsonResponse({ error: "key is required for download" }, 400);
    }
    if (!body.key.startsWith(`couple-spaces/${coupleSpaceId}/avatars/`)) {
      return jsonResponse({ error: "Invalid avatar key for this couple space" }, 403);
    }

    const requestedExpires = typeof body.expires === "number" ? body.expires : 3600;
    const clampedExpires = Math.min(requestedExpires, 43200);

    const url = (await r2.sign(
      new Request(`${R2_URL}/${BUCKET}/${body.key}?X-Amz-Expires=${clampedExpires}`),
      { aws: { signQuery: true } },
    )).url.toString();

    return jsonResponse({ url });
  }

  // ── create-multipart ───────────────────────────────────────────────────────

  if (action === "create-multipart") {
    // The edge function generates the key — caller must NOT supply one.
    // This keeps the R2 path canonical and prevents path-injection attacks.
    if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
      return jsonResponse({ error: "Unsupported or missing mimeType" }, 400);
    }
    const ext = MIME_TO_EXT[mimeType];
    const key = `couple-spaces/${coupleSpaceId}/memories/${memoryId}/original.${ext}`;

    const initReq = await r2.sign(
      new Request(`${R2_URL}/${BUCKET}/${key}?uploads`, { method: "POST" }),
    );
    const initRes = await fetch(initReq);
    if (!initRes.ok) {
      const text = await initRes.text();
      return jsonResponse({ error: "Failed to initiate multipart upload", detail: text }, 502);
    }
    const xml = await initRes.text();
    const match = xml.match(/<UploadId>([^<]+)<\/UploadId>/);
    if (!match) {
      return jsonResponse({ error: "Could not parse UploadId from R2 response" }, 502);
    }
    return jsonResponse({ uploadId: match[1], key });
  }

  // ── sign-part ──────────────────────────────────────────────────────────────

  if (action === "sign-part") {
    const keyErr = validateMultipartKey(body.key, coupleSpaceId);
    if (keyErr) return keyErr;
    if (!body.uploadId) return jsonResponse({ error: "uploadId is required" }, 400);
    if (
      body.partNumber === undefined ||
      !Number.isInteger(body.partNumber) ||
      body.partNumber < 1 ||
      body.partNumber > 10000
    ) {
      return jsonResponse({ error: "partNumber must be an integer between 1 and 10000" }, 400);
    }

    const key = body.key!;
    const qs =
      `partNumber=${body.partNumber}&uploadId=${encodeURIComponent(body.uploadId)}&X-Amz-Expires=900`;
    const signed = await r2.sign(
      new Request(`${R2_URL}/${BUCKET}/${key}?${qs}`, { method: "PUT" }),
      { aws: { signQuery: true } },
    );
    return jsonResponse({ url: signed.url.toString() });
  }

  // ── complete-multipart ─────────────────────────────────────────────────────

  if (action === "complete-multipart") {
    const keyErr = validateMultipartKey(body.key, coupleSpaceId);
    if (keyErr) return keyErr;
    if (!body.uploadId) return jsonResponse({ error: "uploadId is required" }, 400);
    if (!Array.isArray(body.parts) || body.parts.length === 0) {
      return jsonResponse({ error: "parts array is required and must not be empty" }, 400);
    }

    const key = body.key!;
    const sorted = [...body.parts].sort((a, b) => a.partNumber - b.partNumber);
    const partsXml = sorted
      .map(
        (p) =>
          `<Part><PartNumber>${p.partNumber}</PartNumber><ETag>${p.etag}</ETag></Part>`,
      )
      .join("");
    const xmlBody = `<CompleteMultipartUpload>${partsXml}</CompleteMultipartUpload>`;

    const completeReq = await r2.sign(
      new Request(
        `${R2_URL}/${BUCKET}/${key}?uploadId=${encodeURIComponent(body.uploadId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/xml" },
          body: xmlBody,
        },
      ),
    );
    const completeRes = await fetch(completeReq);
    if (!completeRes.ok) {
      const text = await completeRes.text();
      return jsonResponse({ error: "Failed to complete multipart upload", detail: text }, 502);
    }
    return jsonResponse({ key });
  }

  // ── abort-multipart ────────────────────────────────────────────────────────

  if (action === "abort-multipart") {
    const keyErr = validateMultipartKey(body.key, coupleSpaceId);
    if (keyErr) return keyErr;
    if (!body.uploadId) return jsonResponse({ error: "uploadId is required" }, 400);

    const key = body.key!;
    const abortReq = await r2.sign(
      new Request(
        `${R2_URL}/${BUCKET}/${key}?uploadId=${encodeURIComponent(body.uploadId)}`,
        { method: "DELETE" },
      ),
    );
    const abortRes = await fetch(abortReq);
    if (!abortRes.ok) {
      const text = await abortRes.text();
      return jsonResponse({ error: "Failed to abort multipart upload", detail: text }, 502);
    }
    return jsonResponse({ ok: true });
  }

  // Should never reach here given VALID_ACTIONS guard above
  return jsonResponse({ error: "Unhandled action" }, 500);
});
