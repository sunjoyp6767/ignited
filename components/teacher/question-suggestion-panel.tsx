import type { QuestionSuggestion } from "@/lib/teacher/question-suggestions";

type QuestionSuggestionPanelProps = {
  suggestions: QuestionSuggestion[];
};

export function QuestionSuggestionPanel({ suggestions }: QuestionSuggestionPanelProps) {
  return (
    <section className="mb-8 rounded-lg border border-gray-200 bg-white">
      <header className="border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          AI question suggestions
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Retrieval/ranking suggestions from weak-topic clusters (zero-cost deterministic logic).
        </p>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Topic</th>
              <th className="px-4 py-3">Syllabus</th>
              <th className="px-4 py-3">Difficulty</th>
              <th className="px-4 py-3">Question ID</th>
              <th className="px-4 py-3">Reason</th>
            </tr>
          </thead>
          <tbody>
            {suggestions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                  No suggestions yet. Add attempt data and quiz questions.
                </td>
              </tr>
            ) : (
              suggestions.map((item) => (
                <tr key={item.questionId} className="border-t border-gray-100">
                  <td className="px-4 py-3 font-mono text-xs text-gray-800">{item.topicNode}</td>
                  <td className="px-4 py-3">{item.syllabusCode}</td>
                  <td className="px-4 py-3">{item.difficultyLevel}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-700">{item.questionId.slice(0, 8)}...</td>
                  <td className="px-4 py-3 text-xs text-gray-600">{item.reason}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
