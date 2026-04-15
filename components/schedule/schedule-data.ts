export interface OfficeColumn {
  code: string;
  label: string;
}

export interface ScheduleRow {
  date: string;
  commander: string;
  duty_officer: string;
  document_officer: string;
  internal_affairs: string;
  meal_duty: string;
  dqtt_leader: string;
  dqcd_patrol: string[];
  office_duties: Record<string, string>;
}

export interface WeekSchedule {
  officeColumns: OfficeColumn[];
  rows: ScheduleRow[];
  weekId?: string;
  weekNumber?: number;
}


// ─── Helpers ────────────────────────────────────────────────────────────────

/** Format "YYYY-MM-DD" → Date (local midnight) */
export const parseLocalDate = (iso: string): Date => {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
};

/** Get Monday of the week containing `date` */
export const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun … 6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
};

/** Format Date → "DD/MM" */
export const formatDayMonth = (date: Date): string =>
  `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;

/** Format Date → "DD/MM/YYYY" */
export const formatFullDate = (date: Date): string =>
  `${formatDayMonth(date)}/${date.getFullYear()}`;

/** Format Date → "YYYY-MM-DD" */
export const toIsoDate = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

/** ISO week number (ISO 8601) */
export const getIsoWeek = (date: Date): number => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
};

/** Vietnamese day names */
export const VN_DAYS = ["Chủ Nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

