"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult = { ok: true } | { ok: false; message: string };

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

async function assertTeacher() {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false as const, message: "You must be signed in.", supabase, user: null };
  }

  const { data: row } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (row?.role !== "teacher") {
    return { ok: false as const, message: "Only teachers can publish blog posts.", supabase, user: null };
  }

  return { ok: true as const, supabase, user };
}

export async function createTeacherBlogPost(input: {
  title: string;
  excerpt: string;
  content: string;
  isPublished: boolean;
}): Promise<ActionResult> {
  const gate = await assertTeacher();
  if (!gate.ok) return { ok: false, message: gate.message };

  const title = input.title.trim();
  const excerpt = input.excerpt.trim();
  const content = input.content.trim();
  if (title.length < 5) return { ok: false, message: "Title should be at least 5 characters." };
  if (excerpt.length < 10) return { ok: false, message: "Excerpt should be at least 10 characters." };
  if (content.length < 40) return { ok: false, message: "Content should be at least 40 characters." };

  const baseSlug = slugify(title);
  if (!baseSlug) return { ok: false, message: "Title cannot generate a valid slug." };
  const uniqueSlug = `${baseSlug}-${Date.now().toString().slice(-6)}`;

  const { error } = await gate.supabase.from("blog_posts").insert({
    teacher_id: gate.user.id,
    title,
    slug: uniqueSlug,
    excerpt,
    content,
    is_published: input.isPublished,
    published_at: input.isPublished ? new Date().toISOString() : null,
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath("/dashboard/teacher/blog");
  revalidatePath("/blog");
  return { ok: true };
}
