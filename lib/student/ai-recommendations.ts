import type { AttemptRow } from "@/lib/student/topic-stats";
import { averageScoreByTopic } from "@/lib/student/topic-stats";

export type StudentAiRecommendation = {
  topicNode: string;
  averageScore: number;
  reason: string;
  recommendedDifficulty: 1 | 2 | 3;
};

function toDifficulty(score: number): 1 | 2 | 3 {
  if (score < 45) return 1;
  if (score < 70) return 2;
  return 3;
}

export function buildStudentAiRecommendations(
  attempts: AttemptRow[],
  limit = 3
): StudentAiRecommendation[] {
  const byTopic = averageScoreByTopic(attempts);
  const rows = Array.from(byTopic.entries()).map(([topicNode, stat]) => ({
    topicNode,
    averageScore: stat.averageScore,
    attempts: stat.attemptCount,
  }));

  rows.sort((left, right) => left.averageScore - right.averageScore || right.attempts - left.attempts);

  return rows.slice(0, limit).map((row) => {
    const recommendedDifficulty = toDifficulty(row.averageScore);
    return {
      topicNode: row.topicNode,
      averageScore: row.averageScore,
      recommendedDifficulty,
      reason:
        row.averageScore < 50
          ? `Low mastery (${row.averageScore}%). Prioritize foundation reinforcement.`
          : `Developing mastery (${row.averageScore}%). Continue structured practice.`,
    };
  });
}
