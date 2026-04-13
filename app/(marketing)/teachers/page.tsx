import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teachers",
  description: "Faculty profiles at IgnitED Faculty Corner.",
};

export default function TeachersPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-[#2c2c2a]">Faculty Profiles</h1>
      <p className="mt-4 text-gray-600">Detailed faculty bios will be listed here.</p>
    </div>
  );
}
