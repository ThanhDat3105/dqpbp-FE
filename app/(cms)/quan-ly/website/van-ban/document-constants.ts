import type { WebsiteDocument } from "@/lib/mock/website";

export const DOCUMENT_CATEGORIES = [
  { value: "tsqs", label: "Tuyển sinh quân sự" },
  { value: "tuoi17", label: "Tuổi 17" },
  { value: "tinhnguyen", label: "Tình nguyện tham gia NVQS" },
  { value: "dqtt", label: "Dân quân tự vệ" },
  { value: "doituongchinhsach", label: "Đối tượng chính sách" },
  { value: "siquandubi", label: "Sĩ quan dự bị" },
] as const;

export const CATEGORY_TO_SLUG: Record<string, string> = Object.fromEntries(
  DOCUMENT_CATEGORIES.map((c) => [c.label, c.value]),
);

export const CATEGORY_BADGE: Record<string, string> = {
  "Tuyển sinh quân sự": "bg-green-100 text-green-700",
  "Tuổi 17": "bg-blue-100 text-blue-700",
  "Tình nguyện": "bg-yellow-100 text-yellow-700",
  "Dân quân tự vệ": "bg-emerald-100 text-emerald-700",
  tsqs: "bg-green-100 text-green-700",
  tuoi17: "bg-blue-100 text-blue-700",
  tinhnguyen: "bg-yellow-100 text-yellow-700",
  dqtt: "bg-emerald-100 text-emerald-700",
};

export const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  active: { label: "Hiệu lực", color: "text-green-600" },
  expired: { label: "Hết hiệu lực", color: "text-red-500" },
  new: { label: "Mới", color: "text-blue-600" },
};

export const PAGE_SIZE = 10;

export type DocumentForm = Partial<WebsiteDocument> & {
  file?: File | null;
};

export const toDateInputValue = (value?: string) => {
  if (!value) return "";
  const parts = value.split("/");
  if (parts.length !== 3) return value;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};
