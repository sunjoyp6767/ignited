import { formatCurrency } from "@/lib/accountant/metrics";
import type { EarningsTrendPoint } from "@/lib/accountant/types";

type EarningsTrendProps = {
  points: EarningsTrendPoint[];
};

export function EarningsTrend({ points }: EarningsTrendProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-700">
          Earnings trend (6 months)
        </h2>
        <p className="mt-0.5 text-xs text-stone-500">
          Month-over-month split by online and cash collections.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
          <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-600">
            <tr>
              <th className="px-4 py-3 sm:px-5">Month</th>
              <th className="px-4 py-3 sm:px-5">Online</th>
              <th className="px-4 py-3 sm:px-5">Cash</th>
              <th className="px-4 py-3 sm:px-5">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-800">
            {points.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-stone-500 sm:px-5">
                  No trend data yet.
                </td>
              </tr>
            ) : (
              points.map((point) => (
                <tr key={point.monthKey} className="hover:bg-stone-50/70">
                  <td className="px-4 py-3 font-medium sm:px-5">{point.monthKey}</td>
                  <td className="px-4 py-3 font-mono text-xs sm:px-5">{formatCurrency(point.online)}</td>
                  <td className="px-4 py-3 font-mono text-xs sm:px-5">{formatCurrency(point.cash)}</td>
                  <td className="px-4 py-3 font-mono text-xs sm:px-5">{formatCurrency(point.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
