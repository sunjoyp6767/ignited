import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Mock exam",
  description: "Timed mock exam practice.",
};

export default async function StudentMockExamPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let exams: Array<{ id: string; title: string; topic_node: string; duration_minutes: number }> = [];
  let attempts: Array<{ id: string; mock_exam_id: string; score_percent: number; submitted_at: string }> = [];

  if (user) {
    const { data: examRows } = await supabase
      .from("mock_exams")
      .select("id, title, topic_node, duration_minutes")
      .eq("is_published", true)
      .order("created_at", { ascending: false });
    exams = examRows ?? [];

    const { data: attemptRows } = await supabase
      .from("mock_exam_attempts")
      .select("id, mock_exam_id, score_percent, submitted_at")
      .eq("student_id", user.id)
      .order("submitted_at", { ascending: false })
      .limit(10);
    attempts = attemptRows ?? [];
  }

  return (
    <div className="w-full px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Mock exam</h1>
      <p className="mt-2 text-sm text-gray-600">Take teacher-published mock papers and track your scores.</p>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white">
        <header className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Available exams</h2>
        </header>
        <div className="divide-y divide-gray-100">
          {exams.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-gray-500">No mock exams available yet.</p>
          ) : (
            exams.map((exam) => (
              <div key={exam.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="font-medium text-gray-900">{exam.title}</p>
                  <p className="text-xs text-gray-500">
                    Topic: <span className="font-mono">{exam.topic_node}</span> · Duration {exam.duration_minutes} min
                  </p>
                </div>
                <Link
                  href={`/dashboard/student/mock-exam/${exam.id}`}
                  className="rounded border border-gray-300 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50"
                >
                  Start exam
                </Link>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-8 rounded-lg border border-gray-200 bg-white">
        <header className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Recent attempts</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">Exam ID</th>
                <th className="px-4 py-3">Score</th>
              </tr>
            </thead>
            <tbody>
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    No attempts recorded yet.
                  </td>
                </tr>
              ) : (
                attempts.map((attempt) => (
                  <tr key={attempt.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{new Date(attempt.submitted_at).toLocaleDateString("en-GB")}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{attempt.mock_exam_id.slice(0, 8)}...</td>
                    <td className="px-4 py-3">{attempt.score_percent}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
