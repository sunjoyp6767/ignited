/*
  Resources are stored in public.resources. RLS (prototype): authenticated users can read all rows.
  See init_schema.sql / migrations for policies.
*/

import { ResourcesFilter } from "@/components/student/resources-filter";
import type { ResourceRow } from "@/lib/student/resource-types";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My resources",
  description: "Course materials from your teachers.",
};

export default async function StudentResourcesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let resources: ResourceRow[] = [];

  if (user) {
    const { data: rows, error: resErr } = await supabase
      .from("resources")
      .select("id, teacher_id, file_name, subject, file_url, resource_type, uploaded_at")
      .order("uploaded_at", { ascending: false });

    if (!resErr && rows) {
      resources = rows.map((r) => ({
        id: r.id,
        teacher_id: r.teacher_id,
        file_name: r.file_name,
        subject: r.subject,
        file_url: r.file_url,
        resource_type: r.resource_type as "pdf" | "video",
        uploaded_at: r.uploaded_at,
      }));
    }
  }

  return (
    <div className="w-full">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">My resources</h1>
        <p className="mt-2 text-sm text-gray-600">
          Materials from faculty, organised by subject (enrollment not required in this prototype).
        </p>
      </header>

      <ResourcesFilter resources={resources} />
    </div>
  );
}
