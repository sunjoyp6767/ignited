import type {
  LedgerPaymentRow,
  QuizActivityRow,
  StudentDirectoryRow,
} from "@/lib/accountant/types";
import { createClient } from "@/utils/supabase/server";

export type AccountantDashboardQueryResult = {
  students: StudentDirectoryRow[];
  ledger: LedgerPaymentRow[];
  quizzes: QuizActivityRow[];
  loadError: string | null;
};

export async function getAccountantDashboardData(): Promise<AccountantDashboardQueryResult> {
  const supabase = await createClient();

  const [studentsRes, ledgerRes, quizRes] = await Promise.all([
    supabase.from("users").select("id, name").eq("role", "student").order("name"),
    supabase
      .from("payments")
      .select("id, student_id, amount, payment_method, paid_on")
      .order("paid_on", { ascending: false }),
    supabase
      .from("quiz_attempts")
      .select("student_id, completed_at, score_percent"),
  ]);

  return {
    students: studentsRes.data ?? [],
    ledger: (ledgerRes.data ?? []) as LedgerPaymentRow[],
    quizzes: (quizRes.data ?? []) as QuizActivityRow[],
    loadError:
      studentsRes.error?.message || ledgerRes.error?.message || quizRes.error?.message || null,
  };
}
