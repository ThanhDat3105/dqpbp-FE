import type { Dayjs } from "dayjs";

// ─── View Modes ───────────────────────────────────────────────────────────────
export type ViewMode = "day" | "week" | "month";

// ─── Data Types ───────────────────────────────────────────────────────────────

/**
 * Backend returns due_date as "YYYY-MM-DD HH:mm:ss"
 * Frontend normalizes metadata keys to "YYYY-MM-DD" for grouping
 * See: @/utils/dateKey for normalization helper
 */
export interface CalendarTask {
  task_id: number;
  title: string;
  due_date: string; // Format: "YYYY-MM-DD HH:mm:ss" from API
  status: "pending" | "done";
  team: string;
}

export interface CalendarActivity {
  activity_id: number;
  activity_name: string;
  work_group: string;
  tasks: CalendarTask[];
}

/**
 * Backend returns due_date as "YYYY-MM-DD HH:mm:ss"
 * Frontend normalizes metadata keys to "YYYY-MM-DD" for grouping
 * See: @/utils/dateKey for normalization helper
 */
export interface CalendarTaskItem {
  task_id: number;
  title: string;
  due_date: string; // Format: "YYYY-MM-DD HH:mm:ss" from API
  status: "pending" | "done";
  activity_id: number;
}

export type DayData = CalendarActivity[] | CalendarTaskItem[];
/**
 * CalendarMetaData keys are normalized to "YYYY-MM-DD" format
 * by the calendar API layer (@/service/API/calendar.api.ts)
 * This ensures consistent grouping regardless of backend timestamp format
 */
export type CalendarMetaData = Record<string, DayData>;

// ─── Type Guards ─────────────────────────────────────────────────────────────

export function isActivityList(data: DayData): data is CalendarActivity[] {
  if (!data || data.length === 0) return false;
  return "activity_id" in data[0] && "activity_name" in data[0];
}

export function isTaskItemList(data: DayData): data is CalendarTaskItem[] {
  if (!data || data.length === 0) return false;
  return "task_id" in data[0] && !("activity_name" in data[0]);
}

// ─── Context / Props ─────────────────────────────────────────────────────────

export interface CalendarContextValue {
  viewMode: ViewMode;
  currentDate: Dayjs;
  data: CalendarMetaData;
  role: string;
  isLoading: boolean;
  setViewMode: (mode: ViewMode) => void;
  navigate: (direction: "prev" | "next") => void;
  goToday: () => void;
}
