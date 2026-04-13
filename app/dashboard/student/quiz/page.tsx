import { StudentQuizView } from "@/components/student/student-quiz-view";
import type { Metadata } from "next";

const DEFAULT_TOPIC = "Kinematics_1.1";

export const metadata: Metadata = {
  title: "Topic quiz",
  description: "Syllabus-aligned MCQ practice with intelligent routing.",
};

type PageProps = {
  searchParams: Promise<{ topic?: string }>;
};

export default async function StudentQuizPage({ searchParams }: PageProps) {
  const { topic: topicParam } = await searchParams;
  const topicNode = topicParam?.trim() || DEFAULT_TOPIC;

  return <StudentQuizView topicNode={topicNode} />;
}
