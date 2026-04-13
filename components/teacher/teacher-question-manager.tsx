"use client";

import { createTeacherQuestion } from "@/app/actions/teacher-questions";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type QuestionRow = {
  id: string;
  syllabus_code: string;
  topic_node: string;
  question_text: string;
  correct_answer: string;
  difficulty_level: number;
  question_pool: "quiz" | "mock" | "both";
};

type Props = {
  questions: QuestionRow[];
};

type PoolFilter = "all" | "quiz" | "mock" | "both";

export function TeacherQuestionManager({ questions }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [syllabusCode, setSyllabusCode] = useState("");
  const [topicNode, setTopicNode] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState(1);
  const [questionPool, setQuestionPool] = useState<"quiz" | "mock" | "both">("quiz");
  const [poolFilter, setPoolFilter] = useState<PoolFilter>("all");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const cleanOptions = useMemo(() => options.map((o) => o.trim()).filter(Boolean), [options]);
  const filteredQuestions = useMemo(
    () => questions.filter((q) => (poolFilter === "all" ? true : q.question_pool === poolFilter)),
    [questions, poolFilter]
  );

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((item, idx) => (idx === index ? value : item)));
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await createTeacherQuestion({
        syllabusCode,
        topicNode,
        questionText,
        options,
        correctAnswer,
        explanation,
        difficultyLevel,
        questionPool,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccess("Question added to the bank.");
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
      setExplanation("");
      setDifficultyLevel(1);
      setQuestionPool("quiz");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">Add question</h2>
        <p className="mt-1 text-sm text-gray-600">
          Questions are stored in Supabase and used by student quiz and mock exam flows.
        </p>
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          {error ? <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p> : null}
          {success ? (
            <p className="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
              {success}
            </p>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <input
              required
              value={syllabusCode}
              onChange={(e) => setSyllabusCode(e.target.value)}
              placeholder="Syllabus code (e.g. 9702)"
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              required
              value={topicNode}
              onChange={(e) => setTopicNode(e.target.value)}
              placeholder="Topic node (e.g. Kinematics_1.1)"
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <textarea
            required
            rows={3}
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Question text"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <div className="grid gap-3 md:grid-cols-2">
            {options.map((opt, i) => (
              <input
                key={i}
                required={i < 2}
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${i + 1}`}
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <select
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
              required
            >
              <option value="">Select correct answer</option>
              {cleanOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <select
              value={difficultyLevel}
              onChange={(e) => setDifficultyLevel(Number(e.target.value))}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value={1}>Difficulty 1 (Foundation)</option>
              <option value={2}>Difficulty 2 (Core)</option>
              <option value={3}>Difficulty 3 (Advanced)</option>
            </select>
            <select
              value={questionPool}
              onChange={(e) => setQuestionPool(e.target.value as "quiz" | "mock" | "both")}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="quiz">Quiz only</option>
              <option value="mock">Mock exam only</option>
              <option value="both">Both quiz and mock exam</option>
            </select>
          </div>
          <textarea
            required
            rows={3}
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Pre-generated explanation"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save question"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <header className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Recent question bank</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {(["all", "quiz", "mock", "both"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setPoolFilter(value)}
                className={`rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide ${
                  poolFilter === value
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {value}
              </button>
            ))}
            <span className="ml-1 text-xs text-gray-500">
              Showing {filteredQuestions.length} of {questions.length}
            </span>
          </div>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Correct</th>
                <th className="px-4 py-3">Diff</th>
                <th className="px-4 py-3">Pool</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuestions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No questions found for this filter.
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((q) => (
                  <tr key={q.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-mono text-xs">{q.topic_node}</td>
                    <td className="px-4 py-3 text-gray-900">{q.question_text}</td>
                    <td className="px-4 py-3">{q.correct_answer}</td>
                    <td className="px-4 py-3">{q.difficulty_level}</td>
                    <td className="px-4 py-3 uppercase">{q.question_pool}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
