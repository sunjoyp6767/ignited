import type { SyllabusTopicCard } from "@/lib/student/syllabus-topics";
import type { TopicStat } from "@/lib/student/topic-stats";
import { ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

export type SyllabusCardModel = SyllabusTopicCard & {
  stat: TopicStat | null;
};

type SyllabusPathGridProps = {
  cards: SyllabusCardModel[];
  heading?: string;
};

function routingBadge(stat: TopicStat | null) {
  if (!stat || stat.attemptCount === 0) return null;

  const avg = stat.averageScore;
  if (avg >= 80) {
    return (
      <span className="inline-flex rounded-full border border-green-300 bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800">
        Mastered
      </span>
    );
  }
  if (avg >= 50) {
    return (
      <span className="inline-flex rounded-full border border-blue-300 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800">
        On track
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-800">
      ⚠ Review foundation
    </span>
  );
}

export function SyllabusPathGrid({ cards, heading }: SyllabusPathGridProps) {
  return (
    <section className="mt-10">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
            Syllabus path
          </p>
          <h2 className="text-xl font-semibold tracking-tight text-stone-900">
            {heading ?? "Cambridge Physics (9702)"}
          </h2>
          <p className="mt-1 text-sm text-stone-600">
            Topic cards use your rolling average per node for routing hints (&lt;50% review foundation,
            50–79% on track, ≥80% mastered).
          </p>
        </div>
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const href = `/dashboard/student/quiz/${encodeURIComponent(card.topicNode)}`;
          const badge = routingBadge(card.stat);

          return (
            <li key={card.topicNode}>
              <article className="group relative flex h-full flex-col rounded-2xl border border-stone-200/90 bg-white p-5 shadow-md shadow-stone-200/40 ring-1 ring-stone-100 transition hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-200/60">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-white shadow-inner shadow-black/20">
                    <BookOpen className="size-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  {badge ? <div className="shrink-0">{badge}</div> : null}
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  {card.code}
                </p>
                <h3 className="mt-0.5 text-lg font-semibold text-stone-900">{card.title}</h3>
                <p className="mt-1 font-mono text-[11px] text-stone-500">{card.topicNode}</p>

                {card.stat && card.stat.attemptCount > 0 ? (
                  <p className="mt-3 text-xs tabular-nums text-stone-600">
                    {card.stat.attemptCount} attempt{card.stat.attemptCount === 1 ? "" : "s"} · avg{" "}
                    <span className="font-semibold text-stone-800">{card.stat.averageScore}%</span>
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-stone-500">No scored attempts yet for this node.</p>
                )}

                <div className="mt-5 flex flex-1 flex-col justify-end">
                  <Link
                    href={href}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-medium text-white shadow-md shadow-stone-900/20 transition hover:bg-stone-800 hover:shadow-lg"
                  >
                    Take quiz
                    <ArrowRight
                      className="size-4 transition group-hover:translate-x-0.5"
                      strokeWidth={2}
                      aria-hidden
                    />
                  </Link>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
