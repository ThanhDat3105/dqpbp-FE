// Shared KPI types used across kpi-user.ts, kpi-dashboard.ts, kpi-hot-tasks.ts

export type KpiRole = "DQTT" | "DQCD";
export type HotTaskUrgency = "overdue" | "warning";
export type HotTaskFilter = "overdue" | "warning" | "all";

export interface KpiPeriodRange {
  from: string;
  to: string;
}

// ─── User KPI ─────────────────────────────────────────────────────────────────

export interface KpiUser {
  user_id: number;
  name: string;
  role: KpiRole;
  total_assigned: number;
  completed: number;
  on_time: number;
  overdue: number;
  cancelled: number;
  completion_rate: number;
  on_time_rate: number;
}

export interface KpiResponse {
  period: KpiPeriodRange;
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
  completed_at?: string | null;
}

export interface KpiSummary {
  total_assigned: number;
  completed: number;
  completed_on_time: number;
  completed_late: number;
  not_completed: number;
  overdue: number;
  warning: number;
  cancelled: number;
}

export interface KpiSummaryResponse {
  period: KpiPeriodRange;
  summary: KpiSummary;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface ActivitySummary {
  total: number;
  completed: number;
  overdue: number;
  warning: number;
  on_time_rate: number;
  completion_rate: number;
}

export interface KpiTrendPoint {
  week_label: string;
  week_start: string;
  created: number;
  completed: number;
}

export interface KpiTrendResponse {
  period: KpiPeriodRange;
  trend: KpiTrendPoint[];
}

export interface KpiDeptStat {
  department_id: number | null;
  department_code: string | null;
  department_name: string;
  total: number;
  exceeded: number;
  achieved: number;
  warning: number;
  failed: number;
  in_progress: number;
}

export interface KpiDeptOverview {
  total: number;
  exceeded: number;
  achieved: number;
  warning: number;
  failed: number;
  in_progress: number;
}

export interface KpiDepartmentsResponse {
  period: KpiPeriodRange;
  overview: KpiDeptOverview;
  departments: KpiDeptStat[];
}

// ─── Hot Tasks ────────────────────────────────────────────────────────────────

export interface HotTaskAssignee {
  user_id: number;
  user_name: string;
  user_initials: string;
  department_id: number | null;
  department_name: string;
}

export interface HotTask {
  task_id: number;
  task_title: string;
  activity_id: number;
  activity_name: string;
  due_date: string;
  status: "pending" | "in_progress";
  urgency: HotTaskUrgency;
  assignees: HotTaskAssignee[];
}

export interface HotTasksResponse {
  total: number;
  page: number;
  limit: number;
  data: HotTask[];
}
