import { formatDateEnGB } from "@/lib/format-date";
import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Attempt history",
  description: "Your recent quiz attempts.",
};

export default async function StudentHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rows: { topic_node: string | null; score_percent: number | null; completed_at: string }[] =
    [];
  if (user) {
    const { data } = await supabase
      .from("quiz_attempts")
      .select("topic_node, score_percent, completed_at")
      .eq("student_id", user.id)
      .order("completed_at", { ascending: false });
    rows = data ?? [];
  }

  return (
    <div className="w-full px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">Attempt history</h1>
      <p className="mt-2 text-sm text-gray-600">Chronological list of saved quiz attempts.</p>

      <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Topic
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={3} className="border-t border-gray-100 px-4 py-8 text-center text-gray-500">
                  No attempts recorded yet.
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={`${i}-${r.completed_at}-${r.topic_node}`} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-gray-700">{formatDateEnGB(r.completed_at)}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-900">{r.topic_node ?? "—"}</td>
                  <td className="px-4 py-3 tabular-nums text-gray-900">
                    {r.score_percent === null ? "—" : `${r.score_percent}%`}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
