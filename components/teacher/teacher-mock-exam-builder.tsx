"use client";

import { createCourseOutline } from "@/app/actions/teacher-course-resource";
import { createMockExam } from "@/app/actions/mock-exams";
import type { CourseWithTopics } from "@/lib/teacher/mock-exam-topics";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

type Exam = {
  id: string;
  title: string;
  topic_node: string;
  duration_minutes: number;
  is_published: boolean;
};

type Props = {
  courses: CourseWithTopics[];
  exams: Exam[];
  totalQuestionsInBank: number;
};

export function TeacherMockExamBuilder({ courses, exams, totalQuestionsInBank }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isCreatingCourse, startCreateCourseTransition] = useTransition();
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [title, setTitle] = useState("");
  const [topicNode, setTopicNode] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [questionCount, setQuestionCount] = useState(10);
  const [newCourseName, setNewCourseName] = useState("");
  const [newSyllabusCode, setNewSyllabusCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!courses.length) return;
    setSelectedKey((prev) => {
      if (prev && courses.some((c) => c.rowKey === prev)) return prev;
      const firstReady = courses.find((c) => c.id);
      return firstReady?.rowKey ?? courses[0].rowKey;
    });
  }, [courses]);

  const selectedCourse = useMemo(
    () => courses.find((c) => c.rowKey === selectedKey),
    [courses, selectedKey]
  );

  const topics = selectedCourse?.topics ?? [];
  const maxForTopic = useMemo(() => {
    const t = topics.find((x) => x.topic_node === topicNode);
    return t?.question_count ?? 0;
  }, [topics, topicNode]);

  useEffect(() => {
    if (topics.length === 0) {
      setTopicNode("");
      return;
    }
    setTopicNode((prev) =>
      prev && topics.some((t) => t.topic_node === prev) ? prev : topics[0].topic_node
    );
  }, [topics]);

  useEffect(() => {
    if (maxForTopic > 0) {
      setQuestionCount((q) => Math.min(q, maxForTopic));
    }
  }, [maxForTopic]);

  useEffect(() => {
    if (!selectedCourse?.needsCourse || !selectedCourse.syllabus_code) return;
    const code = selectedCourse.syllabus_code.trim().toUpperCase();
    setNewSyllabusCode(code);
    setNewCourseName(`Course ${code}`);
  }, [selectedCourse?.rowKey, selectedCourse?.needsCourse, selectedCourse?.syllabus_code]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!selectedCourse) {
      setError("Select a syllabus.");
      return;
    }
    const courseId = selectedCourse.id;
    if (selectedCourse.needsCourse || !courseId) {
      setError("Create a course for this syllabus first (see below), then publish.");
      return;
    }
    if (!topics.length || !topicNode.trim()) {
      setError("Choose a topic that has mock questions.");
      return;
    }
    if (!title.trim()) {
      setError("Enter a mock exam title.");
      return;
    }
    if (maxForTopic < 1) {
      setError("No questions for this topic.");
      return;
    }

    startTransition(async () => {
      const result = await createMockExam({
        courseId,
        title,
        topicNode: topicNode.trim(),
        durationMinutes,
        questionCount: Math.min(questionCount, maxForTopic),
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccess("Mock exam published.");
      setTitle("");
      router.refresh();
    });
  }

  function onCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startCreateCourseTransition(async () => {
      const result = await createCourseOutline({
        courseName: newCourseName,
        syllabusCode: newSyllabusCode,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccess("Course created. You can publish mock exams for this syllabus.");
      router.refresh();
    });
  }

  function onCreateCourseForSelection(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCourse?.needsCourse) return;
    setError(null);
    setSuccess(null);
    const name = newCourseName.trim();
    const code = selectedCourse.syllabus_code.trim().toUpperCase();
    if (!name) {
      setError("Enter a course title.");
      return;
    }
    startCreateCourseTransition(async () => {
      const result = await createCourseOutline({
        courseName: name,
        syllabusCode: code,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccess("Course created. You can publish mock exams for this syllabus.");
      router.refresh();
    });
  }

  if (courses.length === 0 && totalQuestionsInBank === 0) {
    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-semibold">No mock questions yet</p>
        <p className="mt-2 text-amber-900">
          Add MCQs in{" "}
          <Link href="/dashboard/teacher/questions" className="font-medium underline">
            Questions
          </Link>{" "}
          with pool <span className="font-mono">mock</span> or <span className="font-mono">both</span>.
          Then create a course whose <span className="font-mono">syllabus_code</span> matches those
          questions. You can also run <code className="font-mono text-xs">init_schema.sql</code> for
          sample data.
        </p>
        <form onSubmit={onCreateCourse} className="mt-4 grid gap-3 md:grid-cols-[1fr_180px_auto]">
          <input
            required
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            placeholder="Course title"
            className="w-full rounded border border-amber-300 bg-white px-3 py-2 text-sm text-gray-900"
          />
          <input
            required
            value={newSyllabusCode}
            onChange={(e) => setNewSyllabusCode(e.target.value)}
            placeholder="Syllabus code (e.g. 9702)"
            className="w-full rounded border border-amber-300 bg-white px-3 py-2 text-sm text-gray-900"
          />
          <button
            type="submit"
            disabled={isCreatingCourse}
            className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {isCreatingCourse ? "Creating..." : "Create course"}
          </button>
        </form>
        {error ? (
          <p className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-3 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
            {success}
          </p>
        ) : null}
      </section>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">Create mock exam</h2>
        <p className="mt-1 text-sm text-gray-600">
          {totalQuestionsInBank} mock-pool question row(s) in the database. Pick the syllabus (and
          course if you have one); topics list only that syllabus&apos;s mock questions.
        </p>

        {error ? (
          <p className="mt-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="mt-4 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
            {success}
          </p>
        ) : null}

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <label className="block space-y-1 text-sm text-gray-700">
            <span>Syllabus / course</span>
            <select
              required
              value={selectedKey}
              onChange={(e) => {
                setSelectedKey(e.target.value);
                setTopicNode("");
              }}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {courses.map((course) => (
                <option key={course.rowKey} value={course.rowKey}>
                  {course.needsCourse
                    ? `${course.syllabus_code} — create course (${course.topics.length} topic(s) in bank)`
                    : `${course.course_name} (${course.syllabus_code})`}
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1 text-sm text-gray-700">
            <span>Mock exam title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Kinematics mock paper 1"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              disabled={Boolean(selectedCourse?.needsCourse)}
              required={
                Boolean(
                  selectedCourse && !selectedCourse.needsCourse && topics.length > 0
                )
              }
              title={
                selectedCourse?.needsCourse
                  ? "Create the course below first, then set the mock title"
                  : undefined
              }
            />
          </label>
        </div>

        {selectedCourse?.needsCourse ? (
          <form
            onSubmit={onCreateCourseForSelection}
            className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"
          >
            <p className="font-medium">Course required for this syllabus</p>
            <p className="mt-1 text-amber-900">
              Mock exams attach to a <span className="font-mono">courses</span> row on your account.
              You already have mock questions for{" "}
              <span className="font-mono">{selectedCourse.syllabus_code}</span> — create the course
              here, then publish the mock exam.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                required
                name="courseTitle"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="Course title"
                className="min-w-[200px] flex-1 rounded border border-amber-300 bg-white px-3 py-2 text-sm"
              />
              <input
                readOnly
                name="syllabusCode"
                value={newSyllabusCode}
                className="w-28 rounded border border-amber-300 bg-stone-100 px-3 py-2 font-mono text-sm"
                title="Syllabus code (from question bank)"
              />
              <button
                type="submit"
                disabled={isCreatingCourse}
                className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              >
                {isCreatingCourse ? "Creating..." : "Create course"}
              </button>
            </div>
          </form>
        ) : null}

        {selectedCourse && !selectedCourse.needsCourse && topics.length === 0 ? (
          <p className="mt-4 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            No mock questions for syllabus{" "}
            <span className="font-mono">{selectedCourse.syllabus_code}</span>.{" "}
            <Link href="/dashboard/teacher/questions" className="font-medium underline">
              Add questions
            </Link>
            .
          </p>
        ) : null}

        {selectedCourse && !selectedCourse.needsCourse && topics.length > 0 ? (
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block space-y-1 text-sm text-gray-700">
                <span>Topic (from question bank)</span>
                <select
                  required
                  value={topicNode}
                  onChange={(e) => setTopicNode(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                >
                  {topics.map((t) => (
                    <option key={t.topic_node} value={t.topic_node}>
                      {t.topic_node} ({t.question_count} MCQs)
                    </option>
                  ))}
                </select>
              </label>
              <label className="block space-y-1 text-sm text-gray-700">
                <span>Duration (minutes)</span>
                <input
                  type="number"
                  min={10}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="block space-y-1 text-sm text-gray-700">
                <span>Questions to include (max {maxForTopic})</span>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, maxForTopic)}
                  value={Math.min(questionCount, maxForTopic)}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Link
                href="/dashboard/teacher/questions"
                className="text-sm text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline"
              >
                Add or edit MCQs
              </Link>
              <button
                type="submit"
                disabled={isPending || !selectedCourse?.id || topics.length === 0}
                className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? "Publishing..." : "Publish mock exam"}
              </button>
            </div>
          </form>
        ) : null}
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <header className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Published mock exams</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {exams.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No mock exams yet. Publish one above after a course exists for that syllabus.
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.id} className="border-t border-gray-100">
                    <td className="px-4 py-3">{exam.title}</td>
                    <td className="px-4 py-3 font-mono text-xs">{exam.topic_node}</td>
                    <td className="px-4 py-3">{exam.duration_minutes} min</td>
                    <td className="px-4 py-3">{exam.is_published ? "Published" : "Draft"}</td>
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
