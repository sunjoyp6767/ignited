import { ActionAlerts } from "@/components/accountant/action-alerts";
import { ContactMessagesTable } from "@/components/accountant/contact-messages-table";
import { DropoutRiskTable } from "@/components/accountant/dropout-risk-table";
import { EarningsTrend } from "@/components/accountant/earnings-trend";
import { LedgerTable } from "@/components/accountant/ledger-table";
import { ManualPaymentForm } from "@/components/accountant/manual-payment-form";
import { RiskSummaryCards } from "@/components/accountant/risk-summary-cards";
import {
  buildActionAlerts,
  buildEarningsTrend,
  computeDashboardMetrics,
} from "@/lib/accountant/metrics";
import { getAccountantDashboardData } from "@/lib/accountant/queries";
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

  const now = new Date();
  const { students, ledger, quizzes, loadError } = await getAccountantDashboardData();
  const supabase = await createClient();
  const messagesRes = await supabase
    .from("contact_messages")
    .select("id, name, email, message, source_page, status, created_at")
    .order("created_at", { ascending: false })
    .limit(60);
  const studentLite: StudentLite[] = students.map((s) => ({ id: s.id, name: s.name }));
  const paymentLite: PaymentLite[] = ledger.map((entry) => ({
    student_id: entry.student_id,
    paid_on: entry.paid_on,
  }));
  const quizLite: QuizAttemptLite[] = quizzes.map((q) => ({
    student_id: q.student_id,
    completed_at: q.completed_at,
    score_percent: q.score_percent,
  }));

  const riskRows = computeHighDropoutRiskRows(
    studentLite,
    paymentLite,
    quizLite,
    now
  );

  const metrics = computeDashboardMetrics(ledger, riskRows, now);
  const trend = buildEarningsTrend(ledger, 6, now);
  const alerts = buildActionAlerts(trend, riskRows, now);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
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

      <div className="mt-6">
        <RiskSummaryCards metrics={metrics} />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <EarningsTrend points={trend} />
        </div>
        <div className="xl:col-span-5">
          <ActionAlerts alerts={alerts} />
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <ManualPaymentForm students={students} />
        </div>
        <div className="lg:col-span-7">
          <DropoutRiskTable rows={riskRows} />
        </div>
      </div>

      <div className="mt-8">
        <LedgerTable rows={ledger} students={students} />
      </div>

      <div className="mt-8">
        <ContactMessagesTable rows={messagesRes.data ?? []} />
      </div>
    </div>
  );
}
