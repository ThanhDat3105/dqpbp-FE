import { axiosInstance } from "@/lib/axios.config";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface YouthPersonnel {
    id: number;
    full_name: string;
    date_of_birth: string; // ISO date string
    permanent_address: string | null;
    phone: string | null;
    education_level: string | null;
    is_registered: boolean;
}

export interface YouthPersonnelDetail extends YouthPersonnel {
    temporary_address: string | null;
    created_at: string;
    updated_at: string;
}

export interface YouthListResponse {
    data: YouthPersonnel[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}

export interface YouthListParams {
    page?: number;
    limit?: number;
    search?: string;
    is_registered?: boolean | "";
}

export interface YouthCreatePayload {
    full_name: string;
    date_of_birth: string;
    permanent_address?: string;
    temporary_address?: string;
    phone?: string;
    education_level?: string;
    is_registered?: boolean;
}

export type YouthUpdatePayload = Partial<YouthCreatePayload>;

// ─── API functions ────────────────────────────────────────────────────────────

const getList = async (params: YouthListParams): Promise<YouthListResponse> => {
    const query: Record<string, string | number | boolean> = {
        page: params.page ?? 1,
        limit: params.limit ?? 10,
    };
    if (params.search) query.search = params.search;
    if (params.is_registered !== "" && params.is_registered !== undefined) {
        query.is_registered = params.is_registered;
    }
    const res = await axiosInstance.get("/api/youth/list", { params: query });
    return res.data.metaData;
};

const getById = async (id: number): Promise<YouthPersonnelDetail> => {
    const res = await axiosInstance.get(`/api/youth/${id}`);
    return res.data.metaData;
};

const create = async (payload: YouthCreatePayload): Promise<YouthPersonnelDetail> => {
    const res = await axiosInstance.post("/api/youth", payload);
    return res.data.metaData;
};

const update = async (id: number, payload: YouthUpdatePayload): Promise<YouthPersonnelDetail> => {
    const res = await axiosInstance.put(`/api/youth/${id}`, payload);
    return res.data.metaData;
};

const remove = async (id: number): Promise<{ deleted_id: number }> => {
    const res = await axiosInstance.delete(`/api/youth/${id}`);
    return res.data.metaData;
};

export const youthApi = { getList, getById, create, update, remove };
