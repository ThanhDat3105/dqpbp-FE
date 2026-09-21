import { axiosInstance } from "@/lib/axios.config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MilitaryCvRelative {
  name?: string | null;
  alive?: boolean | null;
  dob?: string | null;
  job?: string | null;
  addr?: string | null;
  label?: "anh" | "chi" | "em" | "" | null;
  gender?: "nam" | "nu" | "" | null;
  adopted?: boolean | null;
  econ?: string | null;
  politics?: string | null;
}

export interface MilitaryCvProfile {
  gender?: "nam" | "nu" | "" | null;
  pob?: string | null;
  hometown?: string | null;
  ethnicity?: string | null;
  religion?: string | null;
  nationality?: string | null;
  home_addr?: string | null;
  curr_addr?: string | null;
  family_class?: string | null;
  self_class?: string | null;
  edu_level?: string | null;
  degree?: string | null;
  language?: string | null;
  major?: string | null;
  party_date?: string | null;
  party_full?: string | null;
  union_date?: string | null;
  reward?: string | null;
  discipline?: string | null;
  job?: string | null;
  salary?: string | null;
  grade?: string | null;
  step?: string | null;
  workplace?: string | null;
  overseas?: string | null;
}

export interface MilitaryCvFamily {
  sibling_count?: number | null;
  son_count?: number | null;
  daughter_count?: number | null;
  birth_order?: number | null;
  child_count?: number | null;
  father?: MilitaryCvRelative | null;
  mother?: MilitaryCvRelative | null;
  spouse?: MilitaryCvRelative | null;
  siblings?: MilitaryCvRelative[] | null;
  children?: MilitaryCvRelative[] | null;
}

export interface MilitaryCvPeriod {
  subject?: "self" | "father" | "mother" | "spouse" | "sibling" | null;
  year_from?: number | null;
  year_to?: number | null;
  note?: string | null;
  econ?: string | null;
  politics?: string | null;
}

export interface MilitaryCvHistory {
  politics?: string | null;
  periods?: MilitaryCvPeriod[] | null;
}

export interface MilitaryCvReview {
  note?: string | null;
  reviewed_at?: string | null;
  signer?: string | null;
  title?: string | null;
}

export interface MilitaryCvReviews {
  police?: MilitaryCvReview | null;
  military?: MilitaryCvReview | null;
  council?: MilitaryCvReview | null;
}

export interface MilitaryCvListItem {
  id: number;
  full_name: string;
  dob: string | null;
  id_no: string | null;
  photo: string | null;
  created_at: string;
  updated_at: string;
}

export interface MilitaryCvRecord extends MilitaryCvListItem {
  profile: MilitaryCvProfile | null;
  family: MilitaryCvFamily | null;
  history: MilitaryCvHistory | null;
  reviews: MilitaryCvReviews | null;
}

export interface MilitaryCvListResponse {
  data: MilitaryCvListItem[];
  page: number;
  limit: number;
  total: number;
}

export interface MilitaryCvEditChange {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}

export interface MilitaryCvEditHistoryItem {
  id: string | number;
  military_cv_id: number;
  actor_id: number | null;
  actor_name: string;
  changes: MilitaryCvEditChange[];
  created_at: string;
}

export interface MilitaryCvEditHistoryResponse {
  data: MilitaryCvEditHistoryItem[];
  page: number;
  limit: number;
  total: number;
}

export interface MilitaryCvListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface MilitaryCvCreatePayload {
  full_name: string;
  dob: string;
  id_no: string;
  photo: string;
  profile: MilitaryCvProfile;
  family: MilitaryCvFamily;
  history: MilitaryCvHistory;
  reviews: MilitaryCvReviews | null;
}

export type MilitaryCvUpdatePayload = Partial<
  Omit<MilitaryCvCreatePayload, "full_name" | "dob" | "id_no" | "photo">
> & {
  full_name?: string | null;
  dob?: string | null;
  id_no?: string | null;
  photo?: string | null;
};

export interface ExportDocxResponse {
  blob: Blob;
  filename: string;
  contentType: string;
}

