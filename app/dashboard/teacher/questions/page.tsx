import { TeacherQuestionManager } from "@/components/teacher/teacher-question-manager";
import { requireDashboardRole } from "@/lib/dashboard/require-role";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher questions",
  description: "Manage the question bank used by quizzes and mock exams.",
};

export default async function TeacherQuestionsPage() {
  await requireDashboardRole("teacher");

  const supabase = await createClient();
  const { data: questions } = await supabase
    .from("questions")
    .select("id, syllabus_code, topic_node, question_text, correct_answer, difficulty_level, question_pool")
    .order("topic_node")
    .limit(80);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Question authoring</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add validated, pre-generated MCQs aligned to syllabus topics.
        </p>
      </header>
      <TeacherQuestionManager questions={questions ?? []} />
    </div>
  );
}
