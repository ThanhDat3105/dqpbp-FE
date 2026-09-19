import { axiosInstance } from "@/lib/axios.config";

interface KpiTargetTeam {
  id: number;
  name: string;
}

interface KpiTargetCreatedBy {
  id: number;
  name: string;
  email: string;
  role: string;
  departmentId: number;
}

interface KpiTargetAllocation {
  id: number;
  periodType: "Q" | "M";
  periodNo: number;
  targetValue: number;
}

export interface KpiTargetLine {
  id: number;
  name: string;
  yearTarget: number;
  allocations: KpiTargetAllocation[];
}

type KpiTargetStatus = "ACTIVE";

export interface KpiTargetInterface {
  id: number;
  teamId: number;
  team: KpiTargetTeam;
  teamName: string;
  periodFrom: string;
  periodTo: string;
  status: KpiTargetStatus;
  createdBy: KpiTargetCreatedBy;
  createdAt: string;
  updatedAt: string;
  lines: KpiTargetLine[];
  lineCount: number;
  outOfTargetCount: number;
}

const getAllKpiTargets = async (
  teamId: number,
): Promise<KpiTargetInterface[]> => {
  const res = await axiosInstance.get(`/api/kpi-target`, {
    params: {
      teamId,
    },
  });

  return res.data.metaData.items;
};

// ─── Thống kê chỉ tiêu KPI theo tổ ────────────────────────────────────────────

export type KpiScopeType = "all" | "year" | "quarter" | "month";

export type KpiProgressStatus =
  | "achieved"
  | "on_track"
  | "at_risk"
  | "behind"
  | "not_started";

export interface KpiActivityStats {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  late: number;
  onTime: number;
}

export interface KpiPeriodStat {
  periodNo: number;
  target: number;
  assigned: number;
  achieved: number;
  lateCount: number;
  remaining: number;
  completionRate: number;
}

export interface KpiStatisticsLine {
  id: number;
  kpiTargetId: number;
  name: string;
  target: number;
  yearTarget: number;
  achieved: number;
  remaining: number;
  completionRate: number;
  expected: number;
  progressStatus: KpiProgressStatus;
  lateCount: number;
  onTimeRate: number;
  activityStats: KpiActivityStats;
  quarters: KpiPeriodStat[];
  months: KpiPeriodStat[];
}

export interface KpiStatisticsTeam {
  targetId: number;
  teamId: number;
  teamName: string;
  team: KpiTargetTeam;
  periodFrom: string;
  periodTo: string;
  status: KpiTargetStatus;
  rank: number;
  lineCount: number;
  target: number;
  yearTarget: number;
  achieved: number;
  remaining: number;
  completionRate: number;
  expected: number;
  progressStatus: KpiProgressStatus;
  lateCount: number;
  onTimeRate: number;
  outOfTargetCount: number;
  activityStats: KpiActivityStats;
  lines: KpiStatisticsLine[];
}

export interface KpiStatisticsScope {
  type: KpiScopeType;
  year: number | null;
  periodNo: number | null;
  from: string | null;
  to: string | null;
}

export interface KpiStatisticsSummary {
  teamCount: number;
  targetCount: number;
  lineCount: number;
  target: number;
  yearTarget: number;
  achieved: number;
  remaining: number;
  completionRate: number;
  expected: number;
  lateCount: number;
  onTimeRate: number;
  outOfTargetCount: number;
  activityStats: KpiActivityStats;
}

export interface KpiStatisticsResponse {
  filters: Record<string, string | number | null>;
  scope: KpiStatisticsScope;
  summary: KpiStatisticsSummary;
  teams: KpiStatisticsTeam[];
}

export interface KpiStatisticsParams {
  year?: number;
  quarter?: number;
  month?: number;
  teamId?: number;
  status?: string;
  search?: string;
}

const getKpiTargetStatistics = async (
  params: KpiStatisticsParams = {},
): Promise<KpiStatisticsResponse> => {
  const res = await axiosInstance.get(`/api/kpi-target/statistics`, { params });

  return res.data.metaData;
};

export const kpiTargetAPI = {
  getAllKpiTargets,
  getKpiTargetStatistics,
};
