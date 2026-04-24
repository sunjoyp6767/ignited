import { TeacherBlogManager } from "@/components/teacher/teacher-blog-manager";
import { requireDashboardRole } from "@/lib/dashboard/require-role";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher blog",
  description: "Write blog articles and exam tips for public blog page.",
};

export default async function TeacherBlogPage() {
  await requireDashboardRole("teacher");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const teacherId = user?.id ?? "";

  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, is_published, published_at, created_at")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  return (
    <div className="w-full px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Teacher blog editor</h1>
        <p className="mt-2 text-sm text-gray-600">
          Publish articles and exam tips to the public blog page.
        </p>
      </header>
      <TeacherBlogManager posts={posts ?? []} />
    </div>
  );
}
