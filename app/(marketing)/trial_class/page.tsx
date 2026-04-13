import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trial Class",
  description: "Book a free trial class at IgnitED Faculty Corner.",
};

export default function TrialClassPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-[#2c2c2a]">Book a Trial Class</h1>
      <p className="mt-4 text-gray-600">
        Trial class scheduling will appear here.         For now, please use{" "}
        <Link href="/contact" className="font-medium text-teal-800 underline">
          Contact
        </Link>
        .
      </p>
    </div>
  );
}
