import type { TeacherAiInsight } from "@/lib/teacher/ai-insights";

type TeacherAiInsightsProps = {
  insights: TeacherAiInsight[];
};

export function TeacherAiInsights({ insights }: TeacherAiInsightsProps) {
  return (
    <section className="rounded border border-stone-300 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-4 py-3">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-700">
          Teacher AI insights
        </h2>
        <p className="mt-1 text-[11px] text-stone-500">
          Analytic assistant powered by deterministic trend and clustering rules.
        </p>
      </div>
      <div className="space-y-3 px-4 py-4">
        {insights.map((item) => (
          <article key={item.id} className="rounded-md border border-stone-200 bg-stone-50 px-3 py-3">
            <p className="text-sm font-semibold text-stone-900">{item.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-stone-600">{item.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
