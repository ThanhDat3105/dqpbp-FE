import { axiosInstance } from "@/lib/axios.config";
import type { HotTaskFilter, HotTasksResponse } from "./kpi-types";

type HotTaskParams = {
  filter?: HotTaskFilter;
  period?: string;
  month?: number;
  quarter?: number;
  year?: number;
  from?: string;
  to?: string;
  department_id?: number;
  user_id?: number;
};

export async function getKpiHotTasks(
  params: HotTaskParams & { page?: number; limit?: number },
): Promise<HotTasksResponse> {
  const res = await axiosInstance.get("/api/kpi/hot-tasks", { params });
  return {
    total: res.data?.metaData?.total ?? 0,
    page: res.data?.metaData?.page ?? 1,
    limit: res.data?.metaData?.limit ?? 20,
    data: res.data?.metaData?.data ?? [],
  };
}

export function getKpiHotTasksExportUrl(params: HotTaskParams): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => [k, String(v)]),
  ).toString();
  return `${base}/api/kpi/hot-tasks/export${qs ? `?${qs}` : ""}`;
}
