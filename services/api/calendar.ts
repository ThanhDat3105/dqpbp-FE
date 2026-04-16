import { axiosInstance } from "@/lib/axios.config";
import type { Dayjs } from "dayjs";
import { getDateKey } from "@/utils/dateKey";

export interface CalendarTask {
  task_id: number;
  title: string;
  due_date: string;
  status: "pending" | "completed";
  team: string;
}

export interface CalendarActivity {
  activity_id: number;
  activity_name: string;
  work_group: string;
  tasks: CalendarTask[];
}

export interface CalendarTaskItem {
  task_id: number;
  title: string;
  due_date: string;
  status: "pending" | "completed";
  activity_id: number;
}

export type CalendarMetaData = Record<
  string,
  CalendarActivity[] | CalendarTaskItem[]
>;

// ─── Helper: Normalize API response ────────────────────────────────────────────

/**
 * Normalize the calendar API response by converting metadata keys
 * from "YYYY-MM-DD HH:mm:ss" to "YYYY-MM-DD" format.
 * This ensures frontend grouping matches regardless of timestamp format.
 */
function normalizeCalendarData(rawData: any): CalendarMetaData {
  const normalized: CalendarMetaData = {};

  if (!rawData || typeof rawData !== "object") {
    return normalized;
  }

  // Process each key in the raw metadata
  for (const [key, items] of Object.entries(rawData)) {
    if (!Array.isArray(items)) continue;

    // Normalize metadata key (handle both "YYYY-MM-DD" and "YYYY-MM-DD HH:mm:ss")
    const normalizedKey = getDateKey(key);

    // Ensure array at this key
    if (!normalized[normalizedKey]) {
      normalized[normalizedKey] = [];
    }

    // Add all items maintaining their structure
    normalized[normalizedKey]!.push(...items);
  }

  return normalized;
}

// ─── API calls ────────────────────────────────────────────────────────────────

export const fetchCalendar = async (
  view: string,
  date: Dayjs,
): Promise<CalendarMetaData> => {
  const res = await axiosInstance.get("/api/calendar", {
    params: { view, date: date.format("YYYY-MM-DD") },
  });
  return normalizeCalendarData(res.data.metaData ?? {});
};
