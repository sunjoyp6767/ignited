import { formatDateEnGB } from "@/lib/format-date";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study plan",
  description: "Personalised schedule from quiz performance.",
};

type StudyPlanStatus = "needs_work" | "not_started" | "in_progress" | "mastered";

type PlanItem = {
  topicNode: string;
  displayName: string;
  syllabusCode: string;
  subjectName: string;
  status: StudyPlanStatus;
  scheduledDate: Date;
  originalScheduledDate: Date;
  carriedForward: boolean;
  missedCount: number;
  isMissed: boolean;
  avgScore: number | null;
};

type EnrolledCourse = {
  syllabusCode: string;
  courseName: string;
  courseId: string;
};

type SyllabusNode = {
  topicNode: string;
  syllabusCode: string;
  displayOrder: number;
};

type EnrollmentJoinRow = {
  course_id: string;
  courses:
    | { id: string; course_name: string; syllabus_code: string }
    | { id: string; course_name: string; syllabus_code: string }[]
    | null;
};

function normalizeSyllabusCode(value: string): string {
  return value.trim().toUpperCase();
}

function syllabusCodeMatches(questionCode: string, courseCode: string): boolean {
  const q = normalizeSyllabusCode(questionCode);
  const c = normalizeSyllabusCode(courseCode);
  return q === c || q.includes(c) || c.includes(q);
}

function statusBadgeClasses(status: StudyPlanStatus): string {
  switch (status) {
    case "needs_work":
      return "border-red-300 bg-red-50 text-red-800";
    case "not_started":
      return "border-amber-300 bg-amber-50 text-amber-800";
    case "in_progress":
      return "border-blue-300 bg-blue-50 text-blue-800";
    case "mastered":
      return "border-green-300 bg-green-50 text-green-800";
    default:
      return "border-gray-200 bg-gray-50 text-gray-800";
  }
}

function statusLabel(status: StudyPlanStatus): string {
  switch (status) {
    case "needs_work":
      return "Needs work";
    case "not_started":
      return "Not started";
    case "in_progress":
      return "In progress";
    case "mastered":
      return "Mastered";
    default:
      return status;
  }
}

function dotClass(status: StudyPlanStatus): string {
  switch (status) {
    case "needs_work":
      return "bg-red-500";
    case "not_started":
      return "bg-amber-500";
    case "in_progress":
      return "bg-blue-500";
    case "mastered":
      return "bg-green-500";
    default:
      return "bg-gray-400";
  }
}

function daysUntilExam(): number {
  const exam = new Date("2026-06-15T12:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);
  const ms = exam.getTime() - today.getTime();
  return Math.max(0, Math.ceil(ms / 86400000));
}

function formatTimelineDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function estCompletionDate(plan: PlanItem[]): Date | null {
  if (plan.length === 0) return null;
  return plan[plan.length - 1]?.scheduledDate ?? null;
}

function nextWeekday(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + 1);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

function addBusinessDays(date: Date, delta: number): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const step = delta >= 0 ? 1 : -1;
  let remaining = Math.abs(delta);
  while (remaining > 0) {
    d.setDate(d.getDate() + step);
    if (d.getDay() !== 0 && d.getDay() !== 6) remaining -= 1;
  }
  return d;
}

function businessDaysBetween(start: Date, end: Date): number {
  const s = new Date(start);
  const e = new Date(end);
  s.setHours(12, 0, 0, 0);
  e.setHours(12, 0, 0, 0);
  if (s > e) return 0;
  let count = 0;
  const d = new Date(s);
  while (d < e) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) count += 1;
  }
  return count;
}

type AttemptMetric = {
  avgScore: number | null;
  lastAttemptAt: Date | null;
};

