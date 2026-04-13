"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard/teacher", label: "Overview" },
  { href: "/dashboard/teacher/messages", label: "Messages" },
  { href: "/dashboard/teacher/resources", label: "Resources" },
  { href: "/dashboard/teacher/performance", label: "Performance" },
  { href: "/dashboard/teacher/questions", label: "Questions" },
  { href: "/dashboard/teacher/mock-exams", label: "Mock exams" },
];

function isActive(href: string, pathname: string) {
  if (href === "/dashboard/teacher") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function TeacherSidebar({ teacherName }: { teacherName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden h-full w-56 shrink-0 flex-col border-r border-gray-200 bg-white py-6 pl-4 pr-3 md:flex">
      <div className="mb-6 border-b border-gray-100 pb-4">
        <p className="truncate text-sm font-semibold text-gray-900">{teacherName}</p>
        <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
          Teacher
        </span>
      </div>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Teacher dashboard">
        {NAV.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-r-md px-3 py-2 text-sm text-gray-800 ${
                active
                  ? "border-l-2 border-gray-900 font-semibold text-gray-900"
                  : "border-l-2 border-transparent hover:bg-gray-50"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-gray-100 pt-4">
        <LogoutButton className="w-full rounded-md border border-gray-700 px-3 py-2 text-left text-xs font-semibold text-gray-900 hover:bg-gray-50" />
      </div>
    </aside>
  );
}
