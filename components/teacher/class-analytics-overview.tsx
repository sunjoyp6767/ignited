import {
  averageQuizScorePercent,
  computeMostMissedTopics,
  countDistinctStudentsWithAttempts,
  MIN_ATTEMPTS_FOR_TOPIC,
  MISSED_THRESHOLD,
  type QuizAttemptScoreRow,
} from "@/lib/teacher/class-analytics";

type ClassAnalyticsOverviewProps = {
  /** Rows include student_id for learner count; topic/score used for aggregates. */
  attemptRows: (QuizAttemptScoreRow & { student_id?: string | null })[];
  loadError?: string | null;
};

export function ClassAnalyticsOverview({ attemptRows, loadError }: ClassAnalyticsOverviewProps) {
  const learners = countDistinctStudentsWithAttempts(
    attemptRows.map((r) => ({ student_id: r.student_id ?? null }))
  );
  const avgScore = averageQuizScorePercent(attemptRows);
  const missed = computeMostMissedTopics(attemptRows);

  return (
    <section className="rounded border border-stone-300 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-700">
          Class analytics
        </h2>
        <p className="mt-1 text-[11px] text-stone-500">
          Platform-wide aggregates from <code className="font-mono text-stone-700">quiz_attempts</code>{" "}
          (enrollment not required in this prototype). Most-missed rule: topic average &lt;{" "}
          {MISSED_THRESHOLD}% with ≥{MIN_ATTEMPTS_FOR_TOPIC} scored attempts.
        </p>
      </div>

      {loadError ? (
        <p className="m-4 border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-950">
          {loadError}
        </p>
      ) : null}

      <div className="grid gap-px bg-stone-200 sm:grid-cols-3">
        <div className="bg-white px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500">
            Students with attempts
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-stone-900">{learners}</p>
          <p className="mt-1 text-[11px] text-stone-500">Distinct learners in quiz_attempts.</p>
        </div>
        <div className="bg-white px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500">
            Average quiz score (platform)
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-stone-900">
            {avgScore === null ? "—" : `${avgScore}%`}
          </p>
          <p className="mt-1 text-[11px] text-stone-500">Mean of recorded attempt scores.</p>
        </div>
        <div className="bg-white px-4 py-4 sm:col-span-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-stone-500">
            Scored attempts in view
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-stone-900">
            {attemptRows.filter((a) => a.score_percent !== null).length}
          </p>
          <p className="mt-1 text-[11px] text-stone-500">Rows with non-null score.</p>
        </div>
      </div>

      <div className="border-t border-stone-200 px-4 py-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-stone-600">
          Most missed topics
        </h3>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500">
                <th className="py-2 pr-4 font-medium">Topic node</th>
                <th className="py-2 pr-4 font-medium tabular-nums">Attempts</th>
                <th className="py-2 font-medium tabular-nums">Avg score</th>
              </tr>
            </thead>
            <tbody>
              {missed.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-stone-500">
                    No topics meet the “below {MISSED_THRESHOLD}% with ≥{MIN_ATTEMPTS_FOR_TOPIC} attempts” rule.
                  </td>
                </tr>
              ) : (
                missed.map((t) => (
                  <tr key={t.topicNode} className="border-b border-stone-100">
                    <td className="py-2 pr-4 font-mono text-stone-900">{t.topicNode}</td>
                    <td className="py-2 pr-4 tabular-nums text-stone-700">{t.attemptCount}</td>
                    <td className="py-2 tabular-nums text-red-800">{t.averageScore}%</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
