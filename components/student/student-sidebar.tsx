"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV: { href: string; label: string }[] = [
  { href: "/dashboard/student", label: "Learning hub" },
  { href: "/dashboard/student/messages", label: "Messages" },
  { href: "/dashboard/student/resources", label: "My resources" },
  { href: "/dashboard/student/study-plan", label: "Study plan" },
  { href: "/dashboard/student/performance", label: "Performance" },
  { href: "/dashboard/student/mock-exam", label: "Mock exam" },
  { href: "/dashboard/student/history", label: "Attempt history" },
  { href: "/dashboard/student/account", label: "My account" },
];

function linkActive(href: string, pathname: string): boolean {
  if (href === "/dashboard/student") {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

type StudentSidebarProps = {
  studentName: string;
};

export function StudentSidebar({ studentName }: StudentSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-56 shrink-0 flex-col border-r border-gray-200 bg-white py-6 pl-4 pr-3 md:flex">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <p className="truncate text-sm font-semibold text-gray-900">{studentName}</p>
        <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
          Student
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Student dashboard">
        {NAV.map((item) => {
          const active = linkActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-r-md px-3 py-2 text-sm text-gray-800 ${
                active
                  ? "border-l-2 border-gray-900 font-semibold text-gray-900"
                  : "border-l-2 border-transparent font-normal hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-2 border-t border-gray-100 pt-4">
        <Link
          href="/contact"
          className="px-3 py-2 text-sm text-gray-600 underline-offset-2 hover:text-gray-900 hover:underline"
        >
          Help &amp; Support
        </Link>
        <LogoutButton className="w-full rounded-md border border-gray-700 px-3 py-2 text-left text-xs font-semibold text-gray-900 hover:bg-gray-50" />
      </div>
    </aside>
  );
}
