"use server";

import {
  CHAT_IMAGE_MAX_BYTES,
  CHAT_IMAGE_MIME_TYPES,
  CHAT_UPLOADS_BUCKET,
} from "@/lib/messaging/constants";
import { createClient } from "@/utils/supabase/server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";

type Result = { ok: true } | { ok: false; message: string };
type ConversationResult =
  | { ok: true; conversationId: string }
  | { ok: false; message: string };

type MessagingGate =
  | { ok: false; message: string }
  | {
      ok: true;
      supabase: Awaited<ReturnType<typeof createClient>>;
      user: NonNullable<{ id: string }>;
      role: "teacher" | "student";
    };

async function assertSignedIn(): Promise<MessagingGate> {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false, message: "You must be signed in." };
  }
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (!profile?.role || (profile.role !== "teacher" && profile.role !== "student")) {
    return { ok: false, message: "Only teachers and students can use messaging." };
  }
  return { ok: true, supabase, user, role: profile.role };
}

async function getOrCreateConversationRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  teacherUserId: string,
  studentUserId: string
): Promise<{ ok: true; conversationId: string } | { ok: false; message: string }> {
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("teacher_id", teacherUserId)
    .eq("student_id", studentUserId)
    .maybeSingle();
  if (existing?.id) {
    return { ok: true, conversationId: existing.id };
  }

  const { data: inserted, error } = await supabase
    .from("conversations")
    .insert({ teacher_id: teacherUserId, student_id: studentUserId })
    .select("id")
    .maybeSingle();

  if (inserted?.id) {
    return { ok: true, conversationId: inserted.id };
  }

  if (error?.code === "23505") {
    const { data: again } = await supabase
      .from("conversations")
      .select("id")
      .eq("teacher_id", teacherUserId)
      .eq("student_id", studentUserId)
      .maybeSingle();
    if (again?.id) return { ok: true, conversationId: again.id };
  }

  return { ok: false, message: error?.message ?? "Could not open conversation." };
}

/**
 * Opens or creates a 1:1 thread with another user. Teachers must pass a student; students must pass a teacher.
 */
export async function ensureConversation(peerId: string): Promise<ConversationResult> {
  const gate = await assertSignedIn();
  if (!gate.ok) return { ok: false, message: gate.message };
  const { supabase, user, role } = gate;

  const peer = peerId.trim();
  if (!peer) return { ok: false, message: "Select a user." };
  if (peer === user.id) return { ok: false, message: "You cannot message yourself." };

  const { data: peerProfile } = await supabase.from("users").select("role").eq("id", peer).maybeSingle();
  if (!peerProfile?.role) {
    return { ok: false, message: "User not found." };
  }

  if (role === "teacher") {
    if (peerProfile.role !== "student") {
      return { ok: false, message: "You can only message students." };
    }
    return getOrCreateConversationRow(supabase, user.id, peer);
  }

  if (peerProfile.role !== "teacher") {
    return { ok: false, message: "You can only message teachers." };
  }
  return getOrCreateConversationRow(supabase, peer, user.id);
}

function extensionForMime(mime: string): string {
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

export async function sendMessage(input: {
  conversationId: string;
  body: string;
  image?: File | null;
}): Promise<Result> {
  const gate = await assertSignedIn();
  if (!gate.ok) return { ok: false, message: gate.message };
  const supabase = gate.supabase;

  const conversationId = input.conversationId.trim();
  const body = (input.body ?? "").trim();
  const file = input.image ?? null;

  if (!conversationId) return { ok: false, message: "Conversation is required." };

  if (!body && !file) {
    return { ok: false, message: "Enter a message or attach an image." };
  }

  if (file) {
    if (file.size > CHAT_IMAGE_MAX_BYTES) {
      return { ok: false, message: "Image must be 5 MB or smaller." };
    }
    const mime = file.type;
    if (!CHAT_IMAGE_MIME_TYPES.includes(mime as (typeof CHAT_IMAGE_MIME_TYPES)[number])) {
      return { ok: false, message: "Only JPEG, PNG, WebP, or GIF images are allowed." };
    }
  }

  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .select("id")
    .eq("id", conversationId)
    .maybeSingle();
  if (convErr || !conv) {
    return { ok: false, message: "Conversation not found or access denied." };
  }

  let imagePath: string | null = null;
  if (file) {
    const ext = extensionForMime(file.type);
    const objectPath = `${conversationId}/${randomUUID()}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const { error: upErr } = await supabase.storage.from(CHAT_UPLOADS_BUCKET).upload(objectPath, buf, {
      contentType: file.type,
      upsert: false,
    });
    if (upErr) {
      const msg = upErr.message ?? "";
      if (/bucket not found/i.test(msg)) {
        return {
          ok: false,
          message:
            "Image storage is not set up yet. In Supabase: run migrations/20260419_ensure_chat_uploads_bucket.sql (or create a private bucket named \"chat-uploads\"), then try again.",
        };
      }
      return { ok: false, message: msg };
    }
    imagePath = objectPath;
  }

  const { error: insErr } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: gate.user.id,
    body: body || "",
    image_path: imagePath,
  });

  if (insErr) {
    return { ok: false, message: insErr.message };
  }

  revalidatePath("/dashboard/teacher/messages");
  revalidatePath(`/dashboard/teacher/messages/${conversationId}`);
  revalidatePath("/dashboard/student/messages");
  revalidatePath(`/dashboard/student/messages/${conversationId}`);

  return { ok: true };
}
