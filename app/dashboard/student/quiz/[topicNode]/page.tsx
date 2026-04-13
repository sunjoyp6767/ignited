import { StudentQuizView } from "@/components/student/student-quiz-view";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Topic quiz",
  description: "Syllabus-aligned MCQ practice with intelligent routing.",
};

type PageProps = {
  params: Promise<{ topicNode: string }>;
};

export default async function StudentQuizByTopicPage({ params }: PageProps) {
  const { topicNode: raw } = await params;
  const topicNode = decodeURIComponent(raw);

  return <StudentQuizView topicNode={topicNode} />;
}
