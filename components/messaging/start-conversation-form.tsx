"use client";

import { ensureConversation } from "@/app/actions/messages";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function StartConversationForm({ students }: { students: { id: string; name: string }[] }) {
  const router = useRouter();
  const [studentId, setStudentId] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen(e: React.FormEvent) {
    e.preventDefault();
    if (!studentId) {
      setError("Select a student.");
      return;
    }
    setPending(true);
    setError(null);
    const r = await ensureConversation(studentId);
    setPending(false);
    if (!r.ok) {
      setError(r.message);
      return;
    }
    router.push(`/dashboard/teacher/messages/${r.conversationId}`);
  }

  return (
    <form onSubmit={handleOpen} className="max-w-md space-y-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <label className="block text-sm font-medium text-gray-800">
        Student
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">{students.length === 0 ? "No students in the system" : "Select a student"}</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={pending || !studentId}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {pending ? "Opening…" : "Open conversation"}
      </button>
    </form>
  );
}
