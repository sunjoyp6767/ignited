import { LoginForm } from "@/components/auth/login-form";
import type { Metadata } from "next";
import Image from "next/image";

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
    <div className="flex min-h-[calc(100vh-3.5rem)] w-full flex-col lg:flex-row">
      {/* LEFT PANEL — branding (hidden on mobile) */}
      <div className="hidden flex-col items-center justify-center bg-[#ccc9b5] px-16 lg:flex lg:w-1/2">
        <Image
          src="/assets/logo_IgnitED.png"
          alt="IgnitED"
          width={80}
          height={80}
          className="mb-6"
        />
        <h1 className="mb-3 text-center text-3xl font-bold text-gray-900">
          IgnitED Faculty Corner
        </h1>
        <p className="max-w-sm text-center text-base leading-relaxed text-gray-700">
          O & A Level coaching aligned to Cambridge & Edexcel — your personalised study hub.
        </p>

        <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
          <div className="flex items-center gap-3 rounded-lg bg-white/40 px-4 py-3">
            <span className="text-sm font-medium text-gray-800">Syllabus-aligned quizzes</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-white/40 px-4 py-3">
            <span className="text-sm font-medium text-gray-800">Auto-generated study plans</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg bg-white/40 px-4 py-3">
            <span className="text-sm font-medium text-gray-800">Performance analytics</span>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — sign in form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-white px-8">
        <div className="mb-8 text-center lg:hidden">
          <Image
            src="/assets/logo_IgnitED.png"
            alt="IgnitED"
            width={48}
            height={48}
            className="mx-auto mb-2"
          />
          <p className="text-sm text-gray-500">IgnitED Faculty Corner</p>
        </div>

        <div className="w-full max-w-md">
          <LoginForm nextHref={next} />
        </div>
      </div>
    </div>
  );
}
