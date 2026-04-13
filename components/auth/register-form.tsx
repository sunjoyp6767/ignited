"use client";

import { mapAuthError } from "@/lib/supabase-auth-errors";
import { syncPublicUserProfileWithBrowserClient } from "@/lib/profile/sync-public-user-client";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useState } from "react";

const ROLES = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "accountant", label: "Accountant" },
] as const;

export function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]["value"]>("student");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError("Please enter your full name (at least 2 characters).");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: trimmedName,
          role,
        },
      },
    });

    if (signUpError) {
      setError(mapAuthError(signUpError.message));
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Registration did not return a user. Please try again.");
      setLoading(false);
      return;
    }

    if (data.session) {
      const profile = await syncPublicUserProfileWithBrowserClient(supabase, {
        name: trimmedName,
        role,
      });
      if (!profile.ok) {
        setError(profile.message);
        setLoading(false);
        return;
      }
      window.location.assign("/dashboard");
      return;
    }

    setInfo(
      "Check your email to confirm your account. After you confirm, sign in once and your profile will be saved automatically."
    );
    setLoading(false);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-md space-y-5 rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-stone-900">
          Create an account
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Already registered?{" "}
          <Link
            href="/login"
            className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-500"
          >
            Sign in
          </Link>
        </p>
      </div>

      {error ? (
        <p
          className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {info ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
          {info}
        </p>
      ) : null}

      <div className="space-y-2">
        <label htmlFor="register-name" className="text-sm font-medium text-stone-800">
          Full name
        </label>
        <input
          id="register-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
          placeholder="Ada Lovelace"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="register-role" className="text-sm font-medium text-stone-800">
          Role
        </label>
        <select
          id="register-role"
          name="role"
          required
          value={role}
          onChange={(e) =>
            setRole(e.target.value as (typeof ROLES)[number]["value"])
          }
          className="block w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
        >
          {ROLES.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-stone-500">
          Your role controls which areas of IgnitED you can access.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="register-email" className="text-sm font-medium text-stone-800">
          Email
        </label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
          placeholder="you@school.edu"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="register-password" className="text-sm font-medium text-stone-800">
          Password
        </label>
        <input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-10 w-full items-center justify-center rounded-md bg-stone-900 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
