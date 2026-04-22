import { formatCurrency } from "@/lib/accountant/metrics";
import type { DashboardMetrics } from "@/lib/accountant/types";

type RiskSummaryCardsProps = {
  metrics: DashboardMetrics;
};

function formatDelta(value: number | null) {
  if (value === null) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

export function RiskSummaryCards({ metrics }: RiskSummaryCardsProps) {
  const cards = [
    {
      label: "Online earnings",
      value: formatCurrency(metrics.onlineEarnings),
      tone: "text-emerald-700",
    },
    {
      label: "Cash earnings",
      value: formatCurrency(metrics.cashEarnings),
      tone: "text-stone-900",
    },
    {
      label: "Total earnings",
      value: formatCurrency(metrics.totalEarnings),
      tone: "text-stone-900",
    },
    {
      label: "Online earnings (this month)",
      value: formatCurrency(metrics.onlineEarningsThisMonth),
      tone: "text-emerald-700",
      meta: `MoM: ${formatDelta(metrics.monthlyOnlineDeltaPercent)}`,
    },
  ];

  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <article key={card.label} className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">{card.label}</p>
          <p className={`mt-2 text-2xl font-semibold tabular-nums ${card.tone}`}>{card.value}</p>
          {card.meta ? <p className="mt-1 text-xs text-stone-500">{card.meta}</p> : null}
        </article>
      ))}
    </section>
  );
}
