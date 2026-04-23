import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Courses",
  description: "Discover O & A Level coaching tracks at IgnitED Faculty Corner.",
};

const subjectTracks = [
  {
    title: "O Level Science Bundle",
    body:
      "Physics, Chemistry, and Biology tracks with synchronized weekly plans and chapter-level assessments.",
    level: "O Level",
  },
  {
    title: "A Level Mathematics",
    body:
      "Pure Math, Statistics, and Mechanics preparation using topic-node practice and structured mock cycles.",
    level: "A Level",
  },
  {
    title: "A Level Physics",
    body:
      "Concept-first instruction with exam-focused drills, practical interpretation, and frequent progress reviews.",
    level: "A Level",
  },
  {
    title: "Academic English Support",
    body:
      "Language support for written responses, explanation quality, and confidence in long-answer exam tasks.",
    level: "Support",
  },
];

const objectives = [
  "Build clear conceptual understanding before exam drilling.",
  "Maintain small, mentor-led batches with data-backed monitoring.",
  "Use weekly diagnostics to update each learner's preparation path.",
];

const posters = [
  { id: "english", title: "English Faculty Campaign" },
  { id: "math", title: "Mathematics Crash Course" },
  { id: "chemistry", title: "Chemistry Program Poster" },
  { id: "biology", title: "Biology Program Poster" },
  { id: "physics", title: "Physics Faculty Campaign" },
];

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Courses</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Discover O & A Level Courses
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600 sm:text-base">
          IgnitED Faculty Corner provides Cambridge and Edexcel aligned preparation with a
          structured learning path, regular diagnostics, and strong faculty mentorship across
          science and mathematics streams.
        </p>
      </section>

      <section className="mt-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight text-stone-900">Subject offerings</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {subjectTracks.map((track) => (
            <article key={track.title} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-stone-900">{track.title}</h3>
                <span className="rounded-full border border-stone-300 bg-white px-2 py-0.5 text-xs text-stone-700">
                  {track.level}
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-stone-600">{track.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight text-stone-900">Objective</h2>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-stone-600">
          {objectives.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-2 inline-block size-1.5 rounded-full bg-teal-700" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-end justify-between gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-stone-900">Course gallery posters</h2>
          <p className="text-xs uppercase tracking-widest text-stone-500">Recent campaigns</p>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posters.map((poster) => (
            <article key={poster.id} className="overflow-hidden rounded-lg border border-stone-300 bg-stone-50">
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={`/api/course-posters/${poster.id}`}
                  alt={poster.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="border-t border-stone-200 bg-white px-3 py-2">
                <p className="text-xs font-medium text-stone-700">{poster.title}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
