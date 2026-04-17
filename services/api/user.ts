import { axiosInstance } from "@/lib/axios.config";

export interface User {
  id: number;
  name: string;
  role: "DQTT" | "CHI_HUY";
  team: string;
}

export interface UserOption {
  id: number;
  name: string;
  role: string;
  team: string | null;
}

const getMe = async (): Promise<User> => {
  const res = await axiosInstance.get("/api/auth/me");
  return res.data.metaData;
};

export const userApi = {
  getMe,
};

// ─── Users API (for schedule dropdowns) ──────────────────────────────────────

/** GET /api/users?excludeRole=dqcd&isActive=true — for single-select duty fields */
const getDutyUsers = async (): Promise<UserOption[]> => {
  const res = await axiosInstance.get(
    "/api/users?excludeRole=dqcd&isActive=true"
  );
  // BE returns SuccessResponse: { message, status, metaData: UserOption[] }
  return res.data.metaData ?? [];
};

/** GET /api/users?role=dqcd&isActive=true — for dqcd_patrol MultiSelect */
const getDQCDUsers = async (): Promise<UserOption[]> => {
  const res = await axiosInstance.get("/api/users?role=dqcd&isActive=true");
  return res.data.metaData ?? [];
};

export const usersAPI = {
  getDutyUsers,
  getDQCDUsers,
};
