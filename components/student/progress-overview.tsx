type ProgressOverviewProps = {
  averageScore: number | null;
  quizzesCompleted: number;
  bestTopic: string | null;
  needsWorkTopic: string | null;
  examReadinessPercent: number | null;
};

function Tile({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-gray-200 bg-gray-50 p-4 text-center">
      <p className="mb-1 text-xs font-medium uppercase tracking-widest text-gray-400">{label}</p>
      <p
        className={`truncate text-2xl font-bold ${valueClassName ?? "text-gray-900"}`}
        title={value}
      >
        {value}
      </p>
    </div>
  );
}

export function ProgressOverview({
  averageScore,
  quizzesCompleted,
  bestTopic,
  needsWorkTopic,
  examReadinessPercent,
}: ProgressOverviewProps) {
  return (
    <section className="rounded-2xl border border-stone-200/80 bg-gradient-to-br from-white via-stone-50 to-stone-100/90 p-6 shadow-md shadow-stone-200/50 ring-1 ring-stone-100">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Learning hub
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-900">
            Progress overview
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
            Aggregated from your <span className="font-mono text-stone-800">quiz_attempts</span>{" "}
            records. Scores drive syllabus routing the same way as post-quiz feedback.
          </p>
        </div>
      </div>

      <div className="mt-4 grid w-full grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Tile label="Avg score" value={averageScore === null ? "—" : `${averageScore}%`} />
        <Tile label="Quizzes done" value={String(quizzesCompleted)} />
        <Tile label="Best topic" value={bestTopic ?? "—"} />
        <Tile
          label="Needs work"
          value={needsWorkTopic ?? "—"}
          valueClassName={needsWorkTopic ? "text-amber-700" : undefined}
        />
        <Tile
          label="Exam readiness"
          value={examReadinessPercent === null ? "—" : `${examReadinessPercent}%`}
        />
      </div>
    </section>
  );
}