function generateStudyPlan(
  enrolledCourses: EnrolledCourse[],
  allNodes: SyllabusNode[],
  attemptMetrics: Record<string, AttemptMetric>
): PlanItem[] {
  if (enrolledCourses.length === 0) return [];

  const priority: Record<StudyPlanStatus, number> = {
    needs_work: 0,
    not_started: 1,
    in_progress: 2,
    mastered: 3,
  };

  const bucketsByCourse: PlanItem[][] = enrolledCourses.map((course) => {
    const courseNodes = allNodes
      .filter((n) => n.syllabusCode === course.syllabusCode)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return courseNodes
      .map((node) => {
        const metrics = attemptMetrics[node.topicNode];
        const avg = metrics?.avgScore ?? null;
        let status: StudyPlanStatus = "not_started";
        if (avg !== null) {
          if (avg < 50) status = "needs_work";
          else if (avg < 80) status = "in_progress";
          else status = "mastered";
        }
        return {
          topicNode: node.topicNode,
          displayName: node.topicNode.replace(/_/g, " "),
          syllabusCode: course.syllabusCode,
          subjectName: course.courseName,
          status,
          scheduledDate: new Date(),
          originalScheduledDate: new Date(),
          carriedForward: false,
          missedCount: 0,
          isMissed: false,
          avgScore: avg,
        };
      })
      .sort((a, b) => priority[a.status] - priority[b.status]);
  });

  const interleaved: PlanItem[] = [];
  const maxLen = Math.max(...bucketsByCourse.map((b) => b.length), 0);
  for (let i = 0; i < maxLen; i += 1) {
    for (const bucket of bucketsByCourse) {
      if (bucket[i]) interleaved.push(bucket[i]);
    }
  }

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const backfill = Math.max(0, interleaved.length - 1);
  let currentDate = addBusinessDays(today, -backfill);
  interleaved.forEach((item, idx) => {
    if (idx === 0) {
      item.scheduledDate = new Date(currentDate);
      item.originalScheduledDate = new Date(currentDate);
    } else {
      currentDate = nextWeekday(currentDate);
      item.scheduledDate = new Date(currentDate);
      item.originalScheduledDate = new Date(currentDate);
    }
  });

  const overdueQueue: PlanItem[] = [];
  for (const item of interleaved) {
    const metrics = attemptMetrics[item.topicNode];
    const lastAttempt = metrics?.lastAttemptAt ?? null;
    const hasAttemptAfterScheduled =
      lastAttempt !== null &&
      lastAttempt.getTime() >= new Date(item.originalScheduledDate).setHours(23, 59, 59, 999);

    const overdue =
      item.status !== "mastered" &&
      item.originalScheduledDate < today &&
      !hasAttemptAfterScheduled;

    if (!overdue) continue;
    item.isMissed = true;
    item.missedCount = Math.max(1, Math.ceil(businessDaysBetween(item.originalScheduledDate, today) / 2));
    overdueQueue.push(item);
  }

  overdueQueue.sort((a, b) => b.missedCount - a.missedCount || priority[a.status] - priority[b.status]);

  let carryDate = nextWeekday(today);
  for (const item of overdueQueue) {
    item.scheduledDate = new Date(carryDate);
    item.carriedForward = true;
    carryDate = nextWeekday(carryDate);
  }

  interleaved.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  return interleaved;
}

