import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description: "News and articles from IgnitED Faculty Corner.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-[#2c2c2a]">Blog</h1>
      <p className="mt-4 text-gray-600">Articles and exam tips will be published here.</p>
    </div>
  );
}
