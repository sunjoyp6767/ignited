import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="text-sm font-semibold text-stone-900">IgnitED Faculty Corner</p>
          <p className="mt-1 max-w-md text-xs leading-relaxed text-stone-500">
            Syllabus-aligned learning for Cambridge and Pearson Edexcel. Built for
            students, faculty, and operations teams.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-500">
          <Link href="/about" className="hover:text-stone-800">
            About
          </Link>
          <Link href="/login" className="hover:text-stone-800">
            Login
          </Link>
          <Link href="/register" className="hover:text-stone-800">
            Register
          </Link>
        </div>
      </div>
      <div className="border-t border-stone-100">
        <div className="mx-auto max-w-5xl px-4 py-3 sm:px-6">
          <p className="text-center text-xs text-stone-400">
            © {year} IgnitED. Academic prototype.
          </p>
        </div>
      </div>
    </footer>
  );
}
