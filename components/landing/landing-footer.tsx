import Image from "next/image";
import Link from "next/link";

const footerLink = "text-stone-300 transition hover:text-white";

export function LandingFooter() {
  return (
    <footer className="mt-auto bg-[#2c2c2a] text-stone-200">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <Link href="/" className="inline-flex items-center gap-3 text-white">
              <Image
                src="/assets/logo_IgnitED.png"
                alt=""
                width={140}
                height={36}
                className="h-9 w-auto rounded-md shadow-sm"
              />
              <span className="text-base font-semibold leading-tight">
                IgnitED Faculty Corner
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-stone-400">
              Premium coaching for O &amp; A Levels (Cambridge &amp; Edexcel) with expert
              faculty, hybrid classes, and lab-supported learning. Based in Lalmatia,
              Dhaka.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
              Quick Links
            </h3>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              <li>
                <Link href="/about" className={footerLink}>
                  About
                </Link>
              </li>
              <li>
                <Link href="/teachers" className={footerLink}>
                  Faculty Profiles
                </Link>
              </li>
              <li>
                <Link href="/courses" className={footerLink}>
                  Courses Offered
                </Link>
              </li>
              <li>
                <Link href="/admission" className={footerLink}>
                  Admission Info
                </Link>
              </li>
              <li>
                <Link href="/contact" className={footerLink}>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
              We Teach
            </h3>
            <ul className="mt-4 flex flex-col gap-1 text-sm leading-relaxed text-stone-400">
              <li>Mathematics</li>
              <li>Physics</li>
              <li>Biology</li>
              <li>English Literature</li>
              <li>Edexcel &amp; Cambridge Curriculum</li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-stone-400">
              Admissions &amp; Resources
            </h3>
            <ul className="mt-4 flex flex-col gap-2 text-sm">
              <li>
                <Link href="/trial_class" className={footerLink}>
                  Join a Free Trial Class
                </Link>
              </li>
              <li>
                <Link href="/facilities" className={footerLink}>
                  View Our Lab Facilities
                </Link>
              </li>
              <li className="text-stone-400">Crash Courses Info</li>
              <li className="text-stone-400">FAQ</li>
              <li className="text-stone-400">Download Brochure (PDF)</li>
              <li className="text-stone-400">Student Testimonials</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-stone-600 pt-8 text-sm sm:flex-row">
          <p className="text-stone-500">© 2026 IgnitED Faculty Corner</p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="text-stone-400">Follow Us</span>
            <div
              className="flex gap-2"
              aria-label="Social media icon placeholders (links not yet configured)"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-600 text-xs font-semibold text-stone-400">
                f
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-600 text-xs font-semibold text-stone-400">
                in
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-600 text-xs font-semibold text-stone-400">
                Li
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
