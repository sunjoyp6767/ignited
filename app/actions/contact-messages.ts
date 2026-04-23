"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export type ContactMessageResult = { ok: true } | { ok: false; message: string };

export async function submitContactMessage(input: {
  name: string;
  email: string;
  message: string;
  sourcePage?: string;
}): Promise<ContactMessageResult> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const message = input.message.trim();
  const sourcePage = (input.sourcePage ?? "contact").trim();

  if (name.length < 2) {
    return { ok: false, message: "Enter a valid name." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "Enter a valid email." };
  }
  if (message.length < 10) {
    return { ok: false, message: "Message should be at least 10 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    message,
    source_page: sourcePage,
    status: "new",
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/dashboard/accountant");
  return { ok: true };
}
