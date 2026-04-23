import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Facilities",
  description: "Academic facilities and learning environment at IgnitED Faculty Corner.",
};

export default function FacilitiesPage() {
  const tourImages = [
    { id: "acClassroom", label: "AC classroom setup" },
    { id: "digitalMethod1", label: "Digital method classroom" },
    { id: "digitalMethod2", label: "Smart board teaching" },
    { id: "physicsLab", label: "Physics lab practical session" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-14">
      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Facilities</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Our Facilities
        </h1>
        <h2 className="mt-4 text-2xl font-semibold leading-tight text-stone-900">
          Designed to Maximize Learning Comfort and Performance
        </h2>
        <p className="mt-4 max-w-5xl text-sm leading-7 text-stone-600 sm:text-base">
          At IgnitED, we believe that a supportive and comfortable environment is essential for
          academic success. Our facilities are thoughtfully designed to serve both in-person and
          online learners with science labs, hybrid classroom setups, and modern amenities.
        </p>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-semibold text-stone-900">Science Lab Facilities</h3>
          <ul className="mt-3 space-y-1 text-sm leading-7 text-stone-600">
            <li>Fully equipped labs for Biology, Chemistry & Physics</li>
            <li>Hands-on practical sessions aligned with Cambridge & Edexcel syllabi</li>
            <li>Safety-first environment and real-world application</li>
          </ul>
        </article>

        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-semibold text-stone-900">Hybrid Classrooms</h3>
          <ul className="mt-3 space-y-1 text-sm leading-7 text-stone-600">
            <li>Attend classes online or offline — your choice</li>
            <li>All sessions are recorded for flexible revision</li>
            <li>Digital whiteboards and screen-sharing tools in classrooms</li>
          </ul>
        </article>

        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-semibold text-stone-900">Air-Conditioned Classrooms</h3>
          <ul className="mt-3 space-y-1 text-sm leading-7 text-stone-600">
            <li>Clean, quiet, and climate-controlled learning spaces</li>
            <li>Designed for small batches (max 12 students) to maintain focus</li>
            <li>Power backup ensures uninterrupted sessions</li>
          </ul>
        </article>

        <article className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
          <h3 className="text-xl font-semibold text-stone-900">Student-Friendly Amenities</h3>
          <ul className="mt-3 space-y-1 text-sm leading-7 text-stone-600">
            <li>Continuous Electricity Backup</li>
            <li>5G Internet Connectivity</li>
            <li>Mineral Water & Snacks</li>
            <li>Hygienic Washrooms</li>
            <li>Parent Waiting Area</li>
          </ul>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-stone-900">Facility Tour Preview</h2>
        <p className="mt-2 text-sm text-stone-600">
          A quick visual walkthrough of our classrooms and lab environment.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {tourImages.map((img) => (
            <article key={img.id} className="overflow-hidden rounded-lg border border-stone-200 bg-stone-50">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src={`/api/facility-images/${img.id}`}
                  alt={img.label}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="border-t border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-700">
                {img.label}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
