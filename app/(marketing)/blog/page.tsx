import type { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog",
  description: "News and articles from IgnitED Faculty Corner.",
};

export default async function BlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, content, published_at, created_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:py-14">
      <header className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Blog</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
          Articles and exam tips
        </h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          Teacher-written guidance for Cambridge and Edexcel students and parents.
        </p>
      </header>

      <section className="mt-6 space-y-4">
        {(posts ?? []).length === 0 ? (
          <div className="rounded-lg border border-stone-200 bg-white px-4 py-8 text-center text-sm text-stone-600">
            No published articles yet.
          </div>
        ) : (
          (posts ?? []).map((post) => (
            <article key={post.id} className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-stone-500">
                Published{" "}
                {new Date(post.published_at ?? post.created_at).toLocaleDateString("en-GB")}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-stone-900">{post.title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{post.excerpt}</p>
              <p className="mt-3 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-stone-700">
                {post.content}
              </p>
              <Link
                href={`/blog#${post.slug}`}
                className="mt-3 inline-block text-sm font-semibold text-teal-800 hover:underline"
              >
                Continue reading →
              </Link>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
