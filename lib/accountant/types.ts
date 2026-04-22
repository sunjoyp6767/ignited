export type StudentDirectoryRow = {
  id: string;
  name: string;
};

export type LedgerPaymentRow = {
  id: string;
  student_id: string;
  amount: number | string;
  payment_method: "cash" | "online";
  paid_on: string;
};

export type QuizActivityRow = {
  student_id: string;
  completed_at: string;
  score_percent: number | null;
};

export type DashboardMetrics = {
  onlineEarnings: number;
  cashEarnings: number;
  totalEarnings: number;
  onlineEarningsThisMonth: number;
  monthlyOnlineDeltaPercent: number | null;
  monthlyRiskDelta: number;
};

export type EarningsTrendPoint = {
  monthKey: string;
  online: number;
  cash: number;
  total: number;
};

export type ActionAlert = {
  id: string;
  level: "info" | "warning" | "critical";
  title: string;
  description: string;
};
