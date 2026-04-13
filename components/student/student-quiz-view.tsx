import { QuizTaker } from "@/components/quiz/quiz-taker";
import { toQuizQuestionPayload } from "@/lib/quiz/normalize-questions";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

const QUESTION_LIMIT = 5;

export async function StudentQuizView({ topicNode }: { topicNode: string }) {
  const supabase = await createClient();
  const { data: rows, error } = await supabase
    .from("questions")
    .select(
      "id, syllabus_code, topic_node, question_text, options, correct_answer, explanation, difficulty_level"
    )
    .eq("topic_node", topicNode)
    .in("question_pool", ["quiz", "both"])
    .order("difficulty_level", { ascending: true })
    .limit(QUESTION_LIMIT);

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Could not load questions: {error.message}
        </p>
        <Link
          href="/dashboard/student"
          className="mt-4 inline-block text-sm font-medium text-stone-900 underline"
        >
          Back to student dashboard
        </Link>
      </div>
    );
  }

  const questions = (rows ?? []).map(toQuizQuestionPayload);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <nav className="mb-6 text-sm text-stone-600">
        <Link href="/dashboard/student" className="hover:text-stone-900">
          Learning hub
        </Link>
        <span className="mx-2 text-stone-400">/</span>
        <span className="text-stone-900">Quiz</span>
      </nav>

      <header className="mb-8 border-b border-stone-200 pb-6">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Student · Pre-generated MCQs
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">Topic quiz</h1>
        <p className="mt-2 text-sm text-stone-600">
          Syllabus node{" "}
          <span className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-stone-800">
            {topicNode}
          </span>{" "}
          — {questions.length} question{questions.length === 1 ? "" : "s"} loaded from the database
          (max {QUESTION_LIMIT}).
        </p>
      </header>

      <QuizTaker questions={questions} topicNode={topicNode} />
    </div>
  );
}
