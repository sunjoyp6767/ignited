import { buildPublicUserRow } from "@/lib/profile/build-public-user-row";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Upserts `public.users` using the **browser** Supabase client (same session as sign-in/up).
 * Avoids a race where a Server Action runs before auth cookies are visible to the server.
 */
export async function syncPublicUserProfileWithBrowserClient(
  supabase: SupabaseClient,
  payload?: { name: string; role: string }
): Promise<{ ok: true } | { ok: false; message: string }> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return {
      ok: false,
      message: "Unable to verify your session. Please try signing in again.",
    };
  }

  const built = buildPublicUserRow(user, payload);
  if (!built.ok) {
    return built;
  }

  const { error } = await supabase
    .from("users")
    .upsert(built.row, { onConflict: "id" });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
