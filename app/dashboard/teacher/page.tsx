import { ClassAnalyticsOverview } from "@/components/teacher/class-analytics-overview";
import { requireDashboardRole } from "@/lib/dashboard/require-role";
import type { QuizAttemptScoreRow } from "@/lib/teacher/class-analytics";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Teacher dashboard",
  description: "Class analytics and course resources.",
};

export default async function TeacherDashboardPage() {
  await requireDashboardRole("teacher");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/teacher");
  }

  const attemptsRes = await supabase
    .from("quiz_attempts")
    .select("topic_node, score_percent, student_id");

  const attemptRows: (QuizAttemptScoreRow & { student_id?: string | null })[] = (attemptsRes.data ?? []).map(
    (r) => ({
      topic_node: r.topic_node,
      score_percent:
        r.score_percent === null || r.score_percent === undefined
          ? null
          : Number(r.score_percent),
      student_id: r.student_id,
    })
  );

  const loadError = attemptsRes.error?.message ?? null;

  return (
    <div className="w-full px-8 py-8">
      <header className="border-b border-stone-300 pb-6">
        <p className="text-[11px] font-medium uppercase tracking-widest text-stone-500">
          Faculty corner · Instruction
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-stone-900">
          Teacher dashboard
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">
          Central faculty workspace for performance insights, resource publishing, and mock exam
          operations.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <ClassAnalyticsOverview attemptRows={attemptRows} loadError={loadError} />
        </div>
        <div className="space-y-3 lg:col-span-4">
          <QuickLink href="/dashboard/teacher/resources" title="Resources" blurb="Publish Drive PDF/video materials." />
          <QuickLink href="/dashboard/teacher/performance" title="Performance" blurb="Monitor students, weak topics, and risks." />
          <QuickLink href="/dashboard/teacher/questions" title="Questions" blurb="Add pre-generated MCQs with validation." />
          <QuickLink href="/dashboard/teacher/mock-exams" title="Mock exams" blurb="Create and assign mock papers." />
        </div>
      </div>
    </div>
  );
}

function QuickLink({ href, title, blurb }: { href: string; title: string; blurb: string }) {
  return (
    <Link href={href} className="block rounded border border-stone-300 bg-white px-4 py-3 hover:bg-stone-50">
      <p className="text-sm font-semibold text-stone-900">{title}</p>
      <p className="mt-1 text-xs text-stone-600">{blurb}</p>
    </Link>
  );
}
