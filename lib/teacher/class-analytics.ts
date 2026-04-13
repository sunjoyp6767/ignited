/**
 * Class / platform analytics derived from Supabase rows (no external AI).
 */

export type QuizAttemptScoreRow = {
  topic_node: string | null;
  score_percent: number | null;
};

export type TopicPerformance = {
  topicNode: string;
  attemptCount: number;
  averageScore: number;
};

const MISSED_THRESHOLD = 50;
const MIN_ATTEMPTS_FOR_TOPIC = 2;

/** Distinct active students across all enrollments. */
export function countDistinctEnrolledStudents(
  enrollmentRows: { student_id: string }[]
): number {
  return new Set(enrollmentRows.map((r) => r.student_id)).size;
}

/** Distinct students with at least one quiz attempt row (platform-wide; no enrollment required). */
export function countDistinctStudentsWithAttempts(
  attemptRows: { student_id: string | null }[]
): number {
  return new Set(attemptRows.map((r) => r.student_id).filter(Boolean)).size;
}

/** Arithmetic mean of non-null quiz scores; null if no scored attempts. */
export function averageQuizScorePercent(
  attempts: QuizAttemptScoreRow[]
): number | null {
  const scores = attempts
    .map((a) => a.score_percent)
    .filter((s): s is number => s !== null && Number.isFinite(s));
  if (scores.length === 0) return null;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

/**
 * Topics that are "most missed": average score strictly below 50% with at least
 * `MIN_ATTEMPTS_FOR_TOPIC` scored attempts (reduces single-attempt noise).
 */
export function computeMostMissedTopics(
  attempts: QuizAttemptScoreRow[]
): TopicPerformance[] {
  const byTopic = new Map<string, number[]>();

  for (const a of attempts) {
    if (!a.topic_node || a.score_percent === null || !Number.isFinite(a.score_percent)) {
      continue;
    }
    const key = a.topic_node.trim();
    if (!key) continue;
    const list = byTopic.get(key) ?? [];
    list.push(a.score_percent);
    byTopic.set(key, list);
  }

  const out: TopicPerformance[] = [];
  for (const [topicNode, scores] of byTopic.entries()) {
    if (scores.length < MIN_ATTEMPTS_FOR_TOPIC) continue;
    const avg = scores.reduce((x, y) => x + y, 0) / scores.length;
    if (avg < MISSED_THRESHOLD) {
      out.push({
        topicNode,
        attemptCount: scores.length,
        averageScore: Math.round(avg * 10) / 10,
      });
    }
  }

  out.sort((a, b) => a.averageScore - b.averageScore || b.attemptCount - a.attemptCount);
  return out;
}

export { MISSED_THRESHOLD, MIN_ATTEMPTS_FOR_TOPIC };
