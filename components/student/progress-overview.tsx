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
    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
      <p className="mb-1 text-xs uppercase tracking-widest text-gray-400">{label}</p>
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
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">
            Progress overview
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600">
            Aggregated from your <span className="font-mono text-stone-800">quiz_attempts</span>{" "}
            records. Scores drive syllabus routing the same way as post-quiz feedback.
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 md:flex md:flex-row md:flex-wrap">
        <div className="min-w-0 md:flex-1">
          <Tile label="Avg score" value={averageScore === null ? "—" : `${averageScore}%`} />
        </div>
        <div className="min-w-0 md:flex-1">
          <Tile label="Quizzes done" value={String(quizzesCompleted)} />
        </div>
        <div className="min-w-0 md:flex-1">
          <Tile label="Best topic" value={bestTopic ?? "—"} />
        </div>
        <div className="min-w-0 md:flex-1">
          <Tile
            label="Needs work"
            value={needsWorkTopic ?? "—"}
            valueClassName={needsWorkTopic ? "text-amber-700" : undefined}
          />
        </div>
        <div className="col-span-2 min-w-0 md:col-span-1 md:flex-1">
          <Tile
            label="Exam readiness"
            value={examReadinessPercent === null ? "—" : `${examReadinessPercent}%`}
          />
        </div>
      </div>
    </section>
  );
}
