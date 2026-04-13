"use client";

import { submitMockExamAttempt } from "@/app/actions/mock-exams";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type Question = {
  id: string;
  question_text: string;
  options: string[];
};

type Props = {
  examId: string;
  title: string;
  questions: Question[];
};

export function MockExamTaker({ examId, title, questions }: Props) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const answered = useMemo(() => Object.keys(answers).length, [answers]);

  function onSubmit() {
    setError(null);
    startTransition(async () => {
      const payload = questions.map((q) => ({
        questionId: q.id,
        chosenAnswer: answers[q.id] ?? "",
      }));
      const result = await submitMockExamAttempt({ mockExamId: examId, answers: payload });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push("/dashboard/student/mock-exam");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-gray-200 bg-white p-4">
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <p className="mt-1 text-sm text-gray-600">
          Answer all questions and submit your attempt. Progress: {answered}/{questions.length}.
        </p>
        {error ? (
          <p className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>
        ) : null}
      </header>

      <ol className="space-y-4">
        {questions.map((q, idx) => (
          <li key={q.id} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-medium text-gray-900">
              {idx + 1}. {q.question_text}
            </p>
            <div className="mt-3 space-y-2">
              {q.options.map((opt) => (
                <label key={`${q.id}-${opt}`} className="flex items-start gap-2 text-sm text-gray-700">
                  <input
                    type="radio"
                    name={q.id}
                    value={opt}
                    checked={answers[q.id] === opt}
                    onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt }))}
                    className="mt-1"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isPending || answered === 0}
          className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "Submitting..." : "Submit mock exam"}
        </button>
      </div>
    </div>
  );
}
