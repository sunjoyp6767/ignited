import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact IgnitED Faculty Corner in Lalmatia, Dhaka.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold text-[#2c2c2a]">Contact Us</h1>
      <p className="mt-4 text-gray-600">
        Visit our campus in Lalmatia, Dhaka, or reach out through the channels we will list
        here.
      </p>
      <a
        href="https://maps.app.goo.gl/eUgYTHkvMamPJPZS8"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-block text-sm font-semibold text-teal-800 hover:underline"
      >
        Open in Google Maps →
      </a>
    </div>
  );
}
