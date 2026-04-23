import type { StudentAiRecommendation } from "@/lib/student/ai-recommendations";
import Link from "next/link";

type AiRecommendationsPanelProps = {
  recommendations: StudentAiRecommendation[];
};

function difficultyLabel(level: 1 | 2 | 3) {
  if (level === 1) return "Foundation";
  if (level === 2) return "Core";
  return "Advanced";
}

export function AiRecommendationsPanel({ recommendations }: AiRecommendationsPanelProps) {
  return (
    <section className="mt-8 rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          Student AI Assistant
        </p>
        <h2 className="mt-1 text-lg font-semibold text-stone-900">Topic recommendations</h2>
        <p className="mt-1 text-sm text-stone-600">
          Rule engine based on your recent weak-topic performance.
        </p>
      </header>

      <div className="mt-4 space-y-3">
        {recommendations.length === 0 ? (
          <p className="rounded-md border border-stone-200 bg-stone-50 px-3 py-3 text-sm text-stone-600">
            Not enough scored quiz data yet to generate recommendations.
          </p>
        ) : (
          recommendations.map((item) => (
            <article key={item.topicNode} className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-sm text-stone-900">{item.topicNode}</p>
                <span className="rounded-full border border-stone-300 bg-white px-2 py-0.5 text-xs text-stone-700">
                  {difficultyLabel(item.recommendedDifficulty)} level
                </span>
              </div>
              <p className="mt-1 text-xs text-stone-600">{item.reason}</p>
              <div className="mt-3">
                <Link
                  href={`/dashboard/student/quiz/${encodeURIComponent(item.topicNode)}`}
                  className="inline-flex rounded-md border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 hover:bg-stone-100"
                >
                  Start quiz
                </Link>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
