import type { ActionAlert } from "@/lib/accountant/types";

type ActionAlertsProps = {
  alerts: ActionAlert[];
};

const badgeStyles: Record<ActionAlert["level"], string> = {
  info: "border-sky-300 bg-sky-50 text-sky-800",
  warning: "border-amber-300 bg-amber-50 text-amber-900",
  critical: "border-red-300 bg-red-50 text-red-800",
};

export function ActionAlerts({ alerts }: ActionAlertsProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-700">
          AI analysis alerts
        </h2>
        <p className="mt-0.5 text-xs text-stone-500">
          Deterministic signals from payment and quiz behavior.
        </p>
      </div>
      <div className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
        {alerts.map((alert) => (
          <article key={alert.id} className="rounded-md border border-stone-200 bg-stone-50 p-3">
            <p>
              <span
                className={`mr-2 inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${badgeStyles[alert.level]}`}
              >
                {alert.level}
              </span>
              <span className="text-sm font-semibold text-stone-800">{alert.title}</span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-stone-600">{alert.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
