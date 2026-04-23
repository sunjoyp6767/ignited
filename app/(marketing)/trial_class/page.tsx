import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Trial Class",
  description: "Book a free trial class at IgnitED Faculty Corner, Lalmatia.",
};

export default function TrialClassPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Trial Class</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Book a Free Trial Class
        </h1>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-stone-600 sm:text-base">
          Experience IgnitED teaching before enrollment. Join a guided session, meet faculty, and
          evaluate the learning style for Cambridge and Edexcel pathways.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/contact"
            className="rounded-md bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-stone-800"
          >
            Confirm via contact
          </Link>
          <Link
            href="/admission"
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-800 hover:bg-stone-50"
          >
            Admission info
          </Link>
          <Link
            href="/courses"
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-800 hover:bg-stone-50"
          >
            View courses
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-12">
        <article className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-7">
          <h2 className="text-2xl font-semibold text-stone-900">What happens in a trial class?</h2>
          <ul className="mt-4 space-y-2 text-sm leading-7 text-stone-700">
            <li>- Short concept session in your selected subject.</li>
            <li>- Topic-level problem solving and teacher feedback.</li>
            <li>- Quick readiness check for O/A Level route alignment.</li>
            <li>- Recommended batch type (online, offline, or hybrid).</li>
          </ul>
        </article>

        <article className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:col-span-5">
          <h2 className="text-2xl font-semibold text-stone-900">Trial details</h2>
          <dl className="mt-4 space-y-2 text-sm leading-7 text-stone-700">
            <div>
              <dt className="font-semibold text-stone-900">Fee</dt>
              <dd>Free</dd>
            </div>
            <div>
              <dt className="font-semibold text-stone-900">Duration</dt>
              <dd>45–60 minutes</dd>
            </div>
            <div>
              <dt className="font-semibold text-stone-900">Location</dt>
              <dd>IgnitED Faculty Corner, 10a Block#D, Dhaka 1207</dd>
            </div>
            <div>
              <dt className="font-semibold text-stone-900">Contact numbers</dt>
              <dd>+8801799767975, +8801518359648</dd>
            </div>
          </dl>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-stone-900">Request your slot</h2>
        <p className="mt-2 text-sm text-stone-600">
          Submit your details and our team will confirm your trial timing.
        </p>
        <form className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Student name"
            className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
          <input
            type="text"
            placeholder="Parent phone"
            className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
          <input
            type="text"
            placeholder="Preferred subject"
            className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
          <select className="rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400">
            <option>Preferred mode</option>
            <option>Offline</option>
            <option>Online</option>
            <option>Hybrid</option>
          </select>
          <textarea
            rows={4}
            placeholder="Message (optional)"
            className="sm:col-span-2 rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
          <button
            type="button"
            className="sm:col-span-2 w-fit rounded-md bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
          >
            Submit trial request
          </button>
        </form>
      </section>
    </div>
  );
}
