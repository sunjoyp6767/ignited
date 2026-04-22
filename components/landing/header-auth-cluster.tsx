"use client";

import { LogoutButton } from "@/components/auth/logout-button";
import Link from "next/link";

type HeaderAuthClusterProps = {
  userId: string | null;
  initials: string | null;
  displayName: string | null;
  /** Extra classes on the outer wrapper */
  className?: string;
  layout?: "row" | "stack";
};

const loginClass =
  "rounded-md border-2 border-teal-800 px-4 py-2 text-sm font-semibold text-teal-900 transition hover:bg-teal-50 text-center";
const registerClass =
  "rounded-md bg-[#2c2c2a] px-4 py-2 text-sm font-semibold text-[#f5f2e8] shadow-md transition hover:bg-teal-950 text-center";
const dashboardClass =
  "rounded-md border border-teal-800 px-3 py-1.5 text-xs font-semibold text-teal-900 transition hover:bg-teal-50 text-center";

export function HeaderAuthCluster({
  userId,
  initials,
  displayName,
  className = "",
  layout = "row",
}: HeaderAuthClusterProps) {
  const flex =
    layout === "stack" ? "flex flex-col gap-2" : "flex flex-row flex-wrap items-center gap-3";

  if (!userId) {
    return (
      <div className={`${flex} ${className}`}>
        <Link href="/login" className={loginClass}>
          Login
        </Link>
        <Link href="/register" className={registerClass}>
          Register
        </Link>
      </div>
    );
  }

  const label = displayName?.trim() || "Signed in";

  return (
    <div className={`${flex} ${className}`}>
      <Link href="/dashboard" className={dashboardClass}>
        Dashboard
      </Link>
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gray-800 text-sm font-medium text-white"
        aria-label={label}
        title={label}
      >
        {initials ?? "?"}
      </div>
      <LogoutButton className="rounded-md border border-gray-700 bg-transparent px-3 py-1.5 text-xs font-semibold text-gray-900 hover:bg-gray-100" />
    </div>
  );
}
