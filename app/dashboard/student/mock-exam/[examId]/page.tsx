import { MockExamTaker } from "@/components/student/mock-exam-taker";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ examId: string }>;
};

export default async function StudentMockExamAttemptPage({ params }: PageProps) {
  const { examId } = await params;
  const supabase = await createClient();

  const { data: exam } = await supabase
    .from("mock_exams")
    .select("id, title")
    .eq("id", examId)
    .eq("is_published", true)
    .maybeSingle();
  if (!exam) notFound();

  const { data: items } = await supabase
    .from("mock_exam_items")
    .select("question_id, order_no")
    .eq("mock_exam_id", examId)
    .order("order_no");
  if (!items?.length) notFound();

  const questionIds = items.map((row) => row.question_id);
  const { data: questionsRaw } = await supabase
    .from("questions")
    .select("id, question_text, options")
    .in("id", questionIds);
  const byId = new Map((questionsRaw ?? []).map((q) => [q.id, q]));
  const questions = questionIds
    .map((id) => byId.get(id))
    .filter((q): q is { id: string; question_text: string; options: string[] } => !!q)
    .map((q) => ({
      id: q.id,
      question_text: q.question_text,
      options: Array.isArray(q.options) ? q.options.map((v) => String(v)) : [],
    }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      <MockExamTaker examId={exam.id} title={exam.title} questions={questions} />
    </div>
  );
}
