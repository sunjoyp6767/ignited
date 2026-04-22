"use client";

import { recordManualPayment } from "@/app/actions/accountant-payments";
import { useState } from "react";

export type StudentOption = { id: string; name: string };

type ManualPaymentFormProps = {
  students: StudentOption[];
};

export function ManualPaymentForm({ students }: ManualPaymentFormProps) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [paidOn, setPaidOn] = useState(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<"cash" | "online">("cash");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const parsed = Number.parseFloat(amount);
    if (!studentId) {
      setError("Select a student before posting.");
      setLoading(false);
      return;
    }
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setError("Enter a valid amount.");
      setLoading(false);
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(paidOn)) {
      setError("Enter a valid paid date.");
      setLoading(false);
      return;
    }

    const result = await recordManualPayment({
      studentId,
      amount: Math.round(parsed * 100) / 100,
      paymentMethod: method,
      paidOn,
    });

    if (!result.ok) {
      setError(result.message);
      setLoading(false);
      return;
    }

    setSuccess("Payment posted to the ledger.");
    setAmount("");
    setLoading(false);
  }

  return (
    <section className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-700">
          Manual payment entry
        </h2>
        <p className="mt-0.5 text-xs text-stone-500">
          Cash or online ledger line — no card gateway. Posted with today’s date (UTC).
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        {error ? (
          <p
            className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-900">
            {success}
          </p>
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label
              htmlFor="pay-student"
              className="block text-xs font-medium uppercase tracking-wide text-stone-600"
            >
              Student
            </label>
            <select
              id="pay-student"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              disabled={students.length === 0}
              className="mt-1 block w-full rounded border border-stone-300 bg-white px-2 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400 disabled:bg-stone-100"
            >
              {students.length === 0 ? (
                <option value="">No students in directory</option>
              ) : (
                students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label
              htmlFor="pay-amount"
              className="block text-xs font-medium uppercase tracking-wide text-stone-600"
            >
              Amount
            </label>
            <div className="relative mt-1">
              <span className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-sm text-stone-500">
                ৳
              </span>
              <input
                id="pay-amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full rounded border border-stone-300 py-2 pl-6 pr-2 text-sm tabular-nums text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="pay-method"
              className="block text-xs font-medium uppercase tracking-wide text-stone-600"
            >
              Method
            </label>
            <select
              id="pay-method"
              value={method}
              onChange={(e) =>
                setMethod(e.target.value as "cash" | "online")
              }
              className="mt-1 block w-full rounded border border-stone-300 bg-white px-2 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
            >
              <option value="cash">Cash</option>
              <option value="online">Online (manual record)</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="pay-date"
              className="block text-xs font-medium uppercase tracking-wide text-stone-600"
            >
              Paid on
            </label>
            <input
              id="pay-date"
              type="date"
              required
              value={paidOn}
              onChange={(e) => setPaidOn(e.target.value)}
              className="mt-1 block w-full rounded border border-stone-300 bg-white px-2 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 pt-3">
          <p className="text-xs text-stone-500">
            Tip: use back-dated posting for delayed manual entries.
          </p>
          <button
            type="submit"
            disabled={loading || students.length === 0}
            className="rounded bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Posting…" : "Post payment"}
          </button>
        </div>
      </form>
    </section>
  );
}
