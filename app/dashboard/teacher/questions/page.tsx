import { QuestionSuggestionPanel } from "@/components/teacher/question-suggestion-panel";
import { TeacherQuestionManager } from "@/components/teacher/teacher-question-manager";
import { requireDashboardRole } from "@/lib/dashboard/require-role";
import { suggestQuestionsForTeacher } from "@/lib/teacher/question-suggestions";
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
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("topic_node, score_percent")
    .order("completed_at", { ascending: false })
    .limit(300);

  const suggestions = suggestQuestionsForTeacher(
    (questions ?? []).map((q) => ({
      id: q.id,
      syllabus_code: q.syllabus_code,
      topic_node: q.topic_node,
      difficulty_level: q.difficulty_level,
      question_pool: q.question_pool,
    })),
    (attempts ?? []).map((a) => ({
      topic_node: a.topic_node,
      score_percent:
        a.score_percent === null || a.score_percent === undefined ? null : Number(a.score_percent),
    })),
    8
  );

  return (
    <div className="w-full px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Question authoring</h1>
        <p className="mt-2 text-sm text-gray-600">
          Add validated, pre-generated MCQs aligned to syllabus topics.
        </p>
      </header>
      <QuestionSuggestionPanel suggestions={suggestions} />
      <TeacherQuestionManager questions={questions ?? []} />
    </div>
  );
}
