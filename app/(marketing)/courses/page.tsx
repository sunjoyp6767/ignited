import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Courses",
  description: "Courses offered at IgnitED Faculty Corner.",
};

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-[#2c2c2a]">Courses Offered</h1>
      <p className="mt-4 text-gray-600">
        See the home page for subject syllabi and instructors, or contact us for the latest
        batch schedule.
      </p>
    </div>
  );
}
