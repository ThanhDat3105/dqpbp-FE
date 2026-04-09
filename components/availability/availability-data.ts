export type SlotStatus =
  | "available"   // blue  – free & available
  | "busy"        // red   – not available
  | "partial"     // orange – partially available
  | "flexible"    // green – fully flexible
  | "night"       // purple – special/night shift
  | "off";        // gray  – no data / day off

export interface TimeSlot {
  time: string;      // e.g. "7h - 10h"
  status: SlotStatus;
}

export type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DayShift {
  morning:   TimeSlot;
  afternoon: TimeSlot;
}

export interface UserSchedule {
  id: string;
  name: string;
  role?: string;
  shifts: Record<DayKey, DayShift>;
  total_assignments: number;
}

// ─── Config ──────────────────────────────────────────────────────────────────

export const DAY_KEYS: DayKey[] = [
  "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday",
];

export const DAY_LABELS: Record<DayKey, string> = {
  monday:    "THỨ 2",
  tuesday:   "THỨ 3",
  wednesday: "THỨ 4",
  thursday:  "THỨ 5",
  friday:    "THỨ 6",
  saturday:  "THỨ 7",
  sunday:    "CHỦ NHẬT",
};

export const STATUS_CONFIG: Record<
  SlotStatus,
  { bg: string; text: string; border: string; label: string }
