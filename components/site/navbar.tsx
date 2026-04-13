import Link from "next/link";

const navLinkClass =
  "text-sm font-medium text-stone-600 transition-colors hover:text-stone-900";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-stone-50/95 backdrop-blur supports-[backdrop-filter]:bg-stone-50/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-semibold tracking-tight text-stone-900"
        >
          IgnitED
        </Link>
        <nav
          className="flex items-center gap-6 sm:gap-8"
          aria-label="Primary"
        >
          <Link href="/about" className={navLinkClass}>
            About
          </Link>
          <Link href="/login" className={navLinkClass}>
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 shadow-sm transition-colors hover:border-stone-400 hover:bg-stone-50"
          >
            Register
          </Link>
        </nav>
      </div>
    </header>
  );
}
