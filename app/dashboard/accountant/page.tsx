import { DropoutRiskTable } from "@/components/accountant/dropout-risk-table";
import { ManualPaymentForm } from "@/components/accountant/manual-payment-form";
import { requireDashboardRole } from "@/lib/dashboard/require-role";
import {
  computeHighDropoutRiskRows,
  type PaymentLite,
  type QuizAttemptLite,
  type StudentLite,
} from "@/lib/accountant/dropout-risk";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accountant dashboard",
  description: "Ledger entry and predictive drop-out risk.",
};

export default async function AccountantDashboardPage() {
  await requireDashboardRole("accountant");

  const supabase = await createClient();

  const [studentsRes, paymentsRes, quizRes] = await Promise.all([
    supabase.from("users").select("id, name").eq("role", "student").order("name"),
    supabase.from("payments").select("student_id, paid_on"),
    supabase.from("quiz_attempts").select("student_id, completed_at"),
  ]);

  const students: StudentLite[] = (studentsRes.data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
  }));

  const payments: PaymentLite[] = (paymentsRes.data ?? []).map((r) => ({
    student_id: r.student_id,
    paid_on: r.paid_on,
  }));

  const quizAttempts: QuizAttemptLite[] = (quizRes.data ?? []).map((r) => ({
    student_id: r.student_id,
    completed_at: r.completed_at,
  }));

  const riskRows = computeHighDropoutRiskRows(
    students,
    payments,
    quizAttempts,
    new Date()
  );

  const loadError =
    studentsRes.error?.message ||
    paymentsRes.error?.message ||
    quizRes.error?.message;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="border-b border-stone-300 pb-6">
        <p className="text-xs font-medium uppercase tracking-widest text-stone-500">
          Faculty corner · Finance
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-900">
          Accountant dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Manual fee ledger and cohort risk view. Data-dense layout for daily operations.
        </p>
      </header>

      {loadError ? (
        <p className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          Some data could not be loaded: {loadError}. If you just added tables or RLS,
          run the latest <code className="font-mono">init_schema.sql</code> in Supabase.
        </p>
      ) : null}

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ManualPaymentForm students={students} />
        </div>
        <div className="lg:col-span-7">
          <DropoutRiskTable rows={riskRows} />
        </div>
      </div>
    </div>
  );
}
