import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MathBridge",
  description: "Free math resources and MathBridge content.",
};

export default function MathBridgePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-[#2c2c2a]">MathBridge</h1>
      <p className="mt-4 text-gray-600">
        Browse past papers, concept videos, and practice sets. Full catalog coming soon.
      </p>
    </div>
  );
}
