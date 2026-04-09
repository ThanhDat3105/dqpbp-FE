export interface ScheduleRow {
  /** ISO date string for that day */
  date: string;
  /** Trực chỉ huy */
  commander: string;
  /** Trực ban */
  duty_officer: string;
  /** Trực công văn */
  document_officer: string;
  /** Trực nội vụ */
  internal_affairs: string;
  /** Trực cơm */
  meal_duty: string;
  /** Trực trụ sở HĐND-UBND; Đảng uỷ */
  office_duty: string;
  /** DQTT phụ trách A */
  dqtt_leader: string;
  /** DQCD trực – Tuần tra (comma-separated codes) */
  dqcd_patrol: string;
}

export interface WeekSchedule {
  /** YYYY-WW, e.g. "2026-15" */
  weekId: string;
  weekNumber: number;
  startDate: string; // ISO date
  endDate: string;   // ISO date
  rows: ScheduleRow[];
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

// ─── Mock data generator ─────────────────────────────────────────────────────

const MOCK_COMMANDERS = [
  "Ngô Trương Định", "Lý Triệu An", "Phạm Gia Bảo", "Đoàn Quốc Đạt",
  "Phan Phong Phú", "Lại Tu Trung", "Võ Công Minh",
];
const MOCK_DUTY = [
  "Ngô Hoài Bảo", "Nguyễn Lý Minh Quang", "Lâm Ngọc Huyền", "Nguyễn Thanh Nhân",
  "Vương Quý Thắng", "Lưu Vĩnh Cơ", "Hoàng Phạm Thế Lộc",
];
const MOCK_DOC = [
  "Nguyễn Thành Tài", "Trần Hoàng Phi", "Lê Hải Triều", "Nguyễn Thanh Nhân",
  "Lý Triệu An", "Phạm Gia Bảo", "Đoàn Quốc Đạt",
];
const MOCK_INTERNAL = [
  "Vương Quý Thắng", "Lưu Vĩnh Cơ", "Hoàng Phạm Thế Lộc", "Ngô Trương Định",
  "Lý Triệu An", "Ngô Hoài Bảo", "Phan Phong Phú",
];
const MOCK_MEAL = [
  "Lê Hải Triều", "Nguyễn Thành Tài", "Trần Hoàng Phi", "Phạm Gia Bảo",
  "Lâm Ngọc Huyền", "Lại Tu Trung", "Võ Công Minh",
];
const MOCK_OFFICE = [
  "Đoàn Quốc Đạt", "Phan Phong Phú", "Vương Quý Thắng", "Lưu Vĩnh Cơ",
  "Hoàng Phạm Thế Lộc", "Lê Hải Triều", "Nguyễn Thành Tài",
];
const MOCK_DQTT = [
  "Trần Hoàng Phi", "Lý Triệu An", "Phạm Gia Bảo", "Lâm Ngọc Huyền",
  "Nguyễn Thanh Nhân", "Lại Tu Trung", "Võ Công Minh",
];
const MOCK_PATROL = [
  "A5, A17", "A3, A12", "A8, A15", "A2, A18",
  "A6, A11", "A9, A14", "A1, A16",
];

export const generateWeekSchedule = (monday: Date): WeekSchedule => {
  const rows: ScheduleRow[] = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    return {
      date: toIsoDate(day),
      commander:       MOCK_COMMANDERS[i],
      duty_officer:    MOCK_DUTY[i],
      document_officer: MOCK_DOC[i],
      internal_affairs: MOCK_INTERNAL[i],
      meal_duty:       MOCK_MEAL[i],
      office_duty:     MOCK_OFFICE[i],
      dqtt_leader:     MOCK_DQTT[i],
      dqcd_patrol:     MOCK_PATROL[i],
    };
  });

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  return {
    weekId: `${monday.getFullYear()}-${String(getIsoWeek(monday)).padStart(2, "0")}`,
    weekNumber: getIsoWeek(monday),
    startDate: toIsoDate(monday),
    endDate: toIsoDate(sunday),
    rows,
  };
};
