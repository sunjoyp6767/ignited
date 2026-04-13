"use client";

import {
  createTeacherResource,
  deleteTeacherResource,
} from "@/app/actions/teacher-course-resource";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type TeacherResource = {
  id: string;
  file_name: string;
  subject: string;
  file_url: string;
  resource_type: "pdf" | "video";
  uploaded_at: string;
};

type Props = {
  resources: TeacherResource[];
};

export function TeacherResourcesManager({ resources }: Props) {
  const router = useRouter();
  const [topicNode, setTopicNode] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [resourceType, setResourceType] = useState<"pdf" | "video">("pdf");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await createTeacherResource({
        topicNode,
        fileName,
        fileUrl,
        resourceType,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccess("Resource published successfully.");
      setTopicNode("");
      setFileName("");
      setFileUrl("");
      router.refresh();
    });
  }

  function onDelete(resourceId: string) {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await deleteTeacherResource({ resourceId });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccess("Resource removed.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-gray-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-gray-900">Publish resource</h2>
        <p className="mt-1 text-sm text-gray-600">
          Add Google Drive links for PDF or video resources. They appear in student My resources,
          filtered by topic (subject).
        </p>

        <form onSubmit={onCreate} className="mt-4 space-y-4">
          {error ? (
            <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">{error}</p>
          ) : null}
          {success ? (
            <p className="rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
              {success}
            </p>
          ) : null}

          <label className="block max-w-xs space-y-1 text-sm text-gray-700">
            <span>Type</span>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as "pdf" | "video")}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="pdf">PDF</option>
              <option value="video">Video</option>
            </select>
          </label>

          <label className="block space-y-1 text-sm text-gray-700">
            <span>Topic node</span>
            <input
              required
              value={topicNode}
              onChange={(e) => setTopicNode(e.target.value)}
              placeholder="e.g. Kinematics_1.1"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block space-y-1 text-sm text-gray-700">
            <span>Resource title</span>
            <input
              required
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="e.g. Kinematics worked examples"
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <label className="block space-y-1 text-sm text-gray-700">
            <span>Google Drive URL</span>
            <input
              required
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {isPending ? "Publishing..." : "Publish resource"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white">
        <header className="border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Published resources</h2>
        </header>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Link</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {resources.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No resources published yet.
                  </td>
                </tr>
              ) : (
                resources.map((res) => (
                  <tr key={res.id} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-900">{res.file_name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{res.subject}</td>
                    <td className="px-4 py-3 uppercase text-gray-700">{res.resource_type}</td>
                    <td className="px-4 py-3">
                      <a
                        href={res.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 underline underline-offset-2"
                      >
                        Open
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onDelete(res.id)}
                        className="rounded border border-red-300 px-3 py-1 text-xs font-medium text-red-800 hover:bg-red-50"
                      >
                        Delete
                      </button>
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
