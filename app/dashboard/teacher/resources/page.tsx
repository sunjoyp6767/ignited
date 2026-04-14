import { TeacherResourcesManager } from "@/components/teacher/teacher-resources-manager";
import { requireDashboardRole } from "@/lib/dashboard/require-role";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher resources",
  description: "Publish and manage learning resources for students.",
};

export default async function TeacherResourcesPage() {
  await requireDashboardRole("teacher");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const teacherId = user?.id ?? "";
  const { data: resources } = await supabase
    .from("resources")
    .select("id, file_name, subject, file_url, resource_type, uploaded_at")
    .eq("teacher_id", teacherId)
    .order("uploaded_at", { ascending: false });

  return (
    <div className="w-full px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Resource publisher</h1>
        <p className="mt-2 text-sm text-gray-600">
          Upload Google Drive PDF/video links by topic and title. Students see them under My resources.
        </p>
      </header>
      <TeacherResourcesManager resources={resources ?? []} />
    </div>
  );
}
