"use client";

import { mapAuthError } from "@/lib/supabase-auth-errors";
import { syncPublicUserProfileWithBrowserClient } from "@/lib/profile/sync-public-user-client";
import { safeNextPath } from "@/lib/safe-next-path";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useState } from "react";

type LoginFormProps = {
  nextHref?: string;
};

export function LoginForm({ nextHref }: LoginFormProps) {
  const afterLogin = safeNextPath(nextHref, "/dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(mapAuthError(signInError.message));
        return;
      }

      const profile = await syncPublicUserProfileWithBrowserClient(supabase);
      if (!profile.ok) {
        setError(profile.message);
        return;
      }

      // Full navigation so middleware + server components always see the new session cookies.
      window.location.assign(afterLogin);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-md space-y-5 rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-stone-900">
          Sign in
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Access your IgnitED account. New here?{" "}
          <Link
            href="/register"
            className="font-medium text-stone-900 underline decoration-stone-300 underline-offset-2 hover:decoration-stone-500"
          >
            Register
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

      <div className="space-y-2">
        <label htmlFor="login-email" className="text-sm font-medium text-stone-800">
          Email
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none ring-stone-400 placeholder:text-stone-400 focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
          placeholder="you@school.edu"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="login-password" className="text-sm font-medium text-stone-800">
          Password
        </label>
        <input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 shadow-sm outline-none ring-stone-400 focus:border-stone-500 focus:ring-1 focus:ring-stone-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex h-10 w-full items-center justify-center rounded-md bg-stone-900 text-sm font-medium text-white transition-colors hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
