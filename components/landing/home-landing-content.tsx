import Link from "next/link";

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 9.056a.75.75 0 00-.053 1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

const pillClass =
  "rounded-full border border-teal-700 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-800";

export function HomeLandingContent() {
  return (
    <main>
      <section
        id="hero"
        className="border-b border-stone-200/80 bg-gradient-to-b from-[#f5f2e8] to-[#ebe8dc] px-4 py-24 sm:px-6"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-[#2c2c2a] sm:text-5xl">
            IgnitED Faculty Corner
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            O &amp; A Level Coaching in Lalmatia, Dhaka (Cambridge &amp; Edexcel)
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-gray-700 sm:text-lg">
            Expert teachers, small batches, hybrid learning, and lab-supported science
            classes—built for consistent exam performance.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
            <Link
              href="/trial_class"
              className="inline-flex items-center justify-center rounded-md bg-teal-800 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-teal-900"
            >
              Book a Trial Class
            </Link>
            <Link
              href="/admission"
              className="inline-flex items-center justify-center rounded-md border-2 border-teal-800 bg-transparent px-6 py-3 text-sm font-semibold text-teal-900 transition hover:bg-teal-50"
            >
              Admission
            </Link>
            <Link
              href="/courses"
              className="inline-flex items-center justify-center gap-1 text-sm font-semibold text-teal-800 underline-offset-4 transition hover:text-teal-950 hover:underline"
            >
              Explore Courses
              <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section id="about" className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-center text-2xl font-bold tracking-tight text-[#2c2c2a] sm:text-3xl">
            What Makes IgnitED Unique for O &amp; A Level Students
          </h2>
          <p className="mx-auto mt-6 text-center text-base leading-relaxed text-gray-700 sm:text-lg">
            At IgnitED Faculty Corner, we provide top-tier O &amp; A Level coaching in
            Dhaka, guided by expert educators from prestigious institutions like ESS,
            Playpen, Mastermind, and Wordbridge. Our commitment to quality includes
            maintaining small class sizes—capped at a maximum of 12 students per
            batch—to ensure personalized attention and effective learning.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3 sm:gap-4">
            <span className={pillClass}>Max 12 students per class</span>
            <span className={pillClass}>Lab-based science classes</span>
            <span className={pillClass}>Online &amp; Offline options</span>
            <span className={pillClass}>Crash courses &amp; mock tests</span>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-gray-50 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold text-[#2c2c2a] sm:text-3xl">
            Cambridge &amp; Edexcel curriculum focus
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
            We teach with syllabus-aligned lesson plans and exam strategy for Cambridge
            and Pearson Edexcel students.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <a
              href="https://www.cambridgeinternational.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md"
            >
              <span className="flex items-center gap-2 text-base font-semibold text-[#2c2c2a]">
                Cambridge Assessment International Education
                <ExternalLinkIcon className="size-4 shrink-0 text-teal-800" />
              </span>
            </a>
            <a
              href="https://qualifications.pearson.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center rounded-lg border border-stone-200 bg-white p-6 text-center shadow-sm transition hover:shadow-md"
            >
              <span className="flex items-center gap-2 text-base font-semibold text-[#2c2c2a]">
                Pearson Edexcel Qualifications
                <ExternalLinkIcon className="size-4 shrink-0 text-teal-800" />
              </span>
            </a>
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/admission"
              className="inline-flex w-full items-center justify-center rounded-md bg-teal-800 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-900 sm:w-auto"
            >
              Enroll Now
            </Link>
            <Link
              href="/teachers"
              className="inline-flex w-full items-center justify-center rounded-md border border-teal-800 px-6 py-3 text-sm font-semibold text-teal-900 transition hover:bg-teal-50 sm:w-auto"
            >
              Meet Teachers
            </Link>
            <Link
              href="/contact"
              className="inline-flex w-full items-center justify-center rounded-md border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-[#2c2c2a] transition hover:bg-stone-50 sm:w-auto"
            >
              Contact
            </Link>
          </div>
        </div>
      </section>

      <section id="subjects" className="px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-2xl font-bold text-[#2c2c2a] sm:text-3xl">
            Subjects We Teach
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <article className="relative flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="h-1.5 bg-blue-600" aria-hidden />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold text-[#2c2c2a]">Mathematics</h3>
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gray-500">
                  <li>Cambridge O Level Maths D (4024)</li>
                  <li>Additional Maths (4037)</li>
                  <li>AS &amp; A Level Pure Maths 1 &amp; 3 / Mechanics / Probability &amp; Stats (9709)</li>
                </ul>
                <p className="mt-auto pt-6 text-sm italic text-gray-600">
                  Instructor: Hasan Abdullah (BUET, IBA-DU)
                </p>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/admission"
                    className="text-sm font-semibold text-teal-800 hover:text-teal-950"
                  >
                    Enroll Now →
                  </Link>
                </div>
              </div>
            </article>

            <article className="relative flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="h-1.5 bg-green-600" aria-hidden />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold text-[#2c2c2a]">Biology</h3>
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gray-500">
                  <li>O Level Biology (5090) with Lab</li>
                  <li>AS &amp; A Level Biology (9700) with Lab</li>
                  <li>Edexcel IGCSE &amp; IAL Biology</li>
                </ul>
                <p className="mt-auto pt-6 text-sm italic text-gray-600">
                  Instructor: Rehana Hashem (B.Sc. &amp; M.Sc. DU, PhD Molecular Biology,
                  Leibniz University Germany)
                </p>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/admission"
                    className="text-sm font-semibold text-teal-800 hover:text-teal-950"
                  >
                    Enroll Now →
                  </Link>
                </div>
              </div>
            </article>

            <article className="relative flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="h-1.5 bg-purple-600" aria-hidden />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold text-[#2c2c2a]">Physics</h3>
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gray-500">
                  <li>O Level Physics (5054) with Lab</li>
                  <li>AS &amp; A Level Physics (9702) with Lab</li>
                  <li>Edexcel IGCSE &amp; IAL Physics</li>
                </ul>
                <p className="mt-auto pt-6 text-sm italic text-gray-600">
                  Instructor: Ivan Zaman (JU)
                </p>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/admission"
                    className="text-sm font-semibold text-teal-800 hover:text-teal-950"
                  >
                    Enroll Now →
                  </Link>
                </div>
              </div>
            </article>

            <article className="relative flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="h-1.5 bg-amber-500" aria-hidden />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold text-[#2c2c2a]">
                  English Language &amp; Literature
                </h3>
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gray-500">
                  <li>O Level English Language (1123)</li>
                  <li>Literature in English (2010, 4ET1, 9695, XET01)</li>
                </ul>
                <p className="mt-auto pt-6 text-sm italic text-gray-600">
                  Instructor: Abdullah Al Mamun (CU, JU, Alliance Française)
                </p>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/admission"
                    className="text-sm font-semibold text-teal-800 hover:text-teal-950"
                  >
                    Enroll Now →
                  </Link>
                </div>
              </div>
            </article>

            <article className="relative flex flex-col overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
              <div className="h-1.5 bg-red-600" aria-hidden />
              <div className="flex flex-1 flex-col p-6">
                <h3 className="text-lg font-semibold text-[#2c2c2a]">Chemistry</h3>
                <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-gray-500">
                  <li>CAIE O Level Chemistry (5070)</li>
                  <li>IGCSE Chemistry (0620)</li>
                  <li>A Level Chemistry (9701) with Lab</li>
                </ul>
                <p className="mt-auto pt-6 text-sm italic text-gray-600">
                  Instructor: Md Shawkat Hossain (HURDCO International)
                </p>
                <div className="mt-4 flex justify-end">
                  <Link
                    href="/admission"
                    className="text-sm font-semibold text-teal-800 hover:text-teal-950"
                  >
                    Enroll Now →
                  </Link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section id="location" className="border-t border-stone-200 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl text-center">
          <h2 className="text-2xl font-bold text-[#2c2c2a] sm:text-3xl">Find Us</h2>
          <p className="mt-3 text-gray-600">Visit our campus in Lalmatia, Dhaka.</p>
          <address className="mt-5 text-base font-medium leading-relaxed text-[#2c2c2a] not-italic sm:text-lg">
            IgnitED Faculty Corner, 10a Block#D, Dhaka 1207
          </address>
          <a
            href="https://maps.app.goo.gl/eUgYTHkvMamPJPZS8"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center justify-center rounded-md border-2 border-teal-800 px-6 py-3 text-sm font-semibold text-teal-900 transition hover:bg-teal-50"
          >
            Get Directions →
          </a>
          <div className="mt-8 overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-sm">
            <iframe
              title="Map — IgnitED Faculty Corner, Lalmatia, Dhaka"
              className="aspect-[16/10] min-h-[260px] w-full border-0 sm:min-h-[320px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              src="https://www.google.com/maps?q=10a+Block+D+Lalmatia+Dhaka+1207+Bangladesh&output=embed&z=16"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
