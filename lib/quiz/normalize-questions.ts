import type { QuizQuestionPayload } from "@/lib/quiz/types";

function normalizeOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => String(item));
}

/** Maps a Supabase `questions` row into a client-safe quiz question. */
export function toQuizQuestionPayload(row: {
  id: string;
  syllabus_code: string;
  topic_node: string;
  question_text: string;
  options: unknown;
  correct_answer: string;
  explanation: string;
  difficulty_level: number;
}): QuizQuestionPayload {
  return {
    id: row.id,
    syllabus_code: row.syllabus_code,
    topic_node: row.topic_node,
    question_text: row.question_text,
    options: normalizeOptions(row.options),
    correct_answer: row.correct_answer,
    explanation: row.explanation,
    difficulty_level: row.difficulty_level,
  };
}
