"use client";

import { createTeacherBlogPost } from "@/app/actions/teacher-blog";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
};

export function TeacherBlogManager({ posts }: { posts: BlogRow[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await createTeacherBlogPost({ title, excerpt, content, isPublished });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccess("Blog post saved.");
      setTitle("");
      setExcerpt("");
      setContent("");
      setIsPublished(true);
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">Write blog article</h2>
        <p className="mt-1 text-sm text-gray-600">Publish exam tips and guidance for students and parents.</p>
        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          {error ? (
            <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>
          ) : null}
          {success ? (
            <p className="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">{success}</p>
          ) : null}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short excerpt"
            rows={2}
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Article content and exam tips"
            rows={8}
            required
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
            Publish now
          </label>
          <div>
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              {isPending ? "Saving..." : "Save post"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <header className="border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600">My blog posts</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No blog posts yet.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 font-medium text-gray-900">{post.title}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{post.slug}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full border border-gray-300 bg-white px-2 py-0.5 text-xs">
                        {post.is_published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {new Date(post.created_at).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
