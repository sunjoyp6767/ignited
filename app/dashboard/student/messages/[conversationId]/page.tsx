import { MessageThread, type ThreadMessage } from "@/components/messaging/message-thread";
import { signChatImagePaths } from "@/lib/messaging/signed-urls";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type PageProps = { params: Promise<{ conversationId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { conversationId } = await params;
  return { title: `Conversation | ${conversationId.slice(0, 8)}…` };
}

export default async function StudentConversationPage({ params }: PageProps) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select(
      `
      id,
      student_id,
      users!teacher_id ( name )
    `
    )
    .eq("id", conversationId)
    .maybeSingle();

  if (convErr || !conv || (conv.student_id as string) !== user.id) {
    notFound();
  }

  const { data: rawMessages, error: msgErr } = await supabase
    .from("messages")
    .select("id, sender_id, body, image_path, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (msgErr) {
    notFound();
  }

  const paths = (rawMessages ?? []).map((m) => m.image_path as string | null);
  const signed = await signChatImagePaths(supabase, paths);

  const initialMessages: ThreadMessage[] = (rawMessages ?? []).map((m, i) => ({
    id: m.id as string,
    sender_id: m.sender_id as string,
    body: (m.body as string) ?? "",
    imageUrl: signed[i] ?? null,
    created_at: m.created_at as string,
  }));

  const rawTeacher = conv.users as unknown;
  const teacherRow = Array.isArray(rawTeacher) ? rawTeacher[0] : rawTeacher;
  const teacherName =
    (teacherRow && typeof teacherRow === "object" && "name" in teacherRow
      ? String((teacherRow as { name: string }).name)
      : null) ?? "Teacher";

  return (
    <div className="w-full space-y-6 px-8 py-8">
      <div>
        <Link href="/dashboard/student/messages" className="text-sm text-gray-600 hover:text-gray-900">
          ← All teachers
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">{teacherName}</h1>
        <p className="text-sm text-gray-600">Teacher</p>
      </div>

      <MessageThread conversationId={conversationId} currentUserId={user.id} initialMessages={initialMessages} />
    </div>
  );
}
