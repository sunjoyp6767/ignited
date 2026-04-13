import type { SupabaseClient } from "@supabase/supabase-js";
import { CHAT_UPLOADS_BUCKET } from "./constants";

export async function signChatImagePaths(
  supabase: SupabaseClient,
  paths: (string | null | undefined)[]
): Promise<(string | null)[]> {
  const out: (string | null)[] = [];
  for (const p of paths) {
    if (!p) {
      out.push(null);
      continue;
    }
    const { data, error } = await supabase.storage.from(CHAT_UPLOADS_BUCKET).createSignedUrl(p, 3600);
    out.push(error ? null : (data?.signedUrl ?? null));
  }
  return out;
}
