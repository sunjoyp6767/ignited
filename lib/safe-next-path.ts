/**
 * Returns a safe in-app path for redirects (blocks protocol-relative and external URLs).
 */
export function safeNextPath(input: string | undefined, fallback: string): string {
  if (!input || !input.startsWith("/") || input.startsWith("//")) {
    return fallback;
  }
  return input;
}
