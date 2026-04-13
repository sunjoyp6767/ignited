export type ResourceRow = {
  id: string;
  teacher_id: string;
  file_name: string;
  subject: string;
  file_url: string;
  resource_type: "pdf" | "video";
  uploaded_at: string;
};
