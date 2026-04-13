import { ensureConversation } from "@/app/actions/messages";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Messages | Student",
  description: "Message your teachers",
};

type PageProps = {
  searchParams: Promise<{ teacherId?: string }>;
};

export default async function StudentMessagesPage({ searchParams }: PageProps) {
  const { teacherId: teacherParam } = await searchParams;

  if (teacherParam?.trim()) {
    const r = await ensureConversation(teacherParam.trim());
    if (r.ok) {
      redirect(`/dashboard/student/messages/${r.conversationId}`);
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: teachers } = await supabase
    .from("users")
    .select("id, name")
    .eq("role", "teacher")
    .order("name");

  const list =
    teachers?.map((t) => ({
      id: t.id as string,
      name: (t.name as string)?.trim() || "Teacher",
    })) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
        <p className="mt-1 text-sm text-gray-600">
          Open a conversation with any teacher. You can share meeting links and images.
        </p>
      </div>

      {teacherParam?.trim() ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Could not open a conversation with that teacher. Try again from the list below.
        </p>
      ) : null}

      {list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
          No teacher accounts are available yet.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {list.map((t) => (
            <li key={t.id}>
              <Link
                href={`/dashboard/student/messages?teacherId=${encodeURIComponent(t.id)}`}
                className="flex flex-col gap-1 px-4 py-3 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="font-medium text-gray-900">{t.name}</p>
                <span className="text-sm font-medium text-gray-900">Open chat →</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
