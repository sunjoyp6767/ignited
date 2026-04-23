import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "IgnitED Faculty Corner — syllabus-aligned LMS for Cambridge and Pearson Edexcel.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-xs font-medium uppercase tracking-widest text-stone-500">
        About
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-900 sm:text-3xl">
        IgnitED Faculty Corner
      </h1>
      <p className="mt-4 text-base leading-relaxed text-stone-600">
        IgnitED is an academic learning management system aimed at Cambridge IGCSE /
        International A Level and Pearson Edexcel pathways. The product emphasises
        syllabus alignment: assessments, remediation, and study routing are tied to
        the same node structure teachers already use to plan courses.
      </p>

      <p className="mt-3 text-sm leading-relaxed text-stone-600">
        We support both <span className="font-medium text-stone-800">offline classroom</span> and{" "}
        <span className="font-medium text-stone-800">online learning</span> modes so families can
        choose what fits their schedule, commute, and comfort level.
      </p>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-stone-500">
        Who it is for
      </h2>
      <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-relaxed text-stone-600">
        <li>
          <span className="font-medium text-stone-800">Students</span> sit
          syllabus-scoped quizzes, follow suggested paths, and review explanations
          from pre-authored question banks.
        </li>
        <li>
          <span className="font-medium text-stone-800">Faculty</span> maintain
          syllabus nodes and monitor cohort performance from a dedicated corner of
          the platform.
        </li>
        <li>
          <span className="font-medium text-stone-800">Parents</span> get a more
          transparent preparation journey through structured practice, measurable
          progress, and clear intervention signals before high-stakes exams.
        </li>
      </ul>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-stone-500">
        Design principles
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-stone-600">
        IgnitED is built as a transparent prototype: routing, risk flags, and
        recommendations are expressed as explicit rules and queries over your own
        tables—not opaque, live-generated tutoring text. That keeps latency low and
        outcomes explainable in an exam-focused environment.
      </p>

      <p className="mt-3 text-sm leading-relaxed text-stone-600">
        Our goal is simple: help students build confidence topic by topic, while
        giving parents confidence that preparation is consistent, accountable, and
        aligned with Cambridge and Edexcel expectations.
      </p>

      <div className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/register"
          className="inline-flex h-10 items-center justify-center rounded-md bg-stone-900 px-4 text-sm font-medium text-white hover:bg-stone-800"
        >
          Get started
        </Link>
        <Link
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md border border-stone-300 bg-white px-4 text-sm font-medium text-stone-800 hover:bg-stone-50"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
