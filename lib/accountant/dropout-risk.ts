/**
 * Predictive drop-out risk (rule-based, no external AI).
 *
 * A student is flagged **High Drop-Out Risk** when **both**:
 * 1. No payment recorded in the last `PAYMENT_WINDOW_DAYS` days (inclusive window by calendar `paid_on`).
 * 2. No quiz completion recorded in the last `QUIZ_RECENT_DAYS` days (`quiz_attempts.completed_at`).
 */

export const PAYMENT_WINDOW_DAYS = 30;
export const QUIZ_RECENT_DAYS = 14;

export type StudentLite = { id: string; name: string };

export type PaymentLite = { student_id: string; paid_on: string };

export type QuizAttemptLite = { student_id: string; completed_at: string };

export type DropoutRiskRow = {
  studentId: string;
  name: string;
  lastPaymentDate: string | null;
  lastQuizAt: string | null;
  /** Human-readable reasons (deterministic copy) */
  reasons: string[];
};

function startOfUtcDay(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function addUtcDays(d: Date, days: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

/** Latest calendar payment date per student (ISO `YYYY-MM-DD` from DB). */
function maxPaidOnByStudent(payments: PaymentLite[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const p of payments) {
    const cur = map.get(p.student_id);
    if (!cur || p.paid_on > cur) map.set(p.student_id, p.paid_on);
  }
  return map;
}

/** Latest quiz completion instant per student (ISO timestamp). */
function maxQuizAtByStudent(attempts: QuizAttemptLite[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const a of attempts) {
    const cur = map.get(a.student_id);
    const t = a.completed_at;
    if (!cur || new Date(t) > new Date(cur)) map.set(a.student_id, t);
  }
  return map;
}

/**
 * Returns students matching both risk criteria. Pure function for unit-style clarity.
 */
export function computeHighDropoutRiskRows(
  students: StudentLite[],
  payments: PaymentLite[],
  quizAttempts: QuizAttemptLite[],
  now: Date
): DropoutRiskRow[] {
  const paymentCutoff = addUtcDays(startOfUtcDay(now), -PAYMENT_WINDOW_DAYS);
  const paymentCutoffStr = paymentCutoff.toISOString().slice(0, 10);

  const quizCutoff = new Date(now.getTime() - QUIZ_RECENT_DAYS * 86400000);

  const lastPay = maxPaidOnByStudent(payments);
  const lastQuiz = maxQuizAtByStudent(quizAttempts);

  const out: DropoutRiskRow[] = [];

  for (const s of students) {
    const paid = lastPay.get(s.id) ?? null;
    const hasRecentPayment =
      paid !== null && paid >= paymentCutoffStr;

    const quizAt = lastQuiz.get(s.id) ?? null;
    const hasRecentQuiz =
      quizAt !== null && new Date(quizAt) >= quizCutoff;

    if (hasRecentPayment || hasRecentQuiz) continue;

    const reasons: string[] = [];
    if (paid === null) {
      reasons.push(`No payment on record in the last ${PAYMENT_WINDOW_DAYS} days (no ledger entries).`);
    } else {
      reasons.push(
        `Last payment dated ${paid} is before the ${PAYMENT_WINDOW_DAYS}-day window (cutoff ${paymentCutoffStr}).`
      );
    }

    if (quizAt === null) {
      reasons.push(`No quiz completion logged in the last ${QUIZ_RECENT_DAYS} days (no attempts on file).`);
    } else {
      reasons.push(
        `Last quiz completion ${quizAt} is older than ${QUIZ_RECENT_DAYS} days.`
      );
    }

    out.push({
      studentId: s.id,
      name: s.name,
      lastPaymentDate: paid,
      lastQuizAt: quizAt,
      reasons,
    });
  }

  return out;
}
