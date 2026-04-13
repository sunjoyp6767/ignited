/**
 * Derives per-topic averages from `quiz_attempts` rows for intelligent routing visuals.
 */

export type AttemptRow = {
  topic_node: string | null;
  score_percent: number | null;
};

export type TopicStat = {
  attemptCount: number;
  averageScore: number;
};

/** Average score per topic (null topics skipped). */
export function averageScoreByTopic(attempts: AttemptRow[]): Map<string, TopicStat> {
  const buckets = new Map<string, number[]>();

  for (const a of attempts) {
    if (!a.topic_node || a.score_percent === null || !Number.isFinite(a.score_percent)) {
      continue;
    }
    const key = a.topic_node.trim();
    if (!key) continue;
    const arr = buckets.get(key) ?? [];
    arr.push(a.score_percent);
    buckets.set(key, arr);
  }

  const out = new Map<string, TopicStat>();
  for (const [topic, scores] of buckets.entries()) {
    const sum = scores.reduce((x, y) => x + y, 0);
    out.set(topic, {
      attemptCount: scores.length,
      averageScore: Math.round((sum / scores.length) * 10) / 10,
    });
  }
  return out;
}

export function overallAverageScore(attempts: AttemptRow[]): number | null {
  const scores = attempts
    .map((a) => a.score_percent)
    .filter((s): s is number => s !== null && Number.isFinite(s));
  if (scores.length === 0) return null;
  const sum = scores.reduce((a, b) => a + b, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

export function quizzesCompletedCount(attempts: AttemptRow[]): number {
  return attempts.filter(
    (a) => a.score_percent !== null && Number.isFinite(a.score_percent)
  ).length;
}
