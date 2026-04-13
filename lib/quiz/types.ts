/**
 * Serializable quiz payload passed from the Server Component to `QuizTaker`.
 */
export type QuizQuestionPayload = {
  id: string;
  syllabus_code: string;
  topic_node: string;
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  difficulty_level: number;
};
