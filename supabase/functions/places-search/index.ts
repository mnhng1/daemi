import { createClient } from "npm:@supabase/supabase-js";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, content-type, x-client-info, apikey",
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const MAX_INPUT_LENGTH = 200;

const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");

if (!GOOGLE_PLACES_API_KEY) {
  throw new Error("Missing required GOOGLE_PLACES_API_KEY environment variable");
}

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
    input?: string;
    placeId?: string;
    sessionToken: string;
  };
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid request body" }, 400);
  }

  const { action, coupleSpaceId, sessionToken } = body;

  if (action !== "autocomplete" && action !== "details") {
    return jsonResponse(
      { error: "Invalid action. Must be 'autocomplete' or 'details'" },
      400,
    );
  }

  if (!UUID_RE.test(coupleSpaceId)) {
    return jsonResponse({ error: "Invalid coupleSpaceId format" }, 400);
  }

  // Session token bundles the autocomplete keystrokes + the terminating details
  // call into one Google billing session. The client generates a v4 UUID.
  if (!UUID_RE.test(sessionToken)) {
    return jsonResponse({ error: "Invalid sessionToken format" }, 400);
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

  if (action === "autocomplete") {
    const input = (body.input ?? "").trim();
    if (input.length < 2) {
      return jsonResponse({ suggestions: [] });
    }

    const cappedInput = input.slice(0, MAX_INPUT_LENGTH);

    const googleRes = await fetch(
      "https://places.googleapis.com/v1/places:autocomplete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
        },
        body: JSON.stringify({ input: cappedInput, sessionToken }),
      },
    );

    if (!googleRes.ok) {
      console.error(
        `Places autocomplete provider error: ${googleRes.status} ${googleRes.statusText}`,
      );
      return jsonResponse({ error: "places_provider_error" }, 502);
    }

    let data: { suggestions?: unknown[] };
    try {
      data = await googleRes.json();
    } catch {
      console.error("Places autocomplete: malformed provider response");
      return jsonResponse({ error: "places_provider_error" }, 502);
    }
    const suggestions = (data.suggestions ?? [])
      .map((s: any) => ({
        placeId: s.placePrediction?.placeId,
        description: s.placePrediction?.text?.text,
      }))
      .filter((s: { placeId?: string; description?: string }) =>
        s.placeId && s.description
      );

    return jsonResponse({ suggestions });
  }

  // action === "details"
  const placeId = body.placeId;
  if (typeof placeId !== "string" || placeId.length === 0) {
    return jsonResponse({ error: "placeId is required for details" }, 400);
  }

  // Place Details (New) takes the session token as a `sessionToken` query
  // param (NOT a header) to bundle billing with the autocomplete session.
  const detailsUrl = new URL(
    `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
  );
  detailsUrl.searchParams.set("sessionToken", sessionToken);

  const googleRes = await fetch(detailsUrl, {
    method: "GET",
    headers: {
      "X-Goog-Api-Key": GOOGLE_PLACES_API_KEY,
      "X-Goog-FieldMask": "displayName,formattedAddress,location",
    },
  });

  if (!googleRes.ok) {
    console.error(
      `Places details provider error: ${googleRes.status} ${googleRes.statusText}`,
    );
    return jsonResponse({ error: "places_provider_error" }, 502);
  }

  let data: {
    displayName?: { text?: string };
    formattedAddress?: string;
    location?: { latitude?: number; longitude?: number };
  };
  try {
    data = await googleRes.json();
  } catch {
    console.error("Places details: malformed provider response");
    return jsonResponse({ error: "places_provider_error" }, 502);
  }
  return jsonResponse({
    place_name: data.displayName?.text ?? data.formattedAddress ?? "",
    latitude: data.location?.latitude ?? null,
    longitude: data.location?.longitude ?? null,
  });
});
