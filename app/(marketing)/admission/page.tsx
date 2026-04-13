import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admission",
  description: "Admission information for IgnitED Faculty Corner.",
};

export default function AdmissionPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-[#2c2c2a]">Admission</h1>
      <p className="mt-4 text-gray-600">Admission details and forms will be published here.</p>
    </div>
  );
}
