import { formatDateEnGB } from "@/lib/format-date";
import { averageScoreByTopic, type AttemptRow } from "@/lib/student/topic-stats";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Performance",
  description: "Quiz analytics and score trends.",
};

type AttemptDetail = {
  topic_node: string | null;
  score_percent: number | null;
  completed_at: string;
};

type MockExamAttemptDetail = {
  mock_exam_id: string;
  score_percent: number;
  submitted_at: string;
};

type MockExamMeta = {
  id: string;
  title: string;
  topic_node: string;
};

type TopicAggRow = {
  topic_node: string;
  attempts: number;
  avg: number;
  best: number;
  lastAttempt: string;
};

function statusBadge(avg: number): { label: string; className: string } {
  if (avg >= 80) return { label: "Mastered", className: "border-green-300 bg-green-50 text-green-800" };
  if (avg >= 50) return { label: "On track", className: "border-blue-300 bg-blue-50 text-blue-800" };
  return { label: "Needs work", className: "border-amber-300 bg-amber-50 text-amber-800" };
}

function barColor(avg: number): string {
  if (avg >= 80) return "bg-green-600";
  if (avg >= 50) return "bg-amber-500";
  return "bg-red-500";
}

export default async function StudentPerformancePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let raw: AttemptDetail[] = [];
  let mockAttempts: MockExamAttemptDetail[] = [];
  let mockExamById = new Map<string, MockExamMeta>();
  if (user) {
    const { data } = await supabase
      .from("quiz_attempts")
      .select("topic_node, score_percent, completed_at")
      .eq("student_id", user.id)
      .order("completed_at", { ascending: false });
    raw = (data ?? []) as AttemptDetail[];

    const { data: mockRows } = await supabase
      .from("mock_exam_attempts")
      .select("mock_exam_id, score_percent, submitted_at")
      .eq("student_id", user.id)
      .order("submitted_at", { ascending: false });
    mockAttempts = (mockRows ?? []) as MockExamAttemptDetail[];

    const mockExamIds = Array.from(new Set(mockAttempts.map((row) => row.mock_exam_id)));
    if (mockExamIds.length > 0) {
      const { data: mockExamRows } = await supabase
        .from("mock_exams")
        .select("id, title, topic_node")
        .in("id", mockExamIds);
      mockExamById = new Map(
        (mockExamRows ?? []).map((row) => [
          row.id,
          { id: row.id, title: row.title, topic_node: row.topic_node } as MockExamMeta,
        ])
      );
    }
  }

  const attempts: AttemptRow[] = raw.map((r) => ({
    topic_node: r.topic_node,
    score_percent:
      r.score_percent === null || r.score_percent === undefined
        ? null
        : Number(r.score_percent),
  }));

  const scores = attempts
    .map((a) => a.score_percent)
    .filter((s): s is number => s !== null && Number.isFinite(s));
  const overallAvg =
    scores.length === 0 ? null : Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10;

  const byTopic = averageScoreByTopic(attempts);
  const topicRows: TopicAggRow[] = [];
  for (const [topic_node, stat] of byTopic.entries()) {
    const topicAttempts = raw.filter(
      (r) => r.topic_node === topic_node && r.score_percent !== null && Number.isFinite(r.score_percent)
    );
    const bests = topicAttempts.map((r) => Number(r.score_percent));
    const best = Math.max(...bests);
    const last = topicAttempts.sort(
      (a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
    )[0];
    topicRows.push({
      topic_node,
      attempts: stat.attemptCount,
      avg: stat.averageScore,
      best,
      lastAttempt: last?.completed_at ?? "",
    });
  }
  topicRows.sort((a, b) => a.avg - b.avg);

  const mastered = topicRows.filter((r) => r.avg >= 80).length;
  const needsWork = topicRows.filter((r) => r.avg < 50).length;
  const mockScores = mockAttempts.map((x) => Number(x.score_percent)).filter(Number.isFinite);
  const mockAvg =
    mockScores.length === 0
      ? null
      : Math.round((mockScores.reduce((sum, score) => sum + score, 0) / mockScores.length) * 10) /
        10;
  const mockBest = mockScores.length === 0 ? null : Math.max(...mockScores);
  const latestMock = mockAttempts[0] ?? null;

  const lastTenAsc = [...raw]
    .filter((r) => r.score_percent !== null && Number.isFinite(r.score_percent))
    .sort((a, b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime())
    .slice(-10);
  const lastTenDesc = [...lastTenAsc].reverse();
  const recentFive = lastTenDesc.slice(0, 5).map((row) => Number(row.score_percent));
  const recentFiveAvg =
    recentFive.length === 0
      ? null
      : Math.round((recentFive.reduce((sum, value) => sum + value, 0) / recentFive.length) * 10) / 10;
  const bestRecent = lastTenAsc.length === 0 ? null : Math.max(...lastTenAsc.map((row) => Number(row.score_percent)));
  const consistencyRange =
    lastTenAsc.length < 2
      ? null
      : Math.max(...lastTenAsc.map((row) => Number(row.score_percent))) -
        Math.min(...lastTenAsc.map((row) => Number(row.score_percent)));

  return (
    <div className="w-full px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Performance</h1>
        <p className="mt-2 text-sm text-gray-600">
          Topic mastery and recent attempt trend (server-side aggregates).
        </p>
      </header>

      <section className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400">Overall avg</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">
            {overallAvg === null ? "—" : `${overallAvg}%`}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400">Quizzes taken</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{scores.length}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400">Topics mastered</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{mastered}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400">Topics needing work</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{needsWork}</p>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Mock exam results</h2>
        <div className="mb-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gray-400">Mock exams taken</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{mockAttempts.length}</p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gray-400">Mock avg</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {mockAvg === null ? "—" : `${mockAvg}%`}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gray-400">Mock best</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {mockBest === null ? "—" : `${mockBest}%`}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-gray-400">Latest mock</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {latestMock ? formatDateEnGB(latestMock.submitted_at) : "—"}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Exam
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Topic
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {mockAttempts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="border-t border-gray-100 px-4 py-6 text-center text-gray-500">
                    No mock exam attempts yet.
                  </td>
                </tr>
              ) : (
                mockAttempts.slice(0, 8).map((attempt, idx) => {
                  const exam = mockExamById.get(attempt.mock_exam_id);
                  const badge = statusBadge(attempt.score_percent);
                  return (
                    <tr key={`${attempt.mock_exam_id}-${attempt.submitted_at}-${idx}`} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-gray-700">{formatDateEnGB(attempt.submitted_at)}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{exam?.title ?? "Mock exam"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{exam?.topic_node ?? "—"}</td>
                      <td className="px-4 py-3 tabular-nums text-gray-900">{attempt.score_percent}%</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Topic mastery</h2>
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Topic
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Attempts
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Avg score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Best score
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Last attempt
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {topicRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border-t border-gray-100 px-4 py-6 text-center text-gray-500">
                    No scored attempts yet.
                  </td>
                </tr>
              ) : (
                topicRows.map((row) => {
                  const badge = statusBadge(row.avg);
                  return (
                    <tr key={row.topic_node} className="border-t border-gray-100">
                      <td className="px-4 py-3 font-mono text-xs text-gray-900">{row.topic_node}</td>
                      <td className="px-4 py-3 tabular-nums text-gray-700">{row.attempts}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="tabular-nums text-gray-900">{row.avg}%</span>
                          <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={`h-full rounded-full ${barColor(row.avg)}`}
                              style={{ width: `${Math.min(100, Math.max(0, row.avg))}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-gray-700">{row.best}%</td>
                      <td className="px-4 py-3 text-gray-700">
                        {row.lastAttempt ? formatDateEnGB(row.lastAttempt) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Performance momentum (last 10 attempts)</h2>
        {lastTenAsc.length === 0 ? (
          <p className="text-sm text-gray-600">No scored attempts available yet.</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-widest text-gray-400">Recent average (5)</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {recentFiveAvg === null ? "—" : `${recentFiveAvg}%`}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-widest text-gray-400">Best recent score</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {bestRecent === null ? "—" : `${bestRecent}%`}
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-white p-4">
                <p className="text-xs uppercase tracking-widest text-gray-400">Consistency range</p>
                <p className="mt-1 text-xl font-semibold text-gray-900">
                  {consistencyRange === null ? "—" : `${Math.round(consistencyRange)} pts`}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Attempt
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Topic
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                      Trend bar
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {lastTenDesc.map((attempt, index) => {
                    const score = Number(attempt.score_percent);
                    return (
                      <tr key={`momentum-${attempt.completed_at}-${index}`} className="border-t border-gray-100">
                        <td className="px-4 py-3 text-gray-700">#{lastTenDesc.length - index}</td>
                        <td className="px-4 py-3 text-gray-700">{formatDateEnGB(attempt.completed_at)}</td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-900">{attempt.topic_node ?? "—"}</td>
                        <td className="px-4 py-3 tabular-nums text-gray-900">{score}%</td>
                        <td className="px-4 py-3">
                          <div className="h-2 w-36 overflow-hidden rounded-full bg-gray-200">
                            <div
                              className={`${barColor(score)} h-full rounded-full`}
                              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
