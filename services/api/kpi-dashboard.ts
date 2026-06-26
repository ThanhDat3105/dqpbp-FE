import { axiosInstance } from "@/lib/axios.config";
import type {
  ActivitySummary,
  KpiTrendResponse,
  KpiDepartmentsResponse,
} from "./kpi-types";

type PeriodParams = {
  period?: string;
  month?: number;
  quarter?: number;
  year?: number;
  week?: number;
  from?: string;
  to?: string;
};

export async function getActivitySummary(
  params: Omit<PeriodParams, "week"> & { department_id?: number },
): Promise<ActivitySummary> {
  const res = await axiosInstance.get("/api/kpi/summary", { params });
  const s = res.data?.metaData?.summary;
  const total = Number(s?.total_assigned ?? 0);
  const completed = Number(s?.completed ?? 0);
  const overdue = Number(s?.overdue ?? 0);
  const warning = Number(s?.warning ?? 0);
  const onTime = Number(s?.completed_on_time ?? 0);
  return {
    total,
    completed,
    overdue,
    warning,
    on_time_rate: completed > 0 ? Math.round((onTime / completed) * 100) : 0,
    completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

export async function getKpiTrend(
  params: PeriodParams & { user_id?: number },
): Promise<KpiTrendResponse> {
  const res = await axiosInstance.get("/api/kpi/trend", { params });
  return {
    period: res.data?.metaData?.period ?? { from: "", to: "" },
    trend: res.data?.metaData?.trend ?? [],
  };
}

export async function getKpiDepartments(
  params: Omit<PeriodParams, "week"> & { department_id?: number },
): Promise<KpiDepartmentsResponse> {
  const res = await axiosInstance.get("/api/kpi/departments", { params });
  return {
    period: res.data?.metaData?.period ?? { from: "", to: "" },
    overview: res.data?.metaData?.overview ?? {
      total: 0,
      exceeded: 0,
      achieved: 0,
      warning: 0,
      failed: 0,
      in_progress: 0,
    },
    departments: res.data?.metaData?.departments ?? [],
  };
}
