"use client";

import {
  createCourseOutline,
  updateCourseResource,
} from "@/app/actions/teacher-course-resource";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type TeacherCourseOption = {
  id: string;
  course_name: string;
  syllabus_code: string;
};

type TeacherResourceFormProps = {
  courses: TeacherCourseOption[];
};

export function TeacherResourceForm({ courses }: TeacherResourceFormProps) {
  const router = useRouter();
  const [courseId, setCourseId] = useState(courses[0]?.id ?? "");
  const [nodeLabel, setNodeLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [creating, setCreating] = useState(false);

  async function onCreateOutline(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setCreating(true);
    const result = await createCourseOutline({
      courseName: newName,
      syllabusCode: newCode,
    });
    if (!result.ok) {
      setError(result.message);
      setCreating(false);
      return;
    }
    setSuccess("Course outline created.");
    setNewName("");
    setNewCode("");
    setCreating(false);
    router.refresh();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const result = await updateCourseResource({
      courseId,
      syllabusNodeLabel: nodeLabel,
      resourceNotes: notes,
    });

    if (!result.ok) {
      setError(result.message);
      setLoading(false);
      return;
    }

    setSuccess("Course record updated.");
    setLoading(false);
    router.refresh();
  }

  return (
    <section className="rounded border border-stone-300 bg-stone-50/80 shadow-sm">
      <div className="border-b border-stone-300 bg-stone-100 px-4 py-2.5">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-700">
          Upload resource (mock)
        </h2>
        <p className="mt-0.5 text-[11px] leading-snug text-stone-600">
          Map a syllabus node and faculty notes to a course row in Supabase. No file
          storage in this prototype — text fields only.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-3 px-4 py-4">
        {error ? (
          <p className="border border-red-300 bg-red-50 px-2 py-1.5 text-xs text-red-900" role="alert">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="border border-emerald-300 bg-emerald-50 px-2 py-1.5 text-xs text-emerald-900">
            {success}
          </p>
        ) : null}

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wide text-stone-600">
            Course
          </label>
          <select
            required
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            disabled={courses.length === 0}
            className="mt-1 w-full border border-stone-300 bg-white px-2 py-1.5 text-sm text-stone-900 focus:border-stone-500 focus:outline-none disabled:bg-stone-100"
          >
            {courses.length === 0 ? (
              <option value="">No courses assigned</option>
            ) : (
              courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.course_name} ({c.syllabus_code})
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wide text-stone-600">
            Syllabus node / topic
          </label>
          <input
            type="text"
            required
            value={nodeLabel}
            onChange={(e) => setNodeLabel(e.target.value)}
            placeholder="e.g. Kinematics_1.1"
            className="mt-1 w-full border border-stone-300 bg-white px-2 py-1.5 font-mono text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium uppercase tracking-wide text-stone-600">
            Faculty notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={5}
            placeholder="Learning objectives, reading list, or in-class notes…"
            className="mt-1 w-full resize-y border border-stone-300 bg-white px-2 py-1.5 text-sm leading-relaxed text-stone-900 placeholder:text-stone-400 focus:border-stone-500 focus:outline-none"
          />
        </div>

        <div className="flex justify-end border-t border-stone-200 pt-2">
          <button
            type="submit"
            disabled={loading || courses.length === 0}
            className="border border-stone-800 bg-stone-900 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-stone-800 disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save to course"}
          </button>
        </div>
      </form>

      <form
        onSubmit={onCreateOutline}
        className="space-y-3 border-t border-stone-300 bg-stone-100/50 px-4 py-4"
      >
        <h3 className="text-[11px] font-semibold uppercase tracking-wide text-stone-600">
          New course outline
        </h3>
        <p className="text-[11px] text-stone-500">
          Inserts a row into <code className="font-mono">courses</code> for your account if you
          do not yet have a shell.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Course title"
            className="border border-stone-300 bg-white px-2 py-1.5 text-sm focus:border-stone-500 focus:outline-none"
          />
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Syllabus code (e.g. 9702)"
            className="border border-stone-300 bg-white px-2 py-1.5 font-mono text-sm focus:border-stone-500 focus:outline-none"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={creating}
            className="border border-stone-600 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-stone-900 hover:bg-stone-50 disabled:opacity-50"
          >
            {creating ? "Creating…" : "Create outline"}
          </button>
        </div>
      </form>
    </section>
  );
}
