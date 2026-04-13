"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

type Result = { ok: true } | { ok: false; message: string };

async function assertRole(role: "teacher" | "student") {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { ok: false as const, message: "You must be signed in.", supabase, user: null };

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (profile?.role !== role) {
    return {
      ok: false as const,
      message: role === "teacher" ? "Only teachers can manage mock exams." : "Only students can submit mock exams.",
      supabase,
      user: null,
    };
  }
  return { ok: true as const, supabase, user };
}

export async function createMockExam(input: {
  courseId: string;
  title: string;
  topicNode: string;
  durationMinutes: number;
  questionCount: number;
  startsAt?: string;
  endsAt?: string;
}): Promise<Result> {
  const gate = await assertRole("teacher");
  if (!gate.ok) return { ok: false, message: gate.message };
  const supabase = gate.supabase;

  const courseId = input.courseId.trim();
  const title = input.title.trim();
  const topicNode = input.topicNode.trim();
  const count = Math.max(1, Math.min(50, Math.floor(input.questionCount)));
  if (!courseId || !title || !topicNode) return { ok: false, message: "Course, title, and topic are required." };

  const { data: course } = await supabase
    .from("courses")
    .select("id, syllabus_code")
    .eq("id", courseId)
    .eq("teacher_id", gate.user.id)
    .maybeSingle();
  if (!course) return { ok: false, message: "Course not found or not owned by you." };

  const { data: questionRows } = await supabase
    .from("questions")
    .select("id")
    .eq("syllabus_code", course.syllabus_code)
    .eq("topic_node", topicNode)
    .in("question_pool", ["mock", "both"])
    .limit(count);
  if (!questionRows?.length) {
    return {
      ok: false,
      message: `No questions in the bank for syllabus ${course.syllabus_code} and topic "${topicNode}". Add MCQs under Teacher → Questions with the same syllabus_code and topic_node, or run init_schema.sql sample data.`,
    };
  }

  const { data: exam, error: examError } = await supabase
    .from("mock_exams")
    .insert({
      teacher_id: gate.user.id,
      course_id: courseId,
      title,
      topic_node: topicNode,
      duration_minutes: input.durationMinutes,
      starts_at: input.startsAt || null,
      ends_at: input.endsAt || null,
      is_published: true,
    })
    .select("id")
    .single();
  if (examError || !exam) return { ok: false, message: examError?.message ?? "Failed to create exam." };

  const items = questionRows.map((row, idx) => ({
    mock_exam_id: exam.id,
    question_id: row.id,
    order_no: idx + 1,
    marks: 1,
  }));
  const { error: itemError } = await supabase.from("mock_exam_items").insert(items);
  if (itemError) return { ok: false, message: itemError.message };

  revalidatePath("/dashboard/teacher/mock-exams");
  revalidatePath("/dashboard/student/mock-exam");
  return { ok: true };
}

export async function submitMockExamAttempt(input: {
  mockExamId: string;
  answers: Array<{ questionId: string; chosenAnswer: string }>;
}): Promise<Result> {
  const gate = await assertRole("student");
  if (!gate.ok) return { ok: false, message: gate.message };
  const supabase = gate.supabase;

  const examId = input.mockExamId.trim();
  if (!examId) return { ok: false, message: "Mock exam id is required." };

  const { data: items, error: itemsError } = await supabase
    .from("mock_exam_items")
    .select("question_id")
    .eq("mock_exam_id", examId)
    .order("order_no");
  if (itemsError || !items?.length) return { ok: false, message: "Mock exam questions are unavailable." };

  const questionIds = items.map((i) => i.question_id);
  const { data: questions, error: qError } = await supabase
    .from("questions")
    .select("id, correct_answer")
    .in("id", questionIds);
  if (qError || !questions?.length) return { ok: false, message: "Question lookup failed." };

  const byId = new Map(questions.map((q) => [q.id, q.correct_answer]));
  let correct = 0;
  const answerRows = input.answers
    .filter((a) => byId.has(a.questionId))
    .map((a) => {
      const target = byId.get(a.questionId)?.trim();
      const chosen = a.chosenAnswer.trim();
      const ok = !!target && chosen === target;
      if (ok) correct += 1;
      return {
        question_id: a.questionId,
        chosen_answer: chosen || null,
        is_correct: ok,
        marks_awarded: ok ? 1 : 0,
      };
    });

  const percent = Math.round((correct / questionIds.length) * 100);
  const { data: attempt, error: attemptError } = await supabase
    .from("mock_exam_attempts")
    .insert({
      mock_exam_id: examId,
      student_id: gate.user.id,
      score_percent: percent,
      started_at: new Date().toISOString(),
      submitted_at: new Date().toISOString(),
    })
    .select("id")
    .single();
  if (attemptError || !attempt) return { ok: false, message: attemptError?.message ?? "Failed to save attempt." };

  if (answerRows.length) {
    const payload = answerRows.map((a) => ({ ...a, attempt_id: attempt.id }));
    const { error: answerError } = await supabase.from("mock_exam_answers").insert(payload);
    if (answerError) return { ok: false, message: answerError.message };
  }

  revalidatePath("/dashboard/student/mock-exam");
  revalidatePath(`/dashboard/student/mock-exam/${examId}`);
  return { ok: true };
}
