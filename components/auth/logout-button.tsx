"use client";

import { createClient } from "@/utils/supabase/client";
import { useState } from "react";

type LogoutButtonProps = {
  className?: string;
  label?: string;
};

export function LogoutButton({
  className = "rounded-md border border-gray-700 px-3 py-1.5 text-xs font-semibold text-gray-800 hover:bg-gray-100",
  label = "Logout",
}: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.assign("/");
  }

  return (
    <button type="button" disabled={loading} onClick={onLogout} className={className}>
      {loading ? "…" : label}
    </button>
  );
}
