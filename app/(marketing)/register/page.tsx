import { RegisterForm } from "@/components/auth/register-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register",
  description: "Create an IgnitED Faculty Corner account.",
};

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6">
      <RegisterForm />
    </div>
  );
}
