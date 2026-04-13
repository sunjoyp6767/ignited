import { CAMBRIDGE_PHYSICS_9702_TOPICS } from "@/lib/student/syllabus-topics";

/**
 * Topic keys used as the syllabus denominator for exam readiness and related metrics.
 * Currently aligned with the student hub (Cambridge Physics 9702 path).
 */
export function topicNodesForExamReadiness(syllabusCode: string | null): readonly string[] {
  const code = syllabusCode?.trim().toUpperCase() ?? "9702";
  if (code === "9702" || code === "") {
    return CAMBRIDGE_PHYSICS_9702_TOPICS.map((t) => t.topicNode);
  }
  return CAMBRIDGE_PHYSICS_9702_TOPICS.map((t) => t.topicNode);
}
