import { axiosInstance } from "@/lib/axios.config";

export interface LoginResponse {
  message: string;
  status: number;
  metaData: {
    token: Token;
    user: User;
  };
}

export interface Token {
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: number;
  name: string;
  role: "DQTT" | "CHI_HUY" | "TO_TRUONG" | "DQCD";
  team: string;
}

const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  const res = await axiosInstance.post("/api/auth/login", {
    email,
    password,
  });

  return res.data;
};

const logout = async () => {
  const res = await axiosInstance.post("/api/auth/logout");

  return res.data;
};

export const authApi = {
  login,
  logout,
};
