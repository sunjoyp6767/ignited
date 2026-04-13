import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "IgnitED role dashboard",
};

export default async function DashboardRouterPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.role) {
    redirect("/login?next=/dashboard");
  }

  switch (profile.role) {
    case "student":
      redirect("/dashboard/student");
    case "teacher":
      redirect("/dashboard/teacher");
    case "accountant":
      redirect("/dashboard/accountant");
    default:
      redirect("/login?next=/dashboard");
  }
}
