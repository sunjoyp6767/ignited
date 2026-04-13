import type { User } from "@supabase/supabase-js";

const ROLES = ["student", "teacher", "accountant"] as const;
export type AppRole = (typeof ROLES)[number];

export type PublicUserRow = {
  id: string;
  name: string;
  role: AppRole;
};

export type BuildPublicUserRowResult =
  | { ok: true; row: PublicUserRow }
  | { ok: false; message: string };

function isAppRole(value: string): value is AppRole {
  return (ROLES as readonly string[]).includes(value);
}

/**
 * Derives the `public.users` upsert payload from Supabase Auth `user` + optional form payload.
 */
export function buildPublicUserRow(
  user: User,
  payload?: { name: string; role: string }
): BuildPublicUserRowResult {
  const meta = user.user_metadata ?? {};
  const nameFromPayload = payload?.name?.trim();
  const roleFromPayload = payload?.role?.trim().toLowerCase();

  const name =
    nameFromPayload ||
    (typeof meta.name === "string" ? meta.name.trim() : "") ||
    user.email?.split("@")[0] ||
    "User";

  const roleRaw =
    roleFromPayload ||
    (typeof meta.role === "string" ? meta.role.trim().toLowerCase() : "");

  if (!isAppRole(roleRaw)) {
    return {
      ok: false,
      message:
        "Your profile is missing a valid role. Re-register or contact support.",
    };
  }

  return {
    ok: true,
    row: { id: user.id, name, role: roleRaw },
  };
}
