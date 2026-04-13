"use server";

import { buildPublicUserRow } from "@/lib/profile/build-public-user-row";
import type { AppRole } from "@/lib/profile/build-public-user-row";
import { createClient } from "@/utils/supabase/server";

export type { AppRole };

export type ProfileResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Ensures a row exists in `public.users` for the current Supabase Auth user (server cookies).
 * For browser flows right after `signIn` / `signUp`, prefer `syncPublicUserProfileWithBrowserClient`
 * to avoid a cookie/session race with Server Actions.
 */
export async function ensurePublicUserProfile(payload?: {
  name: string;
  role: string;
}): Promise<ProfileResult> {
  const supabase = await createClient();
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
