"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult = { ok: true } | { ok: false; message: string };

type QuestionInput = {
  syllabusCode: string;
  topicNode: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficultyLevel: number;
  questionPool: "quiz" | "mock" | "both";
};

async function assertTeacher(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) return { ok: false as const, message: "You must be signed in.", user: null };
  const { data: row, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (error || row?.role !== "teacher") {
    return { ok: false as const, message: "Only teachers can manage questions.", user: null };
  }
  return { ok: true as const, user };
}

function validateQuestion(input: QuestionInput): ActionResult {
  if (!input.syllabusCode.trim()) return { ok: false, message: "Syllabus code is required." };
  if (!input.topicNode.trim()) return { ok: false, message: "Topic node is required." };
  if (!input.questionText.trim()) return { ok: false, message: "Question text is required." };
  if (!input.explanation.trim()) return { ok: false, message: "Explanation is required." };
  if (!Number.isInteger(input.difficultyLevel) || input.difficultyLevel < 1 || input.difficultyLevel > 3) {
    return { ok: false, message: "Difficulty must be between 1 and 3." };
  }
  if (!["quiz", "mock", "both"].includes(input.questionPool)) {
    return { ok: false, message: "Question pool must be quiz, mock, or both." };
  }
  const cleaned = input.options.map((o) => o.trim()).filter(Boolean);
  if (cleaned.length < 2) return { ok: false, message: "At least two options are required." };
  if (!cleaned.includes(input.correctAnswer.trim())) {
    return { ok: false, message: "Correct answer must exactly match one option." };
  }
  return { ok: true };
}

export async function createTeacherQuestion(input: QuestionInput): Promise<ActionResult> {
  const validation = validateQuestion(input);
  if (!validation.ok) return validation;

  const supabase = await createClient();
  const gate = await assertTeacher(supabase);
  if (!gate.ok) return { ok: false, message: gate.message };

  const cleanOptions = input.options.map((o) => o.trim()).filter(Boolean);
  const questionText = input.questionText.trim();
  const topicNode = input.topicNode.trim();

  const { data: duplicate } = await supabase
    .from("questions")
    .select("id")
    .eq("topic_node", topicNode)
    .eq("question_text", questionText)
    .maybeSingle();
  if (duplicate?.id) return { ok: false, message: "Duplicate question already exists for this topic." };

  const { error } = await supabase.from("questions").insert({
    syllabus_code: input.syllabusCode.trim().toUpperCase(),
    topic_node: topicNode,
    question_text: questionText,
    options: cleanOptions,
    correct_answer: input.correctAnswer.trim(),
    explanation: input.explanation.trim(),
    difficulty_level: input.difficultyLevel,
    question_pool: input.questionPool,
  });
  if (error) return { ok: false, message: error.message };

  revalidatePath("/dashboard/teacher/questions");
  return { ok: true };
}
