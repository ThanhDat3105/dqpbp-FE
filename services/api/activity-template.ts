import { axiosInstance } from "@/lib/axios.config";

export interface TemplateTaskInterface {
  id?: number;
  title: string;
  team: string[];
  assignees: string[];
  notes: string | null;
  report_fields: { name: string; value?: string }[];
  requires_dqcd: boolean;
  display_order?: number;
}

export interface ActivityTemplateInterface {
  id: number;
  name: string;
  description: string | null;
  work_type: string | null;
  department: string | null;
  location: string | null;
  document_number: string | null;
  status: "active" | "inactive";
  created_by: string;
  created_at: string;
  updated_at: string;
  tasks: TemplateTaskInterface[];
  task_count?: number;
}

export interface CreateTemplatePayload {
  name: string;
  description?: string;
  work_type?: string;
  department?: string;
  location?: string;
  document_number?: string;
  status?: "active" | "inactive";
  tasks: Omit<TemplateTaskInterface, "id">[];
}

export interface UpdateTemplatePayload extends Partial<CreateTemplatePayload> {}

export interface GetTemplatesParams {
  page?: number;
  limit?: number;
  status?: string;
  work_type?: string;
  department?: string;
  search?: string;
}

export interface PaginatedTemplates {
  results: ActivityTemplateInterface[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateActivityFromTemplatePayload {
  name: string;
  start_date: string;
  end_date: string;
  work_type?: string;
  department?: string;
  location?: string;
  document_number?: string;
  status?: string;
}

const getTemplates = async (
  params: GetTemplatesParams = {},
): Promise<PaginatedTemplates> => {
  const res = await axiosInstance.get("/api/activity-templates", { params });
  return res.data.metaData;
};

const getTemplateById = async (
  id: number,
): Promise<ActivityTemplateInterface> => {
  const res = await axiosInstance.get(`/api/activity-templates/${id}`);
  return res.data.metaData;
};

const createTemplate = async (
  payload: CreateTemplatePayload,
): Promise<ActivityTemplateInterface> => {
  const res = await axiosInstance.post("/api/activity-templates", payload);
  return res.data.metaData;
};

const updateTemplate = async (
  id: number,
  payload: UpdateTemplatePayload,
): Promise<ActivityTemplateInterface> => {
  const res = await axiosInstance.put(`/api/activity-templates/${id}`, payload);
  return res.data.metaData;
};

const deleteTemplate = async (id: number): Promise<void> => {
  await axiosInstance.delete(`/api/activity-templates/${id}`);
};

const createTemplateFromActivity = async (
  activityId: string,
  payload: { name?: string; description?: string; status?: string },
): Promise<ActivityTemplateInterface> => {
  const res = await axiosInstance.post(
    `/api/activity-templates/from-activity/${activityId}`,
    payload,
  );
  return res.data.metaData;
};

const createActivityFromTemplate = async (
  templateId: number,
  payload: CreateActivityFromTemplatePayload,
) => {
  const res = await axiosInstance.post(
    `/api/activity-templates/${templateId}/create-activity`,
    payload,
  );
  return res.data.metaData;
};

export const activityTemplateAPI = {
  getTemplates,
  getTemplateById,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  createTemplateFromActivity,
  createActivityFromTemplate,
};
