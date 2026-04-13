"use client";

import {
  resolveTutoringRoute,
  scorePercent,
} from "@/lib/quiz/tutoring-route";
import type { QuizQuestionPayload } from "@/lib/quiz/types";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type QuizTakerProps = {
  questions: QuizQuestionPayload[];
  topicNode: string;
};

type Phase = "quiz" | "results";

function countCorrect(
  questions: QuizQuestionPayload[],
  answers: Record<string, string | undefined>
): number {
  let n = 0;
  for (const q of questions) {
    const chosen = answers[q.id]?.trim();
    if (chosen && chosen === q.correct_answer.trim()) n += 1;
  }
  return n;
}

export function QuizTaker({ questions, topicNode }: QuizTakerProps) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("quiz");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | undefined>>(
    {}
  );
  const [persistError, setPersistError] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);
  const postedRef = useRef(false);

  useEffect(() => {
    postedRef.current = false;
    setPersistError(null);
  }, [topicNode]);

  const current = questions[index];
  const isLast = index >= questions.length - 1;

  const results = useMemo(() => {
    if (phase !== "results") return null;
    const correct = countCorrect(questions, answers);
    const total = questions.length;
    const percent = scorePercent(correct, total);
    const route = resolveTutoringRoute(percent);
    return { correct, total, percent, route };
  }, [phase, questions, answers]);

  if (questions.length === 0) {
    return (
      <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        No questions are available for topic <span className="font-mono">{topicNode}</span>.
        Add rows to the <code className="font-mono">questions</code> table in Supabase (see{" "}
        <code className="font-mono">init_schema.sql</code>).
      </p>
    );
  }

  async function handleFinishQuiz() {
    if (!selected || finishing) return;
    setFinishing(true);
    setPersistError(null);

    const correct = countCorrect(questions, answers);
    const total = questions.length;
    const percent = scorePercent(correct, total);

    if (!postedRef.current) {
      const supabase = createClient();
      const {
        data: { user },
        error: authErr,
      } = await supabase.auth.getUser();

      if (authErr || !user) {
        setPersistError("Could not verify your session. Progress was not saved.");
        postedRef.current = false;
      } else {
        const { error } = await supabase.from("quiz_attempts").insert({
          student_id: user.id,
          topic_node: topicNode,
          score_percent: percent,
          completed_at: new Date().toISOString(),
        });

        if (error) {
          setPersistError(
            `Score not saved: ${error.message}. Check Supabase RLS and the quiz_attempts table.`
          );
          postedRef.current = false;
        } else {
          postedRef.current = true;
          router.refresh();
        }
      }
    }

    setPhase("results");
    setFinishing(false);
  }

  if (phase === "results" && results) {
    return (
      <div className="space-y-8">
        <header className="space-y-2 border-b border-stone-200 pb-6">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Quiz results · {topicNode}
          </p>
          <h2 className="text-xl font-semibold text-stone-900">Summary</h2>
          {persistError ? (
            <p
              className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950"
              role="alert"
            >
              {persistError}
            </p>
          ) : null}
          <p className="text-sm text-stone-600">
            Score:{" "}
            <span className="font-semibold text-stone-900">
              {results.correct}/{results.total}
            </span>{" "}
            ({results.percent}%)
          </p>
          <div
            className={`rounded-lg border px-4 py-3 text-sm ${
              results.route.routeId === "foundation"
                ? "border-amber-200 bg-amber-50 text-amber-950"
                : results.route.routeId === "advanced"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                  : "border-sky-200 bg-sky-50 text-sky-950"
            }`}
          >
            <p className="font-semibold">Routing: {results.route.label}</p>
            <p className="mt-2 leading-relaxed">{results.route.guidance}</p>
          </div>
        </header>

        <section className="space-y-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">
            Review (pre-generated explanations)
          </h3>
          <ol className="space-y-6">
            {questions.map((q, i) => {
              const chosen = answers[q.id];
              const ok = chosen?.trim() === q.correct_answer.trim();
              return (
                <li
                  key={q.id}
                  className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm"
                >
                  <p className="text-xs text-stone-500">
                    Q{i + 1} · Difficulty {q.difficulty_level}
                  </p>
                  <p className="mt-1 text-sm font-medium text-stone-900">
                    {q.question_text}
                  </p>
                  <dl className="mt-3 space-y-1 text-sm">
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="text-stone-500">Your answer:</dt>
                      <dd
                        className={
                          ok ? "font-medium text-emerald-800" : "font-medium text-red-800"
                        }
                      >
                        {chosen ?? "(no answer)"}
                      </dd>
                    </div>
                    <div className="flex flex-wrap gap-x-2">
                      <dt className="text-stone-500">Correct answer:</dt>
                      <dd className="font-medium text-stone-900">{q.correct_answer}</dd>
                    </div>
                    <div className="pt-2">
                      <dt className="text-xs font-medium uppercase text-stone-500">
                        Explanation
                      </dt>
                      <dd className="mt-1 leading-relaxed text-stone-700">
                        {q.explanation}
                      </dd>
                    </div>
                  </dl>
                </li>
              );
            })}
          </ol>
        </section>
      </div>
    );
  }

  const selected = current ? answers[current.id] : undefined;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between text-xs text-stone-500">
        <span>
          Topic <span className="font-mono text-stone-700">{topicNode}</span>
        </span>
        <span>
          Question {index + 1} of {questions.length}
        </span>
      </div>

      {current ? (
        <fieldset className="space-y-4 rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <legend className="text-base font-semibold text-stone-900">
            {current.question_text}
          </legend>
          <div className="space-y-2">
            {current.options.map((opt) => {
              const id = `${current.id}-${opt}`;
              return (
                <label
                  key={id}
                  className="flex cursor-pointer items-start gap-3 rounded-md border border-stone-200 px-3 py-2 text-sm has-[:checked]:border-stone-900 has-[:checked]:bg-stone-50"
                >
                  <input
                    type="radio"
                    name={current.id}
                    value={opt}
                    checked={selected === opt}
                    onChange={() =>
                      setAnswers((prev) => ({ ...prev, [current.id]: opt }))
                    }
                    className="mt-0.5"
                  />
                  <span className="text-stone-800">{opt}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="flex justify-end gap-3">
        {index > 0 ? (
          <button
            type="button"
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 hover:bg-stone-50"
          >
            Back
          </button>
        ) : null}
        {!isLast ? (
          <button
            type="button"
            disabled={!selected}
            onClick={() => setIndex((i) => i + 1)}
            className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            disabled={!selected || finishing}
            onClick={() => void handleFinishQuiz()}
            className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {finishing ? "Saving…" : "Finish & see results"}
          </button>
        )}
      </div>
    </div>
  );
}
