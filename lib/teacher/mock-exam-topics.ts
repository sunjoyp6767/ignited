/**
 * Groups question bank rows by syllabus topic for mock exam UI.
 */

export type TopicGroup = { topic_node: string; question_count: number };

export type CourseWithTopics = {
  /** Stable key for the course dropdown (real course id, or `missing:{syllabus_code}`). */
  rowKey: string;
  /** Null when this teacher has no `courses` row for this syllabus yet (create course to publish mocks). */
  id: string | null;
  course_name: string;
  syllabus_code: string;
  topics: TopicGroup[];
  needsCourse: boolean;
};

export function groupQuestionsBySyllabus(
  rows: { syllabus_code: string; topic_node: string }[]
): Map<string, Map<string, number>> {
  const bySyllabus = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const code = row.syllabus_code.trim();
    const node = row.topic_node.trim();
    if (!code || !node) continue;
    let topics = bySyllabus.get(code);
    if (!topics) {
      topics = new Map();
      bySyllabus.set(code, topics);
    }
    topics.set(node, (topics.get(node) ?? 0) + 1);
  }
  return bySyllabus;
}

export function topicsForSyllabus(
  bySyllabus: Map<string, Map<string, number>>,
  syllabusCode: string
): TopicGroup[] {
  const topics = bySyllabus.get(syllabusCode.trim());
  if (!topics) return [];
  return [...topics.entries()]
    .map(([topic_node, question_count]) => ({ topic_node, question_count }))
    .sort((a, b) => a.topic_node.localeCompare(b.topic_node));
}
