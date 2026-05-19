import { axiosInstance } from "@/lib/axios.config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface QndbPersonnel {
  id: number;
  full_name: string;
  date_of_birth: string;
  permanent_address: string | null;
  phone: string | null;
  education_level: string | null;
  military_rank: string | null;
  unit: string | null;
  service_start_date: string | null;
  service_end_date: string | null;
  reserve_class: "I" | "II" | null;
  note: string | null;
}

export interface QndbPersonnelDetail extends QndbPersonnel {
  temporary_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface QndbListResponse {
  data: QndbPersonnel[];
  total: number;
  page: number;
  limit: number;
}

export interface QndbListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface QndbCreatePayload {
  full_name: string;
  date_of_birth: string;
  permanent_address?: string;
  temporary_address?: string;
  phone?: string;
  education_level?: string;
  military_rank?: string;
  unit?: string;
  service_start_date?: string;
  service_end_date?: string;
  reserve_class?: "I" | "II";
  note?: string;
}

export type QndbUpdatePayload = Partial<QndbCreatePayload>;

// ─── API functions ────────────────────────────────────────────────────────────

const getList = async (params: QndbListParams): Promise<QndbListResponse> => {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  };
  if (params.search) query.search = params.search;
  const res = await axiosInstance.get("/api/qndb/list", { params: query });
  return res.data.metaData;
};

const getById = async (id: number): Promise<QndbPersonnelDetail> => {
  const res = await axiosInstance.get(`/api/qndb/${id}`);
  return res.data.metaData;
};

const create = async (payload: QndbCreatePayload): Promise<QndbPersonnelDetail> => {
  const res = await axiosInstance.post("/api/qndb", payload);
  return res.data.metaData;
};

const update = async (id: number, payload: QndbUpdatePayload): Promise<QndbPersonnelDetail> => {
  const res = await axiosInstance.put(`/api/qndb/${id}`, payload);
  return res.data.metaData;
};

const remove = async (id: number): Promise<{ deleted_id: number }> => {
  const res = await axiosInstance.delete(`/api/qndb/${id}`);
  return res.data.metaData;
};

export const qndbApi = { getList, getById, create, update, remove };
