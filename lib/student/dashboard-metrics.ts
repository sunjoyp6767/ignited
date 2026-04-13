import { averageScoreByTopic, type AttemptRow } from "@/lib/student/topic-stats";
import { topicNodesForExamReadiness } from "@/lib/student/syllabus-topic-nodes";

export type BestWorstTopic = {
  topicNode: string;
  averageScore: number;
};

function sortedTopicAverages(attempts: AttemptRow[]): BestWorstTopic[] {
  const map = averageScoreByTopic(attempts);
  const rows: BestWorstTopic[] = [];
  for (const [topicNode, stat] of map.entries()) {
    rows.push({ topicNode, averageScore: stat.averageScore });
  }
  rows.sort((a, b) => b.averageScore - a.averageScore);
  return rows;
}

export function bestTopicByAverage(attempts: AttemptRow[]): BestWorstTopic | null {
  const rows = sortedTopicAverages(attempts);
  return rows[0] ?? null;
}

export function needsWorkTopicByAverage(attempts: AttemptRow[]): BestWorstTopic | null {
  const rows = sortedTopicAverages(attempts);
  return rows.length > 0 ? rows[rows.length - 1]! : null;
}

/**
 * (topics with avg > 60) / (total syllabus topic nodes) * 100, rounded.
 */
export function examReadinessPercent(
  attempts: AttemptRow[],
  syllabusCode: string | null
): number | null {
  const syllabusTopics = topicNodesForExamReadiness(syllabusCode);
  if (syllabusTopics.length === 0) return null;
  const byTopic = averageScoreByTopic(attempts);
  let masteredCount = 0;
  for (const node of syllabusTopics) {
    const stat = byTopic.get(node);
    if (stat && stat.averageScore > 60) {
      masteredCount += 1;
    }
  }
  return Math.round((masteredCount / syllabusTopics.length) * 100);
}
