import { StartConversationForm } from "@/components/messaging/start-conversation-form";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "New conversation | Teacher",
};

export default async function TeacherNewMessagePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: students } = await supabase
    .from("users")
    .select("id, name")
    .eq("role", "student")
    .order("name");

  const options =
    students?.map((s) => ({
      id: s.id as string,
      name: (s.name as string)?.trim() || "Student",
    })) ?? [];

  return (
    <div className="w-full space-y-6 px-8 py-8">
      <div>
        <Link href="/dashboard/teacher/messages" className="text-sm text-gray-600 hover:text-gray-900">
          ← Back to inbox
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">New conversation</h1>
        <p className="mt-1 text-sm text-gray-600">Choose any student to start or continue a chat.</p>
      </div>

      {options.length === 0 ? (
        <p className="text-sm text-gray-600">There are no student accounts yet.</p>
      ) : (
        <StartConversationForm students={options} />
      )}
    </div>
  );
}
