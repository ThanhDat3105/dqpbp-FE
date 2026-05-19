import { axiosInstance } from "@/lib/axios.config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NguonPersonnel {
  id: number;
  full_name: string;
  date_of_birth: string;
  permanent_address: string | null;
  phone: string | null;
  education_level: string | null;
  youth_personnel_id: number | null;
  note: string | null;
}

export interface NguonPersonnelDetail extends NguonPersonnel {
  temporary_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface NguonListResponse {
  data: NguonPersonnel[];
  total: number;
  page: number;
  limit: number;
}

export interface NguonListParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface NguonCreatePayload {
  full_name: string;
  date_of_birth: string;
  permanent_address?: string;
  temporary_address?: string;
  phone?: string;
  education_level?: string;
  youth_personnel_id?: number;
  note?: string;
}

export type NguonUpdatePayload = Partial<Omit<NguonCreatePayload, "youth_personnel_id">>;

// ─── API functions ────────────────────────────────────────────────────────────

const getList = async (params: NguonListParams): Promise<NguonListResponse> => {
  const query: Record<string, string | number> = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
  };
  if (params.search) query.search = params.search;
  const res = await axiosInstance.get("/api/nguon/list", { params: query });
  return res.data.metaData;
};

const getById = async (id: number): Promise<NguonPersonnelDetail> => {
  const res = await axiosInstance.get(`/api/nguon/${id}`);
  return res.data.metaData;
};

const create = async (payload: NguonCreatePayload): Promise<NguonPersonnelDetail> => {
  const res = await axiosInstance.post("/api/nguon", payload);
  return res.data.metaData;
};

const update = async (id: number, payload: NguonUpdatePayload): Promise<NguonPersonnelDetail> => {
  const res = await axiosInstance.put(`/api/nguon/${id}`, payload);
  return res.data.metaData;
};

const remove = async (id: number): Promise<{ deleted_id: number }> => {
  const res = await axiosInstance.delete(`/api/nguon/${id}`);
  return res.data.metaData;
};

export const nguonApi = { getList, getById, create, update, remove };
