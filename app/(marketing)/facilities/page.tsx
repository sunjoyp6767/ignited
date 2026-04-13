import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facilities",
  description: "Lab and classroom facilities at IgnitED Faculty Corner.",
};

export default function FacilitiesPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-[#2c2c2a]">Facilities</h1>
      <p className="mt-4 text-gray-600">
        Photos and descriptions of our science labs and classrooms will appear here.
      </p>
    </div>
  );
}
