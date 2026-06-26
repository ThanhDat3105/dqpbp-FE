// Re-export all KPI API helpers and types from modular files.
// Import directly from the specific file for better tree-shaking.

export type {
  KpiRole,
  KpiUser,
  KpiResponse,
  KpiRecentTask,
  KpiSummary,
  KpiSummaryResponse,
  ActivitySummary,
  KpiTrendPoint,
  KpiTrendResponse,
  KpiDeptStat,
  KpiDeptOverview,
  KpiDepartmentsResponse,
  HotTaskUrgency,
  HotTaskFilter,
  HotTaskAssignee,
  HotTask,
  HotTasksResponse,
  KpiPeriodRange,
} from "./kpi-types";

export {
  getKpiList,
  getKpiUser,
  getKpiSummary,
  getRecentTasks,
  getUserIdsByDepartment,
} from "./kpi-user";

export {
  getActivitySummary,
  getKpiTrend,
  getKpiDepartments,
} from "./kpi-dashboard";

export { getKpiHotTasks, getKpiHotTasksExportUrl } from "./kpi-hot-tasks";
