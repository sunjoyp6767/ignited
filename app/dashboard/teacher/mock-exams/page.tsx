import { TeacherMockExamBuilder } from "@/components/teacher/teacher-mock-exam-builder";
import {
  groupQuestionsBySyllabus,
  topicsForSyllabus,
  type CourseWithTopics,
} from "@/lib/teacher/mock-exam-topics";
import { requireDashboardRole } from "@/lib/dashboard/require-role";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher mock exams",
  description: "Create and publish mock exams from the question bank.",
};

export default async function TeacherMockExamsPage() {
  await requireDashboardRole("teacher");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const teacherId = user?.id ?? "";

  const [coursesRes, examsRes, mockQuestionsRes] = await Promise.all([
    supabase
      .from("courses")
      .select("id, course_name, syllabus_code")
      .eq("teacher_id", teacherId)
      .order("course_name"),
    supabase
      .from("mock_exams")
      .select("id, title, topic_node, duration_minutes, is_published")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false }),
    supabase
      .from("questions")
      .select("syllabus_code, topic_node")
      .in("question_pool", ["mock", "both"]),
  ]);

  const teacherCourses = coursesRes.data ?? [];
  const courseBySyllabus = new Map(
    teacherCourses.map((c) => [c.syllabus_code.trim().toUpperCase(), c])
  );

  const questionRows = mockQuestionsRes.data ?? [];
  const bySyllabus = groupQuestionsBySyllabus(questionRows);
  const distinctCodes = [...bySyllabus.keys()].sort((a, b) => a.localeCompare(b));

  const coursesWithTopics: CourseWithTopics[] = distinctCodes.map((code) => {
    const upper = code.trim().toUpperCase();
    const match = courseBySyllabus.get(upper);
    const topics = topicsForSyllabus(bySyllabus, code);
    const needsCourse = !match;
    return {
      rowKey: match?.id ?? `missing:${upper}`,
      id: match?.id ?? null,
      course_name: match?.course_name ?? `Add course for syllabus ${upper}`,
      syllabus_code: code.trim(),
      topics,
      needsCourse,
    };
  });

  const totalQuestionsInBank = questionRows.length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Mock exam builder</h1>
        <p className="mt-2 text-sm text-gray-600">
          Mock exams use the <span className="font-mono">mock</span> / <span className="font-mono">both</span>{" "}
          question pool. The course list shows every syllabus that has mock questions; if you have not
          created a <span className="font-mono">courses</span> row for that syllabus yet, create it below
          (publish only works when a course exists for your account).
        </p>
      </header>
      <TeacherMockExamBuilder
        courses={coursesWithTopics}
        exams={examsRes.data ?? []}
        totalQuestionsInBank={totalQuestionsInBank}
      />
    </div>
  );
}
