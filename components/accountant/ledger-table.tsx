"use client";

import { formatCurrency } from "@/lib/accountant/metrics";
import type { LedgerPaymentRow, StudentDirectoryRow } from "@/lib/accountant/types";
import { useMemo, useState } from "react";

type LedgerTableProps = {
  rows: LedgerPaymentRow[];
  students: StudentDirectoryRow[];
};

type MethodFilter = "all" | "cash" | "online";

export function LedgerTable({ rows, students }: LedgerTableProps) {
  const [query, setQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("all");
  const [sortDirection, setSortDirection] = useState<"desc" | "asc">("desc");

  const nameById = useMemo(
    () => new Map(students.map((student) => [student.id, student.name] as const)),
    [students]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const next = rows.filter((row) => {
      if (methodFilter !== "all" && row.payment_method !== methodFilter) return false;
      if (!normalized) return true;
      const name = (nameById.get(row.student_id) ?? "").toLowerCase();
      return name.includes(normalized) || row.student_id.toLowerCase().includes(normalized);
    });

    next.sort((left, right) => {
      const leftDate = new Date(left.paid_on).getTime();
      const rightDate = new Date(right.paid_on).getTime();
      return sortDirection === "desc" ? rightDate - leftDate : leftDate - rightDate;
    });

    return next;
  }, [rows, query, methodFilter, sortDirection, nameById]);

  return (
    <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-700">
          Payment ledger
        </h2>
        <p className="mt-0.5 text-xs text-stone-500">
          Search students, filter method, and review entries in posting order.
        </p>
      </div>

      <div className="grid gap-3 border-b border-stone-100 px-4 py-3 sm:grid-cols-3 sm:px-5">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by student name"
          className="w-full rounded border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
        />
        <select
          value={methodFilter}
          onChange={(event) => setMethodFilter(event.target.value as MethodFilter)}
          className="rounded border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
        >
          <option value="all">All methods</option>
          <option value="online">Online</option>
          <option value="cash">Cash</option>
        </select>
        <button
          type="button"
          onClick={() => setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"))}
          className="rounded border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
        >
          Sort by date: {sortDirection === "desc" ? "Newest first" : "Oldest first"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
          <thead className="bg-stone-50 text-xs font-semibold uppercase tracking-wide text-stone-600">
            <tr>
              <th className="px-4 py-3 sm:px-5">Date</th>
              <th className="px-4 py-3 sm:px-5">Student</th>
              <th className="px-4 py-3 sm:px-5">Method</th>
              <th className="px-4 py-3 sm:px-5">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 text-stone-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm text-stone-500 sm:px-5">
                  No ledger rows match this filter.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={row.id} className="hover:bg-stone-50/70">
                  <td className="px-4 py-3 font-mono text-xs text-stone-600 sm:px-5">{row.paid_on}</td>
                  <td className="px-4 py-3 font-medium sm:px-5">{nameById.get(row.student_id) ?? row.student_id}</td>
                  <td className="px-4 py-3 sm:px-5">
                    <span className="rounded-full border border-stone-300 bg-white px-2 py-0.5 text-xs uppercase tracking-wide text-stone-700">
                      {row.payment_method}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs sm:px-5">{formatCurrency(Number(row.amount ?? 0))}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
