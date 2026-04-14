import { StudentSidebar } from "@/components/student/student-sidebar";
import { requireDashboardRole } from "@/lib/dashboard/require-role";
import { createClient } from "@/utils/supabase/server";
import type { ReactNode } from "react";

export default async function StudentDashboardLayout({ children }: { children: ReactNode }) {
  await requireDashboardRole("student");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let studentName = "Student";
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();
    if (profile?.name?.trim()) {
      studentName = profile.name.trim();
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      <StudentSidebar studentName={studentName} />
      <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
