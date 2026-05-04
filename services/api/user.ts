import { axiosInstance } from "@/lib/axios.config";
import { User } from "./auth";
import { UserDetailInterface } from "@/types/user";
import qs from "qs";

export interface UserOption {
  id: number;
  name: string;
  role: string;
  department: string | null;
}

export interface KpiData {
  kpi_total_assigned: number;
  kpi_completed: number;
  kpi_on_time: number;
  kpi_cancelled: number;
  kpi_completion_rate: number | null;
  kpi_on_time_rate: number | null;
}

export interface UserWithKpi extends UserDetailInterface {
  kpi_total_assigned: number;
  kpi_completed: number;
  kpi_on_time: number;
  kpi_cancelled: number;
  kpi_completion_rate: number | null;
  kpi_on_time_rate: number | null;
  department_name?: string | null;
}

const toNumber = (value: unknown, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toNullableNumber = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeUser = (item: any): UserWithKpi => {
  const isActive = Boolean(item?.is_active);

  return {
    id: toNumber(item?.id),
    name: String(item?.name ?? ""),
    address: item?.address ?? null,
    phone: item?.phone ?? null,
    email: item?.email ?? null,
    role: String(item?.role ?? ""),
    is_active: isActive,
    unit_code: item?.unit_code ?? null,
    status: item?.status ?? (isActive ? "on_duty" : "other"),
    department_id: toNumber(item?.department_id),
    date_of_birth: item?.date_of_birth ?? null,
    enlistment_date: item?.enlistment_date ?? null,
    military_rank: item?.military_rank ?? null,
    avatar_url: item?.avatar_url ?? null,
    kpi_total_assigned: toNumber(item?.kpi_total_assigned),
    kpi_completed: toNumber(item?.kpi_completed),
    kpi_on_time: toNumber(item?.kpi_on_time),
    kpi_cancelled: toNumber(item?.kpi_cancelled),
    kpi_completion_rate: toNullableNumber(item?.kpi_completion_rate),
    kpi_on_time_rate: toNullableNumber(item?.kpi_on_time_rate),
    department_name: item?.department_name ?? null,
  };
};

export async function fetchUsers(
  params?: {
    role?: string;
    search?: string;
    status?: string;
    includeKpi?: boolean;
  },
  token?: string,
): Promise<UserWithKpi[]> {
  const query = new URLSearchParams();

  if (params?.role && params.role !== "Tất cả") {
    query.set("role", params.role);
  }

  if (params?.search) {
    query.set("search", params.search);
  }

  if (params?.status && params.status !== "all") {
    query.set("status", params.status);
  }

  if (params?.includeKpi) {
    query.set("includeKpi", "true");
  }

  const res = await axiosInstance.get(`/api/users?${query.toString()}`);

  return res.data.data.map((item: any) => normalizeUser(item));
}

export async function fetchUserDetail(id: number): Promise<UserWithKpi> {
  const res = await axiosInstance.get(`/api/users/${id}?includeKpi=true`);

  return normalizeUser(res.data.data);
}

const getMe = async (): Promise<User> => {
  const res = await axiosInstance.get("/api/auth/me");
  return res.data.metaData;
};

export const userApi = {
  getMe,
};

const getDutyUsers = async (): Promise<UserOption[]> => {
  const res = await axiosInstance.get(
    "/api/users?excludeRole=dqcd&isActive=true",
  );
  // BE returns SuccessResponse: { message, status, metaData: UserOption[] }
  return res.data.metaData ?? [];
};

const getAllUser = async (params: {
  departmentCode: string[];
  role?: string;
}): Promise<UserOption[]> => {
  const res = await axiosInstance.get("/api/users", {
    params: {
      departmentCode: [params.departmentCode],
      role: params.role,
    },
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: "repeat" }),
  });

  return res.data.data ?? [];
};

const getDQCDUsers = async (): Promise<UserOption[]> => {
  const res = await axiosInstance.get("/api/users?role=dqcd&isActive=true");
  return res.data.metaData ?? [];
};

const getAvailableUsers = async (params: {
  start_date: string;
  end_date: string;
}): Promise<UserOption[]> => {
  const res = await axiosInstance.get("/api/users/getAvailableUsers", {
    params,
  });
  return res.data.data ?? [];
};

export const usersAPI = {
  getDutyUsers,
  getDQCDUsers,
  getAllUser,
  getAvailableUsers,
  assignDQCD: async (taskId: number, userIds: string[]): Promise<void> => {
    await axiosInstance.post(
      `/api/activities-task/tasks/${taskId}/assign-dqcd`,
      {
        user_ids: userIds,
      },
    );
  },
};
