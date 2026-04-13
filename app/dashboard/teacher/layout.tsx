import { TeacherSidebar } from "@/components/teacher/teacher-sidebar";
import { requireDashboardRole } from "@/lib/dashboard/require-role";
import { createClient } from "@/utils/supabase/server";
import type { ReactNode } from "react";

export default async function TeacherDashboardLayout({ children }: { children: ReactNode }) {
  await requireDashboardRole("teacher");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let teacherName = "Teacher";
  if (user) {
    const { data: profile } = await supabase.from("users").select("name").eq("id", user.id).maybeSingle();
    if (profile?.name?.trim()) teacherName = profile.name.trim();
  }

  return (
    <div className="flex min-h-screen w-full">
      <TeacherSidebar teacherName={teacherName} />
      <main className="min-w-0 flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
