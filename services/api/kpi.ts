import { axiosInstance } from "@/lib/axios.config";

interface ApiEnvelope {
  metaData?: {
    period?: {
      from: string;
      to: string;
    };
    data?: KpiUser[];
  };
}

export type KpiRole = "DQTT" | "DQCD";

export interface KpiUser {
  user_id: number;
  name: string;
  role: KpiRole;
  total_assigned: number;
  completed: number;
  on_time: number;
  cancelled: number;
  completion_rate: number;
  on_time_rate: number;
}

export interface KpiResponse {
  period: {
    from: string;
    to: string;
  };
  data: KpiUser[];
}

export interface KpiRecentTask {
  id: number;
  title: string;
  activity: {
    id: number;
    name: string;
    work_type: string;
  };
  due_date: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
}

const normalizeKpiResponse = (payload: ApiEnvelope): KpiResponse => {
  return {
    period: {
      from: payload.metaData?.period?.from ?? "",
      to: payload.metaData?.period?.to ?? "",
    },
    data: payload.metaData?.data ?? [],
  };
};

export async function getKpiList(params: {
  period: string;
  role?: string;
}): Promise<KpiResponse> {
  const res = await axiosInstance.get("/api/kpi", {
    params,
  });

  return normalizeKpiResponse(res.data);
}

export async function getKpiUser(params: {
  user_id: number;
  period: string;
}): Promise<KpiResponse> {
  const res = await axiosInstance.get("/api/kpi", {
    params,
  });

  return normalizeKpiResponse(res.data);
}

export async function getRecentTasks(params: {
  user_id: number;
  limit?: number;
}): Promise<KpiRecentTask[]> {
  try {
    const res = await axiosInstance.get("/api/activities-task", {
      params: {
        assignee: params.user_id,
        limit: params.limit ?? 5,
        sort: "due_date_desc",
      },
    });

    const source =
      res.data?.metaData?.results ??
      res.data?.metaData?.data ??
      res.data?.metaData ??
      res.data?.data ??
      [];

    if (!Array.isArray(source)) {
      return [];
    }

    return source.map((item: any, index: number) => ({
      id: Number(item.id ?? index + 1),
      title: String(item.title ?? "Nhiem vu"),
      activity: {
        id: Number(item.activity?.id ?? item.activity_id ?? index + 1),
        name: String(
          item.activity?.name ?? item.activity_name ?? item.activity ?? "-",
        ),
        work_type: String(item.activity?.work_type ?? item.work_type ?? "-"),
      },
      due_date: String(item.due_date ?? ""),
      status: String(item.status ?? "pending") as KpiRecentTask["status"],
    }));
  } catch {
    return [];
  }
}

export async function getUserIdsByDepartment(
  departmentCode: string,
): Promise<Set<number>> {
  if (!departmentCode) {
    return new Set<number>();
  }

  const res = await axiosInstance.get("/api/users", {
    params: {
      departmentCode,
    },
  });

  const source = res.data?.metaData ?? res.data?.data ?? [];

  if (!Array.isArray(source)) {
    return new Set<number>();
  }

  return new Set(
    source
      .map((item: any) => Number(item.id))
      .filter((value: number) => Number.isFinite(value)),
  );
}
