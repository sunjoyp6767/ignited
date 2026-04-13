import type { AppRole } from "@/lib/profile/build-public-user-row";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

/**
 * Ensures the current user is signed in and has the expected role in `public.users`.
 */
export async function requireDashboardRole(expected: AppRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/dashboard/${expected}`);
  }

  const { data: row } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!row?.role) {
    redirect("/login?next=/dashboard");
  }

  if (row.role !== expected) {
    redirect("/dashboard");
  }
}
