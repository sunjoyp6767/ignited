import type { QuizAttemptScoreRow } from "@/lib/teacher/class-analytics";

export type TeacherAiInsight = {
  id: string;
  title: string;
  detail: string;
};

type TopicAggregate = {
  topicNode: string;
  averageScore: number;
  attempts: number;
};

function aggregateByTopic(rows: QuizAttemptScoreRow[]): TopicAggregate[] {
  const byTopic = new Map<string, number[]>();
  for (const row of rows) {
    if (!row.topic_node || row.score_percent === null || !Number.isFinite(row.score_percent)) continue;
    const topic = row.topic_node.trim();
    if (!topic) continue;
    const scores = byTopic.get(topic) ?? [];
    scores.push(row.score_percent);
    byTopic.set(topic, scores);
  }

  return Array.from(byTopic.entries()).map(([topicNode, scores]) => ({
    topicNode,
    attempts: scores.length,
    averageScore: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
  }));
}

export function buildTeacherAiInsights(rows: QuizAttemptScoreRow[]): TeacherAiInsight[] {
  const scored = rows.filter((r) => r.score_percent !== null && Number.isFinite(r.score_percent));
  if (scored.length === 0) {
    return [
      {
        id: "insufficient-data",
        title: "Insufficient class data",
        detail: "No scored attempts yet. Insights will appear once students complete quizzes.",
      },
    ];
  }

  const topicAgg = aggregateByTopic(rows).sort((a, b) => a.averageScore - b.averageScore);
  const weakTopics = topicAgg.filter((t) => t.averageScore < 50);
  const strongTopics = topicAgg.filter((t) => t.averageScore >= 75);
  const avgScore =
    Math.round(
      (scored.reduce((sum, row) => sum + (row.score_percent ?? 0), 0) / scored.length) * 10
    ) / 10;

  const clusterSummary =
    weakTopics.length === 0
      ? "No weak-topic cluster detected under the 50% threshold."
      : `Weak-topic cluster detected in ${weakTopics.length} topic(s): ${weakTopics
          .slice(0, 3)
          .map((t) => t.topicNode)
          .join(", ")}.`;

  return [
    {
      id: "class-trend",
      title: "Class trend snapshot",
      detail: `Average scored performance is ${avgScore}%. Based on current data, ${
        avgScore < 55 ? "intervention is recommended." : "progress is stable."
      }`,
    },
    {
      id: "weak-cluster",
      title: "Weak-topic clustering",
      detail: clusterSummary,
    },
    {
      id: "strong-coverage",
      title: "Strong-topic coverage",
      detail:
        strongTopics.length === 0
          ? "No topic has crossed 75% average yet."
          : `${strongTopics.length} topic(s) currently show strong mastery (>=75%): ${strongTopics
              .map((t) => t.topicNode)
              .join(", ")}.`,
    },
  ];
}
