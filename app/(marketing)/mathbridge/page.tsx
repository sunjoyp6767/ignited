import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "MathBridge",
  description: "Structured MathBridge resources and promotional learning content.",
};

export default function MathBridgePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:space-y-8">
      <section className="overflow-hidden rounded-2xl border border-stone-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 p-5 text-white shadow-md sm:p-6">
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-xs uppercase tracking-widest text-white/80">MathBridge</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Master Mathematics with a guided, exam-focused path
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/90">
              Explore free resources instantly. MathBridge premium enrollment is currently unavailable
              and will open soon.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-white/60 bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-wide">
                Enrollment coming soon
              </span>
              <Link
                href="/login"
                className="rounded-full border border-white/70 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-900 hover:bg-stone-100"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="space-y-3 lg:col-span-5">
            <article className="overflow-hidden rounded-xl border border-white/30 bg-white/85 p-2 text-stone-900 shadow-sm">
              <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
                Promotional video
              </p>
              <div className="relative aspect-video overflow-hidden rounded-lg bg-black">
                <iframe
                  src="https://www.youtube.com/embed/Zi96Y43VXbY"
                  title="MathBridge promotional video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full border-0"
                />
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-xl font-semibold text-stone-900">Courses</h2>
        <p className="mt-1 text-sm text-stone-600">
          Expand each subject to view available PDF and video resources.
        </p>

        <div className="mt-4 rounded-lg border border-stone-200">
          <details className="group border-b border-stone-200 open:bg-stone-50/50">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-stone-800">
              Class 9
            </summary>
            <div className="space-y-1 px-4 pb-3 text-sm text-stone-600">
              <p>- Algebra practice pack (PDF)</p>
              <p>- Number system revision set (PDF)</p>
              <p>- Foundation concept walkthrough (Video)</p>
            </div>
          </details>
          <details className="group border-b border-stone-200 open:bg-stone-50/50">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-stone-800">
              O Level
            </summary>
            <div className="space-y-1 px-4 pb-3 text-sm text-stone-600">
              <p>- Topic-wise past paper collections</p>
              <p>- Mock set with worked hints</p>
              <p>- Recorded concept sessions</p>
            </div>
          </details>
          <details className="group open:bg-stone-50/50">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-stone-800">
              A Level
            </summary>
            <div className="space-y-1 px-4 pb-3 text-sm text-stone-600">
              <p>- Pure maths drill sheets</p>
              <p>- Mechanics and Statistics practice routes</p>
              <p>- Exam strategy video sessions</p>
            </div>
          </details>
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="text-xl font-semibold text-stone-900">Private MathBridge enrollment</h3>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Enrollment is temporarily closed. We are preparing the next structured batch with
              guided lesson sequencing, resource locking, and progress checkpoints.
            </p>
            <p className="mt-3 text-sm font-semibold text-amber-700">
              Enrollment: Coming soon
            </p>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-4 lg:col-span-5">
            <p className="text-sm font-semibold text-stone-900">What you'll get</p>
            <ul className="mt-2 space-y-2 text-sm text-stone-600">
              <li>- Subject-wise organized resources</li>
              <li>- Exam-first resource progression</li>
              <li>- Teacher-curated weekly updates</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
