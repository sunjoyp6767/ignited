import { HeaderAuthCluster } from "@/components/landing/header-auth-cluster";
import { initialsFromName } from "@/lib/student/initials";
import { createClient } from "@/utils/supabase/server";
import Image from "next/image";
import Link from "next/link";
import { Menu } from "lucide-react";

const navItems: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/mathbridge", label: "MathBridge" },
  { href: "/teachers", label: "Teachers" },
  { href: "/facilities", label: "Facilities" },
  { href: "/admission", label: "Admission" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

const linkClass =
  "whitespace-nowrap px-2 py-1 text-sm font-medium text-[#2c2c2a] transition hover:text-teal-800";

export async function LandingHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let initials: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("name")
      .eq("id", user.id)
      .maybeSingle();
    displayName = profile?.name?.trim() || user.email || null;
    initials = initialsFromName(displayName ?? user.email ?? "");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-400/50 bg-[#ccc9b5] shadow-sm">
      <div className="mx-auto flex h-14 w-full max-w-screen-2xl items-center justify-between px-6">
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-2 text-[#2c2c2a] sm:gap-3"
            aria-label="IgnitED Faculty Corner home"
          >
            <Image
              src="/assets/logo_IgnitED.png"
              alt="IgnitED"
              width={160}
              height={40}
              priority
              className="h-9 w-auto shrink-0 sm:h-10"
            />
            <span className="truncate text-sm font-semibold tracking-tight sm:text-base lg:text-lg">
              IgnitED Faculty Corner
            </span>
          </Link>
        </div>

        <nav
          className="hidden min-w-0 flex-1 flex-nowrap items-center justify-center gap-0 overflow-x-auto md:flex"
          aria-label="Primary"
        >
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className={linkClass}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <HeaderAuthCluster
            userId={user?.id ?? null}
            initials={initials}
            displayName={displayName}
            className="hidden md:flex"
            layout="row"
          />

          <details className="relative md:hidden">
            <summary
              className="flex cursor-pointer list-none items-center justify-center rounded-md border border-stone-600/40 bg-[#d6d3c4] p-2 text-[#2c2c2a] [&::-webkit-details-marker]:hidden"
              aria-label="Open menu"
            >
              <Menu className="size-6" strokeWidth={2} aria-hidden />
            </summary>
            <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-stone-300 bg-[#f5f2e8] py-2 shadow-lg">
              <nav className="flex flex-col gap-1 px-2" aria-label="Mobile primary">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-medium text-[#2c2c2a] hover:bg-teal-50"
                  >
                    {item.label}
                  </Link>
                ))}
                <hr className="my-2 border-stone-300" />
                <div className="px-2 pb-1">
                  <HeaderAuthCluster
                    userId={user?.id ?? null}
                    initials={initials}
                    displayName={displayName}
                    layout="stack"
                  />
                </div>
              </nav>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
