import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Messages | Teacher",
  description: "Conversations with students",
};

export default async function TeacherMessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rows } = await supabase
    .from("conversations")
    .select(
      `
      id,
      updated_at,
      users!student_id ( name )
    `
    )
    .eq("teacher_id", user.id)
    .order("updated_at", { ascending: false });

  const list =
    rows?.map((r) => {
      const ru = r.users as unknown;
      const u = Array.isArray(ru) ? ru[0] : ru;
      return {
        id: r.id as string,
        updated_at: r.updated_at as string,
        studentName:
          u && typeof u === "object" && "name" in u ? String((u as { name: string }).name) : "Student",
      };
    }) ?? [];

  return (
    <div className="w-full space-y-6 px-8 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="mt-1 text-sm text-gray-600">Chat with any student in the system.</p>
        </div>
        <Link
          href="/dashboard/teacher/messages/new"
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          New conversation
        </Link>
      </div>

      {list.length === 0 ? (
        <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-600">
          No conversations yet. Start one with a student.
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white">
          {list.map((row) => (
            <li key={row.id}>
              <Link
                href={`/dashboard/teacher/messages/${row.id}`}
                className="flex flex-col gap-1 px-4 py-3 hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="font-medium text-gray-900">{row.studentName}</p>
                <p className="text-xs text-gray-500">{new Date(row.updated_at).toLocaleString()}</p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
