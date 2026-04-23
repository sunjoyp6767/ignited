import type { Metadata } from "next";
import Link from "next/link";
import { ContactMessageForm } from "@/components/contact/contact-message-form";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact IgnitED Faculty Corner for admission and class schedule queries.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Contact</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Contact IgnitED Faculty Corner (Dhaka)
        </h1>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-stone-600 sm:text-base">
          Get information about Cambridge & Edexcel O & A Level coaching, admission, class
          schedules, and lab-supported learning.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/trial_class"
            className="rounded-md bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-stone-800"
          >
            Book a free trial class
          </Link>
          <Link
            href="/admission"
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-800 hover:bg-stone-50"
          >
            Admission
          </Link>
          <Link
            href="/courses"
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-800 hover:bg-stone-50"
          >
            Courses
          </Link>
          <Link
            href="/teachers"
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-800 hover:bg-stone-50"
          >
            Teachers
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-12">
        <article className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-5">
          <h2 className="text-2xl font-semibold text-stone-900">Contact details</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-stone-700">
            <li>
              <a href="mailto:ignited.edu.bd@gmail.com" className="hover:underline">
                ignited.edu.bd@gmail.com
              </a>
            </li>
            <li>
              <a href="mailto:info@ignitededu.com" className="hover:underline">
                info@ignitededu.com
              </a>
            </li>
            <li>IgnitED Faculty Corner, 10a Block#D, Dhaka 1207</li>
            <li>
              <a href="tel:+8801799767975" className="hover:underline">
                +8801799767975
              </a>
            </li>
            <li>
              <a href="tel:+8801518359648" className="hover:underline">
                +8801518359648
              </a>
            </li>
          </ul>
        </article>

        <article className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-7">
          <h2 className="text-2xl font-semibold text-stone-900">Send a message</h2>
          <p className="mt-2 text-sm text-stone-600">
            Ask about admissions, batch timings, subject availability, or a free trial class.
          </p>
          <ContactMessageForm />
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-stone-900">Our Location</h2>
        <p className="mt-2 text-sm text-stone-600">Visit our campus in Lalmatia, Dhaka.</p>
        <a
          href="https://maps.app.goo.gl/eUgYTHkvMamPJPZS8"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm font-semibold text-teal-800 hover:underline"
        >
          View on Google Maps →
        </a>
      </section>
    </div>
  );
}
