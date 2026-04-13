/**
 * Cambridge-style Physics syllabus nodes (display label + `topic_node` key used in DB / quiz URL).
 */
export type SyllabusTopicCard = {
  /** Short code shown on the card */
  code: string;
  /** Human-readable title */
  title: string;
  /** Matches `questions.topic_node` / `quiz_attempts.topic_node` */
  topicNode: string;
};

export const CAMBRIDGE_PHYSICS_9702_TOPICS: SyllabusTopicCard[] = [
  { code: "1.1", title: "Kinematics", topicNode: "Kinematics_1.1" },
  { code: "1.2", title: "Dynamics", topicNode: "Dynamics_1.2" },
  { code: "2.1", title: "Energy", topicNode: "Energy_2.1" },
  { code: "2.2", title: "Thermal physics", topicNode: "Thermal_2.2" },
  { code: "3.1", title: "Waves", topicNode: "Waves_3.1" },
  { code: "4.1", title: "Electric fields", topicNode: "ElectricFields_4.1" },
];
