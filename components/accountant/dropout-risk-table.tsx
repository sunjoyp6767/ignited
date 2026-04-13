import type { DropoutRiskRow } from "@/lib/accountant/dropout-risk";
import {
  PAYMENT_WINDOW_DAYS,
  QUIZ_RECENT_DAYS,
} from "@/lib/accountant/dropout-risk";

type DropoutRiskTableProps = {
  rows: DropoutRiskRow[];
};

export function DropoutRiskTable({ rows }: DropoutRiskTableProps) {
  return (
    <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-700">
          Predictive risk flagging
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-stone-500">
          Rule engine: students with <strong>no payment</strong> in the last{" "}
          {PAYMENT_WINDOW_DAYS} days <strong>and</strong> <strong>no quiz</strong> in the last{" "}
          {QUIZ_RECENT_DAYS} days (from <code className="font-mono text-stone-700">quiz_attempts</code>
          ). No external AI.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
          <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-600">
            <tr>
              <th className="px-4 py-3 sm:px-5">Risk</th>
              <th className="px-4 py-3 sm:px-5">Student</th>
              <th className="px-4 py-3 sm:px-5">Last payment</th>
              <th className="px-4 py-3 sm:px-5">Last quiz</th>
              <th className="px-4 py-3 sm:px-5">Signals</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-800">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-sm text-stone-500 sm:px-5"
                >
                  No students match the high drop-out rule set.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.studentId} className="hover:bg-stone-50/80">
                  <td className="whitespace-nowrap px-4 py-3 sm:px-5">
                    <span className="inline-flex items-center rounded-full border border-red-300 bg-red-50 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-red-800">
                      High drop-out risk
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium sm:px-5">{r.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-600 sm:px-5">
                    {r.lastPaymentDate ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-600 sm:px-5">
                    {r.lastQuizAt
                      ? new Date(r.lastQuizAt).toISOString().slice(0, 19).replace("T", " ")
                      : "—"}
                  </td>
                  <td className="max-w-md px-4 py-3 text-xs leading-relaxed text-stone-600 sm:px-5">
                    <ul className="list-inside list-disc space-y-1">
                      {r.reasons.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
