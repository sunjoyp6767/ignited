import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Admission",
  description: "O & A Level admission details for IgnitED Faculty Corner, Lalmatia.",
};

const whyIgnited = [
  {
    title: "Small batches & personal attention",
    body: "Maximum 12 students per batch so every student gets individual support.",
  },
  {
    title: "Hybrid learning (Online + Offline)",
    body: "Attend in-person or online. Sessions are structured for consistent progress.",
  },
  {
    title: "Cambridge & Edexcel aligned teaching",
    body: "Topic-wise coverage, exam strategy, and regular assessment following the syllabus.",
  },
  {
    title: "Lab-supported science classes",
    body: "Biology, Chemistry, and Physics practical sessions to strengthen concepts and grades.",
  },
];

const admissionSteps = [
  "Contact us or book a free trial class.",
  "Choose your curriculum (Cambridge / Edexcel) and subjects.",
  "We recommend a batch based on your level and schedule.",
  "Start classes and receive an exam-focused study plan.",
];

export default function AdmissionPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Admission</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          O & A Level Admission in Dhaka
        </h1>
        <p className="mt-4 max-w-4xl text-sm leading-7 text-stone-600 sm:text-base">
          Cambridge & Edexcel coaching admissions are open at IgnitED Faculty Corner (Lalmatia).
          Limited seats per batch.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href="/trial_class"
            className="rounded-md bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-stone-800"
          >
            Book a free trial class
          </Link>
          <Link
            href="/contact"
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-800 hover:bg-stone-50"
          >
            Contact us
          </Link>
          <Link
            href="/courses"
            className="rounded-md border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-800 hover:bg-stone-50"
          >
            See courses
          </Link>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-stone-900">
          Why choose IgnitED for O & A Level coaching?
        </h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {whyIgnited.map((item) => (
            <article key={item.title} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <h3 className="text-base font-semibold text-stone-900">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-stone-900">Admission details</h2>
        <div className="mt-4 grid gap-5 md:grid-cols-2">
          <article>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Programs</h3>
            <p className="mt-2 text-sm leading-7 text-stone-700">
              Cambridge O Level & AS/A Level
              <br />
              Pearson Edexcel IGCSE & International A Level
            </p>
          </article>
          <article>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Subjects</h3>
            <p className="mt-2 text-sm leading-7 text-stone-700">
              Mathematics, Biology, Chemistry, Physics, English Language & Literature
            </p>
          </article>
          <article>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">To enroll / inquire</h3>
            <p className="mt-2 text-sm leading-7 text-stone-700">
              Email: info@ignitededu.com
              <br />
              Phone: +8801799767975, +8801518359648
            </p>
          </article>
          <article>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-500">Address</h3>
            <p className="mt-2 text-sm leading-7 text-stone-700">
              IgnitED Faculty Corner, 10a Block#D, Dhaka 1207
            </p>
          </article>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-stone-900">How admission works</h2>
        <ol className="mt-4 space-y-2 text-sm leading-7 text-stone-700">
          {admissionSteps.map((step, idx) => (
            <li key={step}>
              <span className="font-semibold text-stone-900">{idx + 1}) </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-stone-900">FAQ</h2>
        <div className="mt-4 space-y-4 text-sm leading-7 text-stone-700">
          <article>
            <h3 className="font-semibold text-stone-900">Is admission open year-round?</h3>
            <p>Yes. We enroll students throughout the year, depending on seat availability.</p>
          </article>
          <article>
            <h3 className="font-semibold text-stone-900">Do you offer Cambridge and Edexcel both?</h3>
            <p>
              Yes. We offer coaching for Cambridge O Level/AS/A Level and Edexcel IGCSE/IAL.
            </p>
          </article>
          <article>
            <h3 className="font-semibold text-stone-900">Where are you located in Dhaka?</h3>
            <p>IgnitED Faculty Corner is located at 10a Block#D, Dhaka 1207 (Lalmatia area).</p>
          </article>
        </div>
      </section>
    </div>
  );
}
