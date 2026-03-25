import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const createAxiosInstance = (tokenKey: string) => {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 20000,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });

  instance.interceptors.request.use(
    (config) => {
      const token = Cookies.get(tokenKey);
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const customError = {
        message: "Something went wrong",
        status: error.response?.status || "NETWORK_ERROR",
        data: error.response?.data || null,
        originalError: error,
      };

      if (error.response) {
        switch (error.response.status) {
          case 401:
            if (error.response.data?.message === "No admin token provided") {
              // window.location.href = '/admin/login';
            }

            customError.message =
              "Unauthorized - token hết hạn hoặc không hợp lệ";
            Cookies.remove(tokenKey);
            break;
          case 404:
            customError.message = "Resource not found";
            break;
          case 500:
            customError.message = "Server error";
            break;
          default:
            customError.message =
              error.response.data?.message || "Request failed";
        }
      } else if (error.request) {
        customError.message = "No response from server";
      }

      console.error("API Request Failed:", customError);
      return Promise.reject(customError);
    },
  );

  return instance;
};

export const axiosInstance = createAxiosInstance("authToken");
export const axiosInstanceAdmin = createAxiosInstance("adminAuthToken");
