import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to IgnitED Faculty Corner.",
};

type LoginPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { next } = await searchParams;

  return (
    <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      <LoginForm nextHref={next} />
    </div>
  );
}
