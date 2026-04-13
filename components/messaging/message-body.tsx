"use client";

const URL_SPLIT = /(https?:\/\/[^\s]+)/g;

function isUrl(part: string): boolean {
  return /^https?:\/\//i.test(part);
}

export function MessageBody({ text, linkClassName }: { text: string; linkClassName?: string }) {
  if (!text.trim()) return null;
  const parts = text.split(URL_SPLIT);
  const linkClass = linkClassName ?? "text-blue-700 underline break-all";
  return (
    <p className="whitespace-pre-wrap break-words text-sm">
      {parts.map((part, i) =>
        isUrl(part) ? (
          <a key={i} href={part} target="_blank" rel="noopener noreferrer" className={linkClass}>
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}
