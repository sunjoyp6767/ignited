"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type PaymentActionResult =
  | { ok: true }
  | { ok: false; message: string };

async function assertAccountant(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return { ok: false as const, message: "You must be signed in." };
  }
  const { data: row, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  if (error || row?.role !== "accountant") {
    return { ok: false as const, message: "Only accountants can record manual payments." };
  }
  return { ok: true as const };
}

export async function recordManualPayment(input: {
  studentId: string;
  amount: number;
  paymentMethod: "cash" | "online";
}): Promise<PaymentActionResult> {
  const supabase = await createClient();
  const gate = await assertAccountant(supabase);
  if (!gate.ok) return gate;

  if (!input.studentId) {
    return { ok: false, message: "Select a student." };
  }
  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, message: "Enter a valid amount greater than zero." };
  }
  if (input.paymentMethod !== "cash" && input.paymentMethod !== "online") {
    return { ok: false, message: "Invalid payment method." };
  }

  const { data: student, error: studentErr } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", input.studentId)
    .maybeSingle();

  if (studentErr || !student || student.role !== "student") {
    return { ok: false, message: "Target must be an existing student profile." };
  }

  const paidOn = new Date().toISOString().slice(0, 10);

  const { error } = await supabase.from("payments").insert({
    student_id: input.studentId,
    amount: input.amount,
    payment_method: input.paymentMethod,
    paid_on: paidOn,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard/accountant");
  return { ok: true };
}
