import { axiosInstance } from "@/lib/axios.config";
import { WebsiteContact } from "@/app/(cms)/quan-ly/website/lien-he/types";

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

const listAdmin = async (
  params: Record<string, string | number>,
): Promise<PaginatedResponse<WebsiteContact>> => {
  const res = await axiosInstance.get("/api/website/admin/contacts", { params });
  return res.data;
};

const markRead = async (id: number): Promise<WebsiteContact> => {
  const res = await axiosInstance.patch(`/api/website/admin/contacts/${id}/read`);
  return res.data;
};

const updateStatus = async (
  id: number,
  status: WebsiteContact["status"],
): Promise<void> => {
  await axiosInstance.patch(`/api/website/admin/contacts/${id}/status`, { status });
};

export const contactAPI = { listAdmin, markRead, updateStatus };
