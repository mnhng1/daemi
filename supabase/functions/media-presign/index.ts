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
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const { action, coupleSpaceId, memoryId, mimeType } = body;

  if (action !== "upload" && action !== "download") {
    return jsonResponse({ error: "Invalid action. Must be 'upload' or 'download'" }, 400);
  }

  if (!UUID_RE.test(coupleSpaceId) || !UUID_RE.test(memoryId)) {
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

  if (action === "upload") {
    if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
      return jsonResponse({ error: "Unsupported or missing mimeType" }, 400);
    }

    const ext = MIME_TO_EXT[mimeType];
    const key = `couple-spaces/${coupleSpaceId}/memories/${memoryId}/original.${ext}`;

    const url = (await r2.sign(
      new Request(`${R2_URL}/${BUCKET}/${key}?X-Amz-Expires=600`, {
        method: "PUT",
        headers: { "Content-Type": mimeType },
      }),
      { aws: { signQuery: true } },
    )).url.toString();

    return jsonResponse({ url, key });
  }

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

  const url = (await r2.sign(
    new Request(`${R2_URL}/${BUCKET}/${body.key}?X-Amz-Expires=3600`),
    { aws: { signQuery: true } },
  )).url.toString();

  return jsonResponse({ url });
});
