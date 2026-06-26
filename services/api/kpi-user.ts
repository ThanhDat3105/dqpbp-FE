import { axiosInstance } from "@/lib/axios.config";
import type {
  KpiResponse,
  KpiRecentTask,
  KpiSummaryResponse,
  KpiSummary,
} from "./kpi-types";

interface ApiEnvelope {
  metaData?: {
    period?: { from: string; to: string };
    data?: KpiResponse["data"];
  };
}

interface KpiSummaryEnvelope {
  metaData?: {
    period?: { from: string; to: string };
    summary?: KpiSummary;
  };
}

const normalizeKpiResponse = (payload: ApiEnvelope): KpiResponse => ({
  period: {
    from: payload.metaData?.period?.from ?? "",
    to: payload.metaData?.period?.to ?? "",
  },
  data: payload.metaData?.data ?? [],
});

const normalizeKpiSummaryResponse = (
  payload: KpiSummaryEnvelope,
): KpiSummaryResponse => ({
  period: {
    from: payload.metaData?.period?.from ?? "",
    to: payload.metaData?.period?.to ?? "",
  },
  summary: payload.metaData?.summary ?? {
    total_assigned: 0,
    completed: 0,
    completed_on_time: 0,
    completed_late: 0,
    not_completed: 0,
    overdue: 0,
    warning: 0,
    cancelled: 0,
  },
});

export async function getKpiList(params: {
  period: string;
  role?: string;
  department_id?: number;
}): Promise<KpiResponse> {
  const res = await axiosInstance.get("/api/kpi", { params });
  return normalizeKpiResponse(res.data);
}

export async function getKpiUser(params: {
  user_id: number;
  period: string;
}): Promise<KpiResponse> {
  const res = await axiosInstance.get("/api/kpi", { params });
  return normalizeKpiResponse(res.data);
}

export async function getKpiSummary(params: {
  period?: string;
  role?: string;
  user_id?: number;
  from?: string;
  to?: string;
  month?: number;
  quarter?: number;
  year?: number;
}): Promise<KpiSummaryResponse> {
  const res = await axiosInstance.get("/api/kpi/summary", { params });
  return normalizeKpiSummaryResponse(res.data);
}

export async function getRecentTasks(params: {
  user_id: number;
  period?: string;
  limit?: number;
  page?: number;
  from?: string;
  to?: string;
}): Promise<KpiRecentTask[]> {
  try {
    const res = await axiosInstance.get("/api/activities-task", {
      params: {
        assignee: params.user_id,
        period: params.period,
        page: params.page ?? 1,
        limit: params.limit ?? 50,
        from: params.from,
        to: params.to,
        sort: "due_date_desc",
      },
    });

    const source =
      res.data?.metaData?.results ??
      res.data?.metaData?.data ??
      res.data?.metaData ??
      res.data?.data ??
      [];

    if (!Array.isArray(source)) return [];

    return source.map((item: any, index: number) => ({
      id: Number(item.id ?? index + 1),
      title: String(item.title ?? "Nhiệm vụ"),
      activity: {
        id: Number(item.activity?.id ?? item.activity_id ?? index + 1),
        name: String(item.activity?.name ?? item.activity_name ?? "-"),
        work_type: String(item.activity?.work_type ?? item.work_type ?? "-"),
      },
      due_date: String(item.due_date ?? ""),
      status: String(item.status ?? "pending") as KpiRecentTask["status"],
      completed_at: item.completed_at ?? null,
    }));
  } catch {
    return [];
  }
}

export async function getUserIdsByDepartment(
  departmentCode: string,
): Promise<Set<number>> {
  if (!departmentCode) return new Set<number>();

  const res = await axiosInstance.get("/api/users", {
    params: { departmentCode },
  });

  const source = res.data?.metaData ?? res.data?.data ?? [];
  if (!Array.isArray(source)) return new Set<number>();

  return new Set(
    source
      .map((item: any) => Number(item.id))
      .filter((value: number) => Number.isFinite(value)),
  );
}
