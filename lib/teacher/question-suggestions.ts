import type { QuizAttemptScoreRow } from "@/lib/teacher/class-analytics";

export type QuestionSuggestion = {
  questionId: string;
  topicNode: string;
  syllabusCode: string;
  difficultyLevel: number;
  reason: string;
};

type QuestionRow = {
  id: string;
  syllabus_code: string;
  topic_node: string;
  difficulty_level: number;
  question_pool: "quiz" | "mock" | "both";
};

function weakTopicOrder(attempts: QuizAttemptScoreRow[]): string[] {
  const byTopic = new Map<string, number[]>();
  for (const row of attempts) {
    if (!row.topic_node || row.score_percent === null || !Number.isFinite(row.score_percent)) continue;
    const scores = byTopic.get(row.topic_node) ?? [];
    scores.push(row.score_percent);
    byTopic.set(row.topic_node, scores);
  }

  return Array.from(byTopic.entries())
    .map(([topicNode, scores]) => ({
      topicNode,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length,
      attempts: scores.length,
    }))
    .sort((a, b) => a.avg - b.avg || b.attempts - a.attempts)
    .map((x) => x.topicNode);
}

export function suggestQuestionsForTeacher(
  questions: QuestionRow[],
  attempts: QuizAttemptScoreRow[],
  limit = 6
): QuestionSuggestion[] {
  const weakTopics = weakTopicOrder(attempts);
  if (weakTopics.length === 0) return [];

  const selected: QuestionSuggestion[] = [];
  const seen = new Set<string>();

  for (const topic of weakTopics) {
    const candidates = questions
      .filter((q) => q.topic_node === topic && (q.question_pool === "quiz" || q.question_pool === "both"))
      .sort((a, b) => a.difficulty_level - b.difficulty_level);

    for (const candidate of candidates) {
      if (seen.has(candidate.id)) continue;
      seen.add(candidate.id);
      selected.push({
        questionId: candidate.id,
        topicNode: candidate.topic_node,
        syllabusCode: candidate.syllabus_code,
        difficultyLevel: candidate.difficulty_level,
        reason: "Suggested from weak-topic cluster and quiz-compatible difficulty progression.",
      });
      if (selected.length >= limit) return selected;
    }
  }

  return selected;
}
