import { requireDashboardRole } from "@/lib/dashboard/require-role";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher performance",
  description: "Platform-wide student performance and intervention insights.",
};

type AttemptRow = {
  student_id: string;
  topic_node: string | null;
  score_percent: number | null;
};

export default async function TeacherPerformancePage() {
  await requireDashboardRole("teacher");
  const supabase = await createClient();

  const { data: attemptsRaw } = await supabase
    .from("quiz_attempts")
    .select("student_id, topic_node, score_percent");
  const attempts = (attemptsRaw ?? []) as AttemptRow[];

  const studentIds = [...new Set(attempts.map((a) => a.student_id))];

  let nameById = new Map<string, string>();
  if (studentIds.length) {
    const { data: studentProfiles } = await supabase.from("users").select("id, name").in("id", studentIds);
    nameById = new Map((studentProfiles ?? []).map((u) => [u.id, u.name?.trim() || "Student"]));
  }

  const scored = attempts.filter((a) => a.score_percent !== null).map((a) => Number(a.score_percent));
  const avg = scored.length
    ? Math.round((scored.reduce((x, y) => x + y, 0) / scored.length) * 10) / 10
    : null;
  const participating = new Set(attempts.map((a) => a.student_id)).size;
  const participationRate = studentIds.length
    ? Math.round((participating / studentIds.length) * 1000) / 10
    : 0;

  const topicMap = new Map<string, number[]>();
  for (const row of attempts) {
    if (!row.topic_node || row.score_percent === null) continue;
    const bucket = topicMap.get(row.topic_node) ?? [];
    bucket.push(Number(row.score_percent));
    topicMap.set(row.topic_node, bucket);
  }
  const weakTopics = [...topicMap.entries()]
    .map(([topic, scores]) => ({
      topic,
      attempts: scores.length,
      avg: Math.round((scores.reduce((x, y) => x + y, 0) / scores.length) * 10) / 10,
    }))
    .filter((t) => t.avg < 50)
    .sort((a, b) => a.avg - b.avg || b.attempts - a.attempts)
    .slice(0, 8);

  const studentRiskRows = studentIds
    .map((studentId) => {
      const rows = attempts.filter((a) => a.student_id === studentId && a.score_percent !== null);
      const rowScores = rows.map((r) => Number(r.score_percent));
      const mean = rowScores.length
        ? Math.round((rowScores.reduce((x, y) => x + y, 0) / rowScores.length) * 10) / 10
        : null;
      const atRisk = rows.length < 2 || (mean !== null && mean < 50);
      return {
        studentId,
        name: nameById.get(studentId) ?? "Student",
        attempts: rows.length,
        average: mean,
        atRisk,
      };
    })
    .sort((a, b) => Number(b.atRisk) - Number(a.atRisk) || a.attempts - b.attempts);

  return (
    <div className="w-full px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Student performance monitor</h1>
        <p className="mt-2 text-sm text-gray-600">
          All students with quiz activity (no enrollment filter in this prototype).
        </p>
      </header>

      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Students with attempts" value={String(studentIds.length)} />
        <MetricCard label="Platform average" value={avg === null ? "—" : `${avg}%`} />
        <MetricCard label="Participation rate" value={`${participationRate}%`} />
        <MetricCard label="Total attempts" value={String(attempts.length)} />
      </section>

      <section className="mb-8 rounded-lg border border-gray-200 bg-white">
        <header className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Weak topics</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Attempts</th>
                <th className="px-4 py-3">Average</th>
              </tr>
            </thead>
            <tbody>
              {weakTopics.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    No weak topics detected yet.
                  </td>
                </tr>
              ) : (
                weakTopics.map((t) => (
                  <tr key={t.topic} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-xs">{t.topic}</td>
                    <td className="px-4 py-3">{t.attempts}</td>
                    <td className="px-4 py-3 text-red-700">{t.avg}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <header className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
            Students needing intervention
          </h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Attempts</th>
                <th className="px-4 py-3">Average</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {studentRiskRows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No student attempts yet.
                  </td>
                </tr>
              ) : (
                studentRiskRows.map((row) => (
                  <tr key={row.studentId} className="border-t border-gray-100">
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">{row.attempts}</td>
                    <td className="px-4 py-3">{row.average === null ? "—" : `${row.average}%`}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs ${
                          row.atRisk
                            ? "border-amber-300 bg-amber-50 text-amber-900"
                            : "border-green-300 bg-green-50 text-green-900"
                        }`}
                      >
                        {row.atRisk ? "Needs support" : "On track"}
                      </span>
                    </td>
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

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
      <p className="text-xs uppercase tracking-widest text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
