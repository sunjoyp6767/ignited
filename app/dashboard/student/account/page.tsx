import { createClient } from "@/utils/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My account",
  description: "Account overview.",
};

export default async function StudentAccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = "—";
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("name, role")
      .eq("id", user.id)
      .maybeSingle();
    name = profile?.name?.trim() ?? "—";
  }

  return (
    <div className="w-full px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900">My account</h1>
      <p className="mt-2 text-sm text-gray-600">Basic profile information from your IgnitED record.</p>

      <dl className="mt-8 space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Name</dt>
          <dd className="mt-1 text-sm text-gray-900">{name}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">Role</dt>
          <dd className="mt-1 text-sm text-gray-900">Student</dd>
        </div>
      </dl>
    </div>
  );
}