// ─── API functions ────────────────────────────────────────────────────────────

const getList = async (
  params: MilitaryCvListParams = {},
): Promise<MilitaryCvListResponse> => {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  };

  if (params.search) {
    query.search = params.search;
  }

  const res = await axiosInstance.get("/api/military-cvs/list", {
    params: query,
  });
  return res.data.metaData;
};

const getById = async (id: number): Promise<MilitaryCvRecord> => {
  const res = await axiosInstance.get(`/api/military-cvs/${id}`);
  return res.data.metaData;
};

const getHistory = async (
  id: number,
  params: {
    page?: number;
    limit?: number;
    search?: string;
    field?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {},
): Promise<MilitaryCvEditHistoryResponse> => {
  const res = await axiosInstance.get(`/api/military-cvs/${id}/history`, {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      ...(params.search ? { search: params.search } : {}),
      ...(params.field ? { field: params.field } : {}),
      ...(params.dateFrom ? { dateFrom: params.dateFrom } : {}),
      ...(params.dateTo ? { dateTo: params.dateTo } : {}),
    },
  });
  return res.data.metaData;
};

const create = async (
  payload: MilitaryCvCreatePayload,
): Promise<MilitaryCvRecord> => {
  const res = await axiosInstance.post("/api/military-cvs", payload);
  return res.data.metaData;
};

const update = async (
  id: number,
  payload: MilitaryCvUpdatePayload,
): Promise<MilitaryCvRecord> => {
  const res = await axiosInstance.put(`/api/military-cvs/${id}`, payload);
  return res.data.metaData;
};

// Ký tự không hợp lệ cho tên file trên Windows/macOS.
const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/g;

/**
 * Tên file DOCX theo định dạng `${full_name}_${dob}.docx`.
 * Thiếu họ tên thì lùi về tên cũ theo id.
 */
const formatDobForFilename = (value?: string | null): string => {
  if (!value) return "";

  const trimmed = value.trim();

  // Nếu đã là yyyy-MM-dd thì đổi sang dd-MM-yyyy
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split("-");
    return `${day}-${month}-${year}`;
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) return "";

  return `${day}-${month}-${year}`;
};

const buildExportFilename = (
  id: number,
  fullName?: string | null,
  dob?: string | null,
): string => {
  const name = (fullName ?? "").trim();

  if (!name) {
    return `ly-lich-nghia-vu-quan-su-${id}.docx`;
  }

  const birth = formatDobForFilename(dob);

  const base = birth ? `${name}_${birth}` : name;

  return `${base.replace(INVALID_FILENAME_CHARS, "-")}.docx`;
};

const exportDocx = async (
  id: number,
  fullName: string,
  dob?: string | null,
): Promise<ExportDocxResponse> => {
  const res = await axiosInstance.get<Blob>(`/api/military-cvs/${id}/export`, {
    responseType: "blob",
  });

  const contentType =
    res.headers["content-type"] ||
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  let filename = buildExportFilename(id, fullName, dob);

  const contentDisposition = res.headers["content-disposition"];

  // Server luôn gửi Content-Disposition, nên chỉ dùng tên của server khi
  // client không có họ tên để tự đặt tên file.
  if (!fullName?.trim() && contentDisposition) {
    const filenameStarMatch = contentDisposition.match(
      /filename\*=UTF-8''([^;]+)/i,
    );

    const filenameMatch = contentDisposition.match(/filename="([^"]+)"/i);

    if (filenameStarMatch?.[1]) {
      filename = decodeURIComponent(filenameStarMatch[1]);
    } else if (filenameMatch?.[1]) {
      filename = filenameMatch[1];
    }
  }

  return {
    blob: res.data,
    filename,
    contentType,
  };
};

const exportAllDocx = async (): Promise<Blob> => {
  const res = await axiosInstance.get<Blob>("/api/military-cvs/export", {
    responseType: "blob",
  });

  return res.data;
};

export const militaryCvApi = {
  getList,
  getById,
  getHistory,
  create,
  update,
  exportDocx,
  exportAllDocx,
};

export default militaryCvApi;
