"use client";

import { sendMessage } from "@/app/actions/messages";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageBody } from "./message-body";

export type ThreadMessage = {
  id: string;
  sender_id: string;
  body: string;
  imageUrl: string | null;
  created_at: string;
};

export function MessageThread({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: ThreadMessage[];
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const body = String(formData.get("body") ?? "");
    const fileEntry = formData.get("image");
    const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;

    const result = await sendMessage({
      conversationId,
      body,
      image: file,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    form.reset();
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex min-h-[240px] flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
        {initialMessages.length === 0 ? (
          <li className="text-sm text-gray-500">No messages yet. Say hello or share a meeting link.</li>
        ) : (
          initialMessages.map((m) => {
            const mine = m.sender_id === currentUserId;
            return (
              <li key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[min(85%,28rem)] rounded-lg px-3 py-2 ${
                    mine ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-900"
                  }`}
                >
                  {m.body.trim() ? (
                    <MessageBody
                      text={m.body}
                      linkClassName={mine ? "text-sky-300 underline break-all" : "text-blue-700 underline break-all"}
                    />
                  ) : null}
                  {m.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- signed URL from Supabase Storage
                    <img
                      src={m.imageUrl}
                      alt=""
                      className={`mt-2 max-h-48 rounded border ${mine ? "border-gray-600" : "border-gray-200"}`}
                    />
                  ) : null}
                  <p className={`mt-1 text-xs ${mine ? "text-gray-400" : "text-gray-500"}`}>
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
              </li>
            );
          })
        )}
      </ul>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <label className="text-xs font-medium text-gray-700">
          Message
          <textarea
            name="body"
            rows={3}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            placeholder="Type a message or paste a meeting link…"
          />
        </label>
        <label className="text-xs font-medium text-gray-700">
          Image (optional)
          <input
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="mt-1 block w-full text-sm text-gray-700"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