> = {
  available: {
    bg:     "bg-blue-100",
    text:   "text-blue-800",
    border: "border-blue-200",
    label:  "Rảnh",
  },
  busy: {
    bg:     "bg-red-100",
    text:   "text-red-800",
    border: "border-red-200",
    label:  "Bận",
  },
  partial: {
    bg:     "bg-orange-100",
    text:   "text-orange-800",
    border: "border-orange-200",
    label:  "Một phần",
  },
  flexible: {
    bg:     "bg-green-100",
    text:   "text-green-800",
    border: "border-green-200",
    label:  "Linh hoạt",
  },
  night: {
    bg:     "bg-purple-100",
    text:   "text-purple-800",
    border: "border-purple-200",
    label:  "Ca đêm",
  },
  off: {
    bg:     "bg-gray-100",
    text:   "text-gray-400",
    border: "border-gray-200",
    label:  "Nghỉ",
  },
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mk = (time: string, status: SlotStatus): TimeSlot => ({ time, status });

export const MOCK_SCHEDULES: UserSchedule[] = [
  {
    id: "u1",
    name: "Ngô Trương Định",
    role: "Tổ trưởng",
    total_assignments: 14,
    shifts: {
      monday:    { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 17h", "busy") },
      tuesday:   { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 18h", "available") },
      wednesday: { morning: mk("7h - 10h", "partial"),    afternoon: mk("14h - 17h", "available") },
      thursday:  { morning: mk("7h - 10h", "busy"),       afternoon: mk("16h45 - 21h30", "night") },
      friday:    { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 17h", "flexible") },
      saturday:  { morning: mk("7h - 11h", "flexible"),   afternoon: mk("14h - 18h", "flexible") },
      sunday:    { morning: mk("—", "off"),                afternoon: mk("—", "off") },
    },
  },
  {
    id: "u2",
    name: "Ngô Hoài Bảo",
    total_assignments: 10,
    shifts: {
      monday:    { morning: mk("7h - 10h", "busy"),       afternoon: mk("14h - 17h", "available") },
      tuesday:   { morning: mk("8h - 11h", "partial"),    afternoon: mk("—", "off") },
      wednesday: { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 18h", "busy") },
      thursday:  { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 17h", "available") },
      friday:    { morning: mk("7h - 10h", "busy"),       afternoon: mk("14h - 17h", "busy") },
      saturday:  { morning: mk("7h - 11h", "available"),  afternoon: mk("14h - 18h", "partial") },
      sunday:    { morning: mk("8h", "flexible"),          afternoon: mk("14h", "flexible") },
    },
  },
  {
    id: "u3",
    name: "Nguyễn Lý Minh Quang",
    total_assignments: 8,
    shifts: {
      monday:    { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 18h", "available") },
      tuesday:   { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 17h", "partial") },
      wednesday: { morning: mk("—", "off"),                afternoon: mk("14h - 17h", "available") },
      thursday:  { morning: mk("7h - 10h", "busy"),       afternoon: mk("14h - 18h", "busy") },
      friday:    { morning: mk("7h - 10h", "flexible"),   afternoon: mk("14h - 17h", "flexible") },
      saturday:  { morning: mk("—", "off"),                afternoon: mk("—", "off") },
      sunday:    { morning: mk("8h - 11h", "night"),       afternoon: mk("18h - 21h", "night") },
    },
  },
  {
    id: "u4",
    name: "Nguyễn Thành Tài",
    total_assignments: 12,
    shifts: {
      monday:    { morning: mk("7h - 10h", "partial"),    afternoon: mk("14h - 18h", "busy") },
      tuesday:   { morning: mk("7h - 11h", "available"),  afternoon: mk("14h - 17h", "available") },
      wednesday: { morning: mk("7h - 10h", "busy"),       afternoon: mk("14h - 17h", "partial") },
      thursday:  { morning: mk("7h - 10h", "available"),  afternoon: mk("—", "off") },
      friday:    { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 18h", "available") },
      saturday:  { morning: mk("7h - 11h", "night"),      afternoon: mk("16h45 - 21h30", "night") },
      sunday:    { morning: mk("—", "off"),                afternoon: mk("—", "off") },
    },
  },
  {
    id: "u5",
    name: "Trần Hoàng Phi",
    total_assignments: 9,
    shifts: {
      monday:    { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 17h", "available") },
      tuesday:   { morning: mk("—", "off"),                afternoon: mk("14h - 18h", "partial") },
      wednesday: { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 17h", "available") },
      thursday:  { morning: mk("7h - 10h", "flexible"),   afternoon: mk("14h - 17h", "flexible") },
      friday:    { morning: mk("7h - 10h", "busy"),       afternoon: mk("14h - 18h", "busy") },
      saturday:  { morning: mk("8h - 11h", "available"),  afternoon: mk("14h - 18h", "available") },
      sunday:    { morning: mk("8h", "partial"),           afternoon: mk("14h", "partial") },
    },
  },
  {
    id: "u6",
    name: "Lâm Ngọc Huyền",
    role: "Thư ký",
    total_assignments: 6,
    shifts: {
      monday:    { morning: mk("7h - 10h", "busy"),       afternoon: mk("14h - 17h", "busy") },
      tuesday:   { morning: mk("7h - 10h", "busy"),       afternoon: mk("14h - 17h", "busy") },
      wednesday: { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 17h", "available") },
      thursday:  { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 18h", "available") },
      friday:    { morning: mk("7h - 10h", "partial"),    afternoon: mk("14h - 18h", "partial") },
      saturday:  { morning: mk("—", "off"),                afternoon: mk("—", "off") },
      sunday:    { morning: mk("—", "off"),                afternoon: mk("—", "off") },
    },
  },
  {
    id: "u7",
    name: "Đoàn Quốc Đạt",
    total_assignments: 11,
    shifts: {
      monday:    { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 17h", "partial") },
      tuesday:   { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 17h", "available") },
      wednesday: { morning: mk("7h - 10h", "busy"),       afternoon: mk("14h - 18h", "busy") },
      thursday:  { morning: mk("8h - 11h", "flexible"),   afternoon: mk("14h - 17h", "flexible") },
      friday:    { morning: mk("7h - 10h", "available"),  afternoon: mk("14h - 17h", "available") },
      saturday:  { morning: mk("7h - 11h", "night"),      afternoon: mk("18h - 21h30", "night") },
      sunday:    { morning: mk("8h - 11h", "available"),  afternoon: mk("—", "off") },
    },
  },
];
