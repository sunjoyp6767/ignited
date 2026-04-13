"use client";

import type { ResourceRow } from "@/lib/student/resource-types";
import { Download, Play } from "lucide-react";
import { useMemo, useState } from "react";

type ResourcesFilterProps = {
  resources: ResourceRow[];
};

function formatUploadedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function ResourcesFilter({ resources }: ResourcesFilterProps) {
  const subjects = useMemo(() => {
    const s = new Set<string>();
    for (const r of resources) {
      if (r.subject.trim()) s.add(r.subject.trim());
    }
    return ["All subjects", ...Array.from(s).sort()];
  }, [resources]);

  const [subject, setSubject] = useState("All subjects");
  const [type, setType] = useState<"all" | "pdf" | "video">("all");

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const subOk =
        subject === "All subjects" || r.subject.trim() === subject.trim();
      const typeOk =
        type === "all" ||
        (type === "pdf" && r.resource_type === "pdf") ||
        (type === "video" && r.resource_type === "video");
      return subOk && typeOk;
    });
  }, [resources, subject, type]);

  if (resources.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-600">
        No resources yet. Your teachers will publish materials here.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Subject
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Type
          <select
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
            value={type}
            onChange={(e) => setType(e.target.value as "all" | "pdf" | "video")}
          >
            <option value="all">All</option>
            <option value="pdf">PDF</option>
            <option value="video">Video</option>
          </select>
        </label>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-gray-600">No resources match these filters.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((r) => (
            <li key={r.id}>
              <article className="flex h-full flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <span
                  className={`inline-flex w-fit rounded-full px-3 py-0.5 text-xs font-bold uppercase tracking-wide ${
                    r.resource_type === "pdf"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {r.resource_type === "pdf" ? "PDF" : "VIDEO"}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-gray-900">{r.file_name}</h3>
                <p className="mt-1 text-sm text-gray-500">{r.subject}</p>
                <p className="mt-2 text-xs text-gray-500">{formatUploadedAt(r.uploaded_at)}</p>
                <div className="mt-4 flex flex-1 flex-col justify-end">
                  <a
                    href={r.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-teal-800 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-900"
                  >
                    Open
                    {r.resource_type === "pdf" ? (
                      <Download className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                    ) : (
                      <Play className="size-4 shrink-0" aria-hidden />
                    )}
                  </a>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
