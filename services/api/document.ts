import { axiosInstance } from "@/lib/axios.config";

export interface DocumentItem {
  id: number;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  is_public: boolean;
  uploaded_by: number;
  department_id: number;
  department_code: string | null;
  department_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentListResponse {
  data: DocumentItem[];
  page: number;
  limit: number;
  total: number;
}

export interface FetchDocumentsParams {
  page?: number;
  limit?: number;
  search?: string;
  departmentId?: number | null;
  departmentCode?: string | null;
  isPublic?: boolean | null;
}

export interface UploadDocumentPayload {
  title: string;
  description?: string;
  department_id?: number;
  is_public?: boolean;
}

const fetchList = async (params: FetchDocumentsParams): Promise<DocumentListResponse> => {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.departmentId != null) query.set("departmentId", String(params.departmentId));
  if (params.departmentCode) query.set("departmentCode", params.departmentCode);
  if (params.isPublic != null) query.set("isPublic", String(params.isPublic));

  const res = await axiosInstance.get(`/api/documents?${query.toString()}`);
  return res.data.metaData;
};

const upload = async (file: File, payload: UploadDocumentPayload): Promise<DocumentItem> => {
  const form = new FormData();
  form.append("file", file);
  form.append("title", payload.title);
  if (payload.description) form.append("description", payload.description);
  if (payload.department_id != null) form.append("department_id", String(payload.department_id));
  if (payload.is_public != null) form.append("is_public", String(payload.is_public));

  const res = await axiosInstance.post("/api/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.metaData;
};

export interface UpdateDocumentPayload {
  title?: string;
  description?: string;
  department_id?: number;
  is_public?: boolean;
}

const update = async (id: number, file: File | null, payload: UpdateDocumentPayload): Promise<DocumentItem> => {
  const form = new FormData();
  if (file) form.append("file", file);
  if (payload.title !== undefined) form.append("title", payload.title);
  if (payload.description !== undefined) form.append("description", payload.description);
  if (payload.department_id != null) form.append("department_id", String(payload.department_id));
  if (payload.is_public != null) form.append("is_public", String(payload.is_public));

  const res = await axiosInstance.put(`/api/documents/${id}`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.metaData;
};

const remove = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/documents/${id}`);
};

export const documentAPI = { fetchList, upload, update, remove };
