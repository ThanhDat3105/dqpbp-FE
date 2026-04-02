import { axiosInstance } from "@/lib/axios.config";

export interface User {
  id: number;
  name: string;
  role: "STANDING_MILITIA" | "COMMANDER";
  team: string;
}

const getMe = async (): Promise<User> => {
  const res = await axiosInstance.get("/api/auth/me");

  return res.data.metaData;
};

export const userApi = {
  getMe,
};
