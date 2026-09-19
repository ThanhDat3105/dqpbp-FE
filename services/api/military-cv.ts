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

const exportDocx = async (id: number): Promise<ExportDocxResponse> => {
  const res = await axiosInstance.get<Blob>(`/api/military-cvs/${id}/export`, {
    responseType: "blob",
  });

  const contentType =
    res.headers["content-type"] ||
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  const contentDisposition = res.headers["content-disposition"];

  let filename = `ly-lich-nghia-vu-quan-su-${id}.docx`;

  if (contentDisposition) {
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
  create,
  update,
  exportDocx,
  exportAllDocx,
};

export default militaryCvApi;
