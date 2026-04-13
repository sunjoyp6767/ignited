import type { AttemptRow } from "@/lib/student/topic-stats";
import { averageScoreByTopic } from "@/lib/student/topic-stats";

export type StudyPlanStatus = "not_started" | "needs_work" | "in_progress" | "mastered";

export type StudyPlanItem = {
  topicNode: string;
  displayName: string;
  status: StudyPlanStatus;
  scheduledDate: string | null;
  avgScore: number | null;
};

const EXAM_DATE_ISO = "2026-06-15";

function startOfLocalNoon(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0);
}

function isWeekendLocal(d: Date): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

function firstSchedulingAnchor(from: Date): Date {
  const cur = startOfLocalNoon(from);
  while (isWeekendLocal(cur)) {
    cur.setDate(cur.getDate() + 1);
  }
  return cur;
}

function nextWeekdayAfter(d: Date): Date {
  const n = startOfLocalNoon(d);
  n.setDate(n.getDate() + 1);
  while (isWeekendLocal(n)) {
    n.setDate(n.getDate() + 1);
  }
  return n;
}

function statusPriority(s: StudyPlanStatus): number {
  switch (s) {
    case "needs_work":
      return 0;
    case "not_started":
      return 1;
    case "in_progress":
      return 2;
    case "mastered":
      return 3;
    default:
      return 9;
  }
}

function computeStatus(topicNode: string, byTopic: ReturnType<typeof averageScoreByTopic>): {
  status: StudyPlanStatus;
  avgScore: number | null;
} {
  const stat = byTopic.get(topicNode);
  if (!stat || stat.attemptCount === 0) {
    return { status: "not_started", avgScore: null };
  }
  const avg = stat.averageScore;
  if (avg < 50) return { status: "needs_work", avgScore: avg };
  if (avg < 80) return { status: "in_progress", avgScore: avg };
  return { status: "mastered", avgScore: avg };
}

export type StudyNodeInput = {
  topicNode: string;
  displayName: string;
  displayOrder: number;
};

/**
 * Pure study plan generator: syllabus nodes + quiz aggregates → ordered plan with weekday dates.
 */
export function generateStudyPlan(
  studyNodes: readonly StudyNodeInput[],
  attempts: AttemptRow[],
  anchorDate: Date = new Date()
): StudyPlanItem[] {
  const byTopic = averageScoreByTopic(attempts);

  const rows: StudyPlanItem[] = studyNodes
    .slice()
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((n) => {
      const { status, avgScore } = computeStatus(n.topicNode, byTopic);
      return {
        topicNode: n.topicNode,
        displayName: n.displayName,
        status,
        scheduledDate: null,
        avgScore,
      };
    });

  rows.sort((a, b) => {
    const pa = statusPriority(a.status);
    const pb = statusPriority(b.status);
    if (pa !== pb) return pa - pb;
    const oa = studyNodes.find((x) => x.topicNode === a.topicNode)?.displayOrder ?? 0;
    const ob = studyNodes.find((x) => x.topicNode === b.topicNode)?.displayOrder ?? 0;
    return oa - ob;
  });

  let cursor = firstSchedulingAnchor(anchorDate);
  for (const row of rows) {
    if (row.status === "needs_work" || row.status === "not_started") {
      row.scheduledDate = cursor.toISOString().slice(0, 10);
      cursor = nextWeekdayAfter(cursor);
    }
  }

  return rows;
}

export function examDateIso(): string {
  return EXAM_DATE_ISO;
}
