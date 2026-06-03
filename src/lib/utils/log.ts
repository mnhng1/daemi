/**
 * Minimal structured logging for the app.
 *
 * React Native has no logging framework installed — `console.*` is the
 * transport and shows up in the Metro / Expo terminal (and device logs).
 * These helpers normalize Supabase `PostgrestError` objects (which carry
 * `message`, `code`, `details`, `hint`) so failures are actually visible
 * instead of being swallowed by bare `catch {}` blocks.
 */

type SupabaseLikeError = {
  message?: string;
  code?: string;
  details?: string;
  hint?: string;
};

function asError(error: unknown): SupabaseLikeError {
  if (error && typeof error === "object") return error as SupabaseLikeError;
  return { message: String(error) };
}

/** Log an error with a `[daemi:<scope>]` prefix and all Supabase error fields. */
export function logError(scope: string, error: unknown): void {
  const e = asError(error);
  console.error(`[daemi:${scope}]`, {
    message: e.message ?? String(error),
    code: e.code,
    details: e.details,
    hint: e.hint,
  });
}

/** Human-readable single-line message, including the error code when present. */
export function errorMessage(error: unknown): string {
  const e = asError(error);
  if (e.message) return e.code ? `${e.message} (${e.code})` : e.message;
  return String(error);
}
