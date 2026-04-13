import { ProgressOverview } from "@/components/student/progress-overview";
import { SyllabusPathGrid } from "@/components/student/syllabus-path-grid";
import {
  bestTopicByAverage,
  examReadinessPercent,
  needsWorkTopicByAverage,
} from "@/lib/student/dashboard-metrics";
import {
  averageScoreByTopic,
  overallAverageScore,
  quizzesCompletedCount,
  type AttemptRow,
  type TopicStat,
} from "@/lib/student/topic-stats";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student dashboard",
  description: "Learning hub, progress, and syllabus path.",
};

type EnrolledCourse = {
  courseId: string;
  courseName: string;
  syllabusCode: string;
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

async function fetchAttemptRows(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const withScore = await supabase
    .from("quiz_attempts")
    .select("topic_node, score")
    .eq("student_id", userId);

  if (!withScore.error) {
    return (withScore.data ?? []).map((attempt) => ({
      topic_node: attempt.topic_node as string | null,
      score_percent:
        attempt.score === null || attempt.score === undefined
          ? null
          : Number(attempt.score),
    })) as AttemptRow[];
  }

  const withScorePercent = await supabase
    .from("quiz_attempts")
    .select("topic_node, score_percent")
    .eq("student_id", userId);

  return (withScorePercent.data ?? []).map((attempt) => ({
    topic_node: attempt.topic_node as string | null,
    score_percent:
      attempt.score_percent === null || attempt.score_percent === undefined
        ? null
        : Number(attempt.score_percent),
  })) as AttemptRow[];
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
        const course = Array.isArray(e.courses) ? e.courses[0] : e.courses;
        if (!course) return null;
        return {
          courseId: e.course_id,
          courseName: course.course_name,
          syllabusCode: course.syllabus_code,
        };
      })
      .filter((x): x is EnrolledCourse => Boolean(x));
  }

  if (enrolledCourses.length === 0) {
    // Strategy 2: Plain enrollments, then courses lookup
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
    // Strategy 3: Infer from quiz_attempts topic nodes
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
    // Strategy 4: Derive directly from quiz_attempts + questions
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

export default async function StudentDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let attempts: AttemptRow[] = [];
  let syllabusCode: string | null = null;
  let enrolledCourses: EnrolledCourse[] = [];

  if (user) {
    attempts = await fetchAttemptRows(supabase, user.id);
    enrolledCourses = await resolveEnrolledCourses(supabase, user.id);

    if (enrolledCourses.length > 0) {
      syllabusCode = enrolledCourses[0]!.syllabusCode;
    }
  }

  const avg = overallAverageScore(attempts);
  const completed = quizzesCompletedCount(attempts);
  const byTopic = averageScoreByTopic(attempts);

  const best = bestTopicByAverage(attempts);
  const worst = needsWorkTopicByAverage(attempts);
  const readiness = examReadinessPercent(attempts, syllabusCode);

  const courseSections: {
    key: string;
    heading: string;
    cards: {
      code: string;
      title: string;
      topicNode: string;
      stat: TopicStat | null;
    }[];
  }[] = [];

  const { data: allQuestions } = await supabase
    .from("questions")
    .select("topic_node, syllabus_code");

  const questionRows = allQuestions ?? [];
  const allSyllabusCodes = [
    ...new Set(questionRows.map((q) => q.syllabus_code).filter(Boolean)),
  ];

  const { data: allCourseRows } = await supabase
    .from("courses")
    .select("id, course_name, syllabus_code");

  const displayCourses = allSyllabusCodes.map((code) => {
    const match = (allCourseRows ?? []).find((c) =>
      syllabusCodeMatches(c.syllabus_code, code)
    );
    return {
      courseId: match?.id ?? code,
      courseName: match?.course_name ?? code,
      syllabusCode: code,
    };
  });

  for (const course of displayCourses) {
    const nodes = questionRows.filter(
      (n) => n.syllabus_code && syllabusCodeMatches(n.syllabus_code, course.syllabusCode)
    );

    const uniqueNodes = [...new Set(nodes.map((n) => n.topic_node).filter(Boolean))];
    const courseAttempts = attempts.filter(
      (a) => a.topic_node && uniqueNodes.includes(a.topic_node)
    );
    const byTopicForCourse = averageScoreByTopic(courseAttempts);

    const cards = uniqueNodes.map((topicNode, idx) => {
      const parts = topicNode.split("_");
      const code = parts[parts.length - 1] || `${idx + 1}`;
      const title =
        parts.length > 1 ? parts.slice(0, -1).join(" ") : topicNode.replace(/_/g, " ");
      return {
        code,
        title,
        topicNode,
        stat: byTopicForCourse.get(topicNode) ?? byTopic.get(topicNode) ?? null,
      };
    });

    courseSections.push({
      key: course.courseId,
      heading: `${course.courseName} (${course.syllabusCode})`,
      cards,
    });
  }

  return (
    <div className="w-full">
      <header className="mb-8 border-b border-stone-200 pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">
          IgnitED · Student
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">Learning hub</h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-600">
          Your syllabus-aligned workspace: progress from the database, then guided paths through
          each enrolled course with one-click quizzes.
        </p>
      </header>

      <ProgressOverview
        averageScore={avg}
        quizzesCompleted={completed}
        bestTopic={best?.topicNode ?? null}
        needsWorkTopic={worst?.topicNode ?? null}
        examReadinessPercent={readiness}
      />

      {courseSections.length === 0 ? (
        <p className="mt-10 rounded-xl border border-stone-200 bg-white px-4 py-5 text-sm text-stone-600">
          No questions found in the database yet.
        </p>
      ) : (
        courseSections.map((section) => (
          <SyllabusPathGrid key={section.key} cards={section.cards} heading={section.heading} />
        ))
      )}
    </div>
  );
}

/*
  SUPABASE FIX — run this in the SQL editor if enrollments are missing:

  -- Step 1: Find sunjoy's user id
  SELECT id, email FROM auth.users WHERE email LIKE '%sunjoy%' LIMIT 5;

  -- Step 2: Find the course id for 9702
  SELECT id, course_name, syllabus_code FROM courses;

  -- Step 3: Insert the enrollment (replace the UUIDs with real values from above)
  INSERT INTO enrollments (student_id, course_id, status)
  VALUES (
    '<sunjoy-user-id-from-step-1>',
    '<course-id-for-9702-from-step-2>',
    'active'
  )
  ON CONFLICT DO NOTHING;
*/
