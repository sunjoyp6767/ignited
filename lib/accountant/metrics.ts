import {
  PAYMENT_WINDOW_DAYS,
  QUIZ_RECENT_DAYS,
  type DropoutRiskRow,
} from "@/lib/accountant/dropout-risk";
import type {
  ActionAlert,
  DashboardMetrics,
  EarningsTrendPoint,
  LedgerPaymentRow,
} from "@/lib/accountant/types";

function startOfUtcMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function addUtcMonths(d: Date, months: number): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + months, 1));
}

export function formatCurrency(value: number) {
  return `TK ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`;
}

export function buildEarningsTrend(
  payments: LedgerPaymentRow[],
  monthsBack: number,
  now: Date
): EarningsTrendPoint[] {
  const points: EarningsTrendPoint[] = [];
  const firstMonth = addUtcMonths(startOfUtcMonth(now), -(monthsBack - 1));

  for (let i = 0; i < monthsBack; i += 1) {
    const monthDate = addUtcMonths(firstMonth, i);
    const monthKey = monthDate.toISOString().slice(0, 7);
    points.push({ monthKey, online: 0, cash: 0, total: 0 });
  }

  const indexByMonth = new Map(points.map((p, i) => [p.monthKey, i] as const));

  for (const p of payments) {
    const date = new Date(p.paid_on);
    if (Number.isNaN(date.getTime())) continue;
    const key = date.toISOString().slice(0, 7);
    const idx = indexByMonth.get(key);
    if (idx === undefined) continue;

    const amount = Number(p.amount ?? 0);
    if (!Number.isFinite(amount)) continue;

    if (p.payment_method === "online") points[idx].online += amount;
    if (p.payment_method === "cash") points[idx].cash += amount;
    points[idx].total += amount;
  }

  return points;
}

export function computeDashboardMetrics(
  payments: LedgerPaymentRow[],
  highRiskRows: DropoutRiskRow[],
  now: Date
): DashboardMetrics {
  const currentMonthStart = startOfUtcMonth(now);
  const previousMonthStart = addUtcMonths(currentMonthStart, -1);

  let onlineEarnings = 0;
  let cashEarnings = 0;
  let onlineEarningsThisMonth = 0;
  let previousMonthOnline = 0;

  for (const p of payments) {
    const amount = Number(p.amount ?? 0);
    if (!Number.isFinite(amount)) continue;
    const paidOn = new Date(p.paid_on);
    if (Number.isNaN(paidOn.getTime())) continue;

    if (p.payment_method === "online") {
      onlineEarnings += amount;
      if (paidOn >= currentMonthStart) onlineEarningsThisMonth += amount;
      if (paidOn >= previousMonthStart && paidOn < currentMonthStart) {
        previousMonthOnline += amount;
      }
    } else if (p.payment_method === "cash") {
      cashEarnings += amount;
    }
  }

  const monthlyOnlineDeltaPercent =
    previousMonthOnline <= 0
      ? null
      : ((onlineEarningsThisMonth - previousMonthOnline) / previousMonthOnline) * 100;

  const paymentWindowStart = new Date(now.getTime() - PAYMENT_WINDOW_DAYS * 86400000);
  const quizWindowStart = new Date(now.getTime() - QUIZ_RECENT_DAYS * 86400000);

  let currentRiskCount = 0;
  let previousRiskCount = 0;

  for (const row of highRiskRows) {
    currentRiskCount += 1;

    const lastPayment = row.lastPaymentDate ? new Date(row.lastPaymentDate) : null;
    const lastQuiz = row.lastQuizAt ? new Date(row.lastQuizAt) : null;
    const hadPaymentInPrevWindow = lastPayment && lastPayment >= paymentWindowStart;
    const hadQuizInPrevWindow = lastQuiz && lastQuiz >= quizWindowStart;
    if (!hadPaymentInPrevWindow && !hadQuizInPrevWindow) {
      previousRiskCount += 1;
    }
  }

  return {
    onlineEarnings,
    cashEarnings,
    totalEarnings: onlineEarnings + cashEarnings,
    onlineEarningsThisMonth,
    monthlyOnlineDeltaPercent,
    monthlyRiskDelta: currentRiskCount - previousRiskCount,
  };
}

export function buildActionAlerts(
  trend: EarningsTrendPoint[],
  highRiskRows: DropoutRiskRow[],
  now: Date
): ActionAlert[] {
  const alerts: ActionAlert[] = [];
  const lastTwo = trend.slice(-2);

  if (lastTwo.length === 2 && lastTwo[0].online > 0) {
    const dropPct = ((lastTwo[0].online - lastTwo[1].online) / lastTwo[0].online) * 100;
    if (dropPct >= 25) {
      alerts.push({
        id: "online-drop",
        level: "warning",
        title: "Online collection dropped sharply",
        description: `Online earnings fell ${dropPct.toFixed(1)}% versus last month.`,
      });
    }
  }

  const highCount = highRiskRows.filter((r) => r.severity === "high").length;
  if (highCount >= 5) {
    alerts.push({
      id: "high-risk-spike",
      level: "critical",
      title: "High-risk student count is elevated",
      description: `${highCount} students are currently in high-risk dropout status.`,
    });
  }

  const sevenDayCutoff = new Date(now.getTime() - 7 * 86400000);
  const hadRecentPayments = trend.some((m) => m.total > 0);
  const latestMonth = trend.at(-1);
  if (hadRecentPayments && latestMonth && latestMonth.total === 0 && now >= sevenDayCutoff) {
    alerts.push({
      id: "no-weekly-payments",
      level: "warning",
      title: "No recent payment activity",
      description: "No payments were logged in the recent rolling period. Check posting workflow.",
    });
  }

  if (alerts.length === 0) {
    alerts.push({
      id: "stable-overview",
      level: "info",
      title: "Finance activity is stable",
      description: "No critical warning signals detected by the current rule set.",
    });
  }

  return alerts;
}
