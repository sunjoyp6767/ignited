import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Teachers",
  description: "Meet the O & A Level teaching faculty at IgnitED Faculty Corner.",
};

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English Language & Literature",
];

const teachers = [
  {
    name: "Hasan Abdullah",
    subjects: "Mathematics",
    qualifications: "Mechanical Engineering (BUET), MBA (IBA, DU)",
    experience: "Senior Mathematics Teacher at ESS",
    highlights: "Weekly worksheet cycles and exam-focused revision tracks.",
  },
  {
    name: "Rehana Hashem",
    subjects: "Biology",
    qualifications: "MSc in Biotechnology",
    experience: "8+ years as A Level Biology faculty",
    highlights: "Topicwise concept mapping and practical-oriented prep.",
  },
  {
    name: "Ivan Zaman",
    subjects: "Physics",
    qualifications: "BSc in Physics",
    experience: "7+ years in O/A Level Physics instruction",
    highlights: "Strong problem-solving sessions and lab-linked explanations.",
  },
  {
    name: "Abdullah Al Mamun",
    subjects: "English Language & Literature",
    qualifications: "BA in English",
    experience: "5+ years of Cambridge English preparation",
    highlights: "Essay structure, text analysis, and writing confidence support.",
  },
  {
    name: "Md Shawkat Hossain",
    subjects: "Chemistry",
    qualifications: "BSc in Chemistry",
    experience: "9+ years teaching IGCSE and A Level Chemistry",
    highlights: "Reaction mechanisms and weekly assessment coaching.",
  },
];

export default function TeachersPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Teachers</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Meet the Best O & A Level Teachers in Dhaka
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-600 sm:text-base">
          Our faculty includes experienced instructors from respected institutions with strong
          Cambridge and Edexcel classroom backgrounds. Every batch is handled with structured
          planning, regular review, and exam-focused delivery.
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-stone-900">Why students choose our faculty</h2>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          We combine subject depth with practical exam strategy. Students receive consistent
          feedback, planned revision checkpoints, and topic-based intervention before major exams.
        </p>
      </section>

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-semibold text-stone-900">Subjects covered</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <span
              key={subject}
              className="rounded-full border border-stone-300 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-700"
            >
              {subject}
            </span>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-xl font-semibold text-stone-900">Join the top O & A Level teachers</h2>
          <div className="flex gap-2">
            <Link
              href="/admission"
              className="rounded-md bg-stone-900 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white hover:bg-stone-800"
            >
              Admission info
            </Link>
            <Link
              href="/trial_class"
              className="rounded-md border border-stone-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-stone-800 hover:bg-stone-50"
            >
              Book trial class
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {teachers.map((teacher) => (
            <article key={teacher.name} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <h3 className="text-base font-semibold text-stone-900">{teacher.name}</h3>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-stone-500">
                {teacher.subjects}
              </p>
              <dl className="mt-3 space-y-2 text-sm text-stone-600">
                <div>
                  <dt className="font-medium text-stone-800">Qualifications</dt>
                  <dd>{teacher.qualifications}</dd>
                </div>
                <div>
                  <dt className="font-medium text-stone-800">Experience</dt>
                  <dd>{teacher.experience}</dd>
                </div>
                <div>
                  <dt className="font-medium text-stone-800">Specialized in</dt>
                  <dd>{teacher.highlights}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
