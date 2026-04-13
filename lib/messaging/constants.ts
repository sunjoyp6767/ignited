export const CHAT_UPLOADS_BUCKET = "chat-uploads";

/** 5 MiB — keep in sync with storage.buckets.file_size_limit */
export const CHAT_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const CHAT_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;
