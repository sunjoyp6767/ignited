import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resource",
  description: "View a free learning resource.",
};

type ResourcePageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default async function ResourcePage({ searchParams }: ResourcePageProps) {
  const { id } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-sm text-gray-500">Resource</p>
      <h1 className="mt-1 text-2xl font-semibold text-[#2c2c2a]">
        {id ? `Resource #${id}` : "Resource"}
      </h1>
      <p className="mt-4 text-gray-600">
        This placeholder page confirms the link target. Full resource viewer will load
        files and metadata here.
      </p>
      <Link href="/mathbridge" className="mt-8 inline-block text-sm font-semibold text-teal-800 hover:underline">
        ← Back to MathBridge
      </Link>
    </div>
  );
}