async function resolveEnrolledCourses(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<EnrolledCourse[]> {
  let enrolledCourses: EnrolledCourse[] = [];

  // Strategy 1: Standard join query
  const { data: enrollmentRows } = await supabase
    .from("enrollments")
    .select("course_id, courses(id, course_name, syllabus_code)")
    .eq("student_id", userId);

  if (enrollmentRows && enrollmentRows.length > 0) {
    enrolledCourses = (enrollmentRows as EnrollmentJoinRow[])
      .map((e) => {
        const c = Array.isArray(e.courses) ? e.courses[0] : e.courses;
        if (!c) return null;
        return {
          courseId: e.course_id,
          courseName: c.course_name,
          syllabusCode: c.syllabus_code,
        };
      })
      .filter((x): x is EnrolledCourse => Boolean(x));
  }

  if (enrolledCourses.length === 0) {
    // Strategy 2: plain enrollments, then courses lookup
    const { data: plainEnrollments } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("student_id", userId);

    if (plainEnrollments && plainEnrollments.length > 0) {
      const courseIds = plainEnrollments.map((e) => e.course_id);
      const { data: courseRows } = await supabase
        .from("courses")
        .select("id, course_name, syllabus_code")
        .in("id", courseIds);
      enrolledCourses = (courseRows ?? []).map((c) => ({
        courseId: c.id,
        courseName: c.course_name,
        syllabusCode: c.syllabus_code,
      }));
    }
  }

  if (enrolledCourses.length === 0) {
    // Strategy 3: infer from attempted topic nodes
    const { data: attemptedNodes } = await supabase
      .from("quiz_attempts")
      .select("topic_node")
      .eq("student_id", userId);

    if (attemptedNodes && attemptedNodes.length > 0) {
      const nodes = [...new Set(attemptedNodes.map((a) => a.topic_node).filter(Boolean))];
      const { data: matchingQuestions } = await supabase
        .from("questions")
        .select("syllabus_code, topic_node")
        .in("topic_node", nodes);
      const inferredCodes = [
        ...new Set((matchingQuestions ?? []).map((q) => q.syllabus_code).filter(Boolean)),
      ];

      const { data: matchingCourses } = await supabase
        .from("courses")
        .select("id, course_name, syllabus_code")
        .in("syllabus_code", inferredCodes);
      enrolledCourses = (matchingCourses ?? []).map((c) => ({
        courseId: c.id,
        courseName: c.course_name,
        syllabusCode: c.syllabus_code,
      }));
    }
  }

  if (enrolledCourses.length === 0) {
    // Strategy 4: derive from attempts + questions only
    const { data: allAttempts } = await supabase
      .from("quiz_attempts")
      .select("topic_node")
      .eq("student_id", userId);
    const attemptedTopics = [...new Set((allAttempts ?? []).map((a) => a.topic_node).filter(Boolean))];

    if (attemptedTopics.length > 0) {
      const { data: questionCodes } = await supabase
        .from("questions")
        .select("syllabus_code")
        .in("topic_node", attemptedTopics);
      const codes = [...new Set((questionCodes ?? []).map((q) => q.syllabus_code).filter(Boolean))];

      enrolledCourses = codes.map((code) => ({
        courseId: code,
        courseName: code,
        syllabusCode: code,
      }));

      const { data: namedCourses } = await supabase
        .from("courses")
        .select("id, course_name, syllabus_code")
        .in("syllabus_code", codes);

      if (namedCourses && namedCourses.length > 0) {
        enrolledCourses = namedCourses.map((c) => ({
          courseId: c.id,
          courseName: c.course_name,
          syllabusCode: c.syllabus_code,
        }));
      }
    }
  }

  return enrolledCourses;
}

export default async function StudentStudyPlanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let enrolledCourses: EnrolledCourse[] = [];
  let allNodes: SyllabusNode[] = [];
  const attemptMetrics: Record<string, AttemptMetric> = {};

  if (user) {
    enrolledCourses = await resolveEnrolledCourses(supabase, user.id);

    for (const course of enrolledCourses) {
      let { data: questionRows } = await supabase
        .from("questions")
        .select("topic_node, syllabus_code")
        .eq("syllabus_code", course.syllabusCode);

      if (!questionRows || questionRows.length === 0) {
        const { data: allQuestions } = await supabase
          .from("questions")
          .select("topic_node, syllabus_code");
        questionRows = (allQuestions ?? []).filter(
          (q) => q.syllabus_code && syllabusCodeMatches(q.syllabus_code, course.syllabusCode)
        );
      }

      const uniqueTopics = [...new Set((questionRows ?? []).map((q) => q.topic_node).filter(Boolean))];
      const orderedTopics = uniqueTopics.sort().map((topic, idx) => ({
        topicNode: topic,
        syllabusCode: course.syllabusCode,
        displayOrder: idx,
      }));

      for (const node of orderedTopics) {
        allNodes.push({
          topicNode: node.topicNode,
          syllabusCode: node.syllabusCode,
          displayOrder: node.displayOrder,
        });
      }
    }

    const attemptsWithScore = await supabase
      .from("quiz_attempts")
      .select("topic_node, score, completed_at")
      .eq("student_id", user.id);

    const attemptsFallback =
      attemptsWithScore.error !== null
        ? await supabase
            .from("quiz_attempts")
            .select("topic_node, score_percent, completed_at")
            .eq("student_id", user.id)
        : null;

    const rows =
      attemptsWithScore.error === null
        ? (attemptsWithScore.data ?? []).map((a) => ({
            topic_node: a.topic_node as string | null,
            score: a.score as number | null,
            completed_at: a.completed_at as string | null,
          }))
        : (attemptsFallback?.data ?? []).map((a) => ({
            topic_node: a.topic_node as string | null,
            score: a.score_percent as number | null,
            completed_at: a.completed_at as string | null,
          }));

    const attemptMap: Record<string, { scores: number[]; lastAttemptAt: Date | null }> = {};
    for (const attempt of rows) {
      if (!attempt.topic_node) continue;
      if (!attemptMap[attempt.topic_node]) {
        attemptMap[attempt.topic_node] = { scores: [], lastAttemptAt: null };
      }
      if (attempt.score !== null && attempt.score !== undefined) {
        attemptMap[attempt.topic_node]!.scores.push(Number(attempt.score));
      }
      if (attempt.completed_at) {
        const d = new Date(attempt.completed_at);
        if (!Number.isNaN(d.getTime())) {
          const existing = attemptMap[attempt.topic_node]!.lastAttemptAt;
          if (!existing || d > existing) {
            attemptMap[attempt.topic_node]!.lastAttemptAt = d;
          }
        }
      }
    }

    for (const [topic, data] of Object.entries(attemptMap)) {
      const avgScore =
        data.scores.length === 0 ? null : data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
      attemptMetrics[topic] = {
        avgScore,
        lastAttemptAt: data.lastAttemptAt,
      };
    }
  }

  const plan = generateStudyPlan(enrolledCourses, allNodes, attemptMetrics);
  const topicsRemaining = plan.filter(
    (p) => p.status === "needs_work" || p.status === "not_started"
  ).length;
  const lastDate = estCompletionDate(plan);
  const subjectRemaining = new Map<string, number>();
  for (const item of plan) {
    if (item.status === "needs_work" || item.status === "not_started") {
      subjectRemaining.set(item.subjectName, (subjectRemaining.get(item.subjectName) ?? 0) + 1);
    }
  }

  return (
    <div className="w-full px-8 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Study plan</h1>
        <p className="mt-2 text-sm text-gray-600">
          Generated from your quiz performance. Weakest topics scheduled first.
        </p>
      </header>

      <section className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400">Topics remaining</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{topicsRemaining}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400">Est. completion date</p>
          <p className="mt-1 text-lg font-bold text-gray-900">
            {lastDate ? formatDateEnGB(lastDate) : "—"}
          </p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-400">Days until exam</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{daysUntilExam()}</p>
          <p className="mt-1 text-xs text-gray-500">Cambridge May/June session</p>
        </div>
      </section>

      {enrolledCourses.length >= 2 ? (
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(subjectRemaining.entries()).map(([subjectName, left]) => (
            <div key={subjectName} className="rounded-lg border border-gray-200 bg-white p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-gray-400">{subjectName}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{left} topics left</p>
            </div>
          ))}
        </section>
      ) : null}

      <div className="border-l-2 border-gray-200 pl-6">
        <ul className="space-y-8">
          {plan.map((item) => (
            <li key={`${item.syllabusCode}-${item.topicNode}-${item.scheduledDate.toISOString()}`} className="relative">
              <span
                className={`absolute -left-[calc(0.5rem+5px)] top-1 size-2 rounded-full ${dotClass(item.status)}`}
                aria-hidden
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:gap-6">
                <div className="w-20 shrink-0 text-sm font-medium text-gray-500">
                  {formatTimelineDate(item.scheduledDate)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold text-gray-900">{item.displayName}</h2>
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      {item.subjectName}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusBadgeClasses(item.status)}`}
                    >
                      {statusLabel(item.status)}
                    </span>
                    {item.isMissed ? (
                      <span className="rounded-full border border-red-300 bg-red-50 px-2 py-0.5 text-xs font-medium text-red-800">
                        Missed
                      </span>
                    ) : null}
                  </div>
                  {item.carriedForward ? (
                    <p className="mt-1 text-xs text-red-600">
                      Missed {item.missedCount} time{item.missedCount > 1 ? "s" : ""}. Auto-rescheduled from{" "}
                      {formatTimelineDate(item.originalScheduledDate)}.
                    </p>
                  ) : null}
                  {item.avgScore !== null ? (
                    <p className="mt-1 text-xs text-gray-500">Avg score: {item.avgScore}%</p>
                  ) : (
                    <p className="mt-1 text-xs text-gray-500">No attempts yet</p>
                  )}
                  <div className="mt-2">
                    <Link
                      href={`/dashboard/student/quiz/${encodeURIComponent(item.topicNode)}`}
                      className="text-sm font-semibold text-teal-800 hover:underline"
                    >
                      {item.status === "mastered" ? "Review →" : "Take quiz →"}
                    </Link>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
