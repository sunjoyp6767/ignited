"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type CourseResourceResult =
  | { ok: true }
  | { ok: false; message: string };

type TeacherGate =
  | { ok: true; user: { id: string } }
  | { ok: false; message: string; user: null };

async function assertTeacher(
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<TeacherGate> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false as const, message: "You must be signed in.", user: null };
  }
  const { data: row, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (error || row?.role !== "teacher") {
    return { ok: false as const, message: "Only teachers can update course resources.", user: null };
  }
  return { ok: true as const, user };
}

function parseDriveUrl(rawUrl: string): string | null {
  const value = rawUrl.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (!url.hostname.includes("drive.google.com")) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function updateCourseResource(input: {
  courseId: string;
  syllabusNodeLabel: string;
  resourceNotes: string;
}): Promise<CourseResourceResult> {
  const supabase = await createClient();
  const gate = await assertTeacher(supabase);
  if (!gate.ok) return { ok: false, message: gate.message };

  const node = input.syllabusNodeLabel.trim();
  const notes = input.resourceNotes.trim();
  if (!node) {
    return { ok: false, message: "Enter a syllabus node or topic label." };
  }

  const { data: course, error: loadErr } = await supabase
    .from("courses")
    .select("id, teacher_id")
    .eq("id", input.courseId)
    .maybeSingle();

  if (loadErr || !course || course.teacher_id !== gate.user.id) {
    return { ok: false, message: "Course not found or not owned by you." };
  }

  const { error } = await supabase
    .from("courses")
    .update({
      syllabus_node_label: node,
      resource_notes: notes,
    })
    .eq("id", input.courseId)
    .eq("teacher_id", gate.user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard/teacher");
  return { ok: true };
}

export async function createTeacherResource(input: {
  topicNode: string;
  fileName: string;
  fileUrl: string;
  resourceType: "pdf" | "video";
}): Promise<CourseResourceResult> {
  const supabase = await createClient();
  const gate = await assertTeacher(supabase);
  if (!gate.ok) return { ok: false, message: gate.message };

  const topicNode = input.topicNode.trim();
  const fileName = input.fileName.trim();
  const url = parseDriveUrl(input.fileUrl);
  const resourceType = input.resourceType;
  if (!topicNode || !fileName || !url) {
    return { ok: false, message: "Topic, title, and a valid Google Drive URL are required." };
  }
  if (resourceType !== "pdf" && resourceType !== "video") {
    return { ok: false, message: "Resource type must be pdf or video." };
  }

  const { error } = await supabase.from("resources").insert({
    teacher_id: gate.user.id,
    subject: topicNode,
    file_name: fileName,
    file_url: url,
    resource_type: resourceType,
  });
  if (error) return { ok: false, message: error.message };

  revalidatePath("/dashboard/teacher/resources");
  revalidatePath("/dashboard/student/resources");
  return { ok: true };
}

export async function deleteTeacherResource(input: { resourceId: string }): Promise<CourseResourceResult> {
  const supabase = await createClient();
  const gate = await assertTeacher(supabase);
  if (!gate.ok) return { ok: false, message: gate.message };

  const resourceId = input.resourceId.trim();
  if (!resourceId) return { ok: false, message: "Resource id is required." };

  const { data: row, error: loadError } = await supabase
    .from("resources")
    .select("id, teacher_id")
    .eq("id", resourceId)
    .maybeSingle();
  if (loadError || !row) return { ok: false, message: "Resource not found." };
  if (row.teacher_id !== gate.user.id) {
    return { ok: false, message: "You can only delete your own resources." };
  }

  const { error } = await supabase.from("resources").delete().eq("id", resourceId);
  if (error) return { ok: false, message: error.message };

  revalidatePath("/dashboard/teacher/resources");
  revalidatePath("/dashboard/student/resources");
  return { ok: true };
}

export async function createCourseOutline(input: {
  courseName: string;
  syllabusCode: string;
}): Promise<CourseResourceResult> {
  const supabase = await createClient();
  const gate = await assertTeacher(supabase);
  if (!gate.ok) return { ok: false, message: gate.message };

  const name = input.courseName.trim();
  const code = input.syllabusCode.trim().toUpperCase();
  if (!name || !code) {
    return { ok: false, message: "Course name and syllabus code are required." };
  }

  const { error } = await supabase.from("courses").insert({
    teacher_id: gate.user.id,
    course_name: name,
    syllabus_code: code,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard/teacher");
  revalidatePath("/dashboard/teacher/mock-exams");
  return { ok: true };
}

