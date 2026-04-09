"use client";

import { WeekSchedule, toIsoDate } from "./schedule-data";
import ScheduleRow from "./schedule-row";

interface ScheduleTableProps {
  schedule: WeekSchedule | null;
  loading: boolean;
}

const COLUMNS = [
  { key: "date",             label: "Thứ/Ngày",                         minW: "min-w-[88px]" },
  { key: "commander",        label: "Trực chỉ huy",                     minW: "min-w-[130px]" },
  { key: "duty_officer",     label: "Trực ban",                         minW: "min-w-[130px]" },
  { key: "document_officer", label: "Trực công văn",                    minW: "min-w-[130px]" },
  { key: "internal_affairs", label: "Trực nội vụ",                     minW: "min-w-[130px]" },
  { key: "meal_duty",        label: "Trực cơm",                         minW: "min-w-[120px]" },
  { key: "office_duty",      label: "Trực trụ sở HĐND-UBND; Đảng uỷ", minW: "min-w-[175px]" },
  { key: "dqtt_leader",      label: "DQTT phụ trách A",                 minW: "min-w-[140px]" },
  { key: "dqcd_patrol",      label: "DQCD trực – Tuần tra",             minW: "min-w-[130px]" },
];

// ─── Skeleton ────────────────────────────────────────────────────────────────
function SkeletonRow({ index }: { index: number }) {
  return (
    <tr className={index % 2 === 0 ? "bg-gray-50/70" : "bg-white"}>
      {COLUMNS.map((col) => (
        <td key={col.key} className="px-3 py-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <tr>
      <td colSpan={COLUMNS.length} className="py-20 text-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="text-sm font-medium">Chưa có lịch trực cho tuần này</p>
          <p className="text-xs">Nhấn "Lưu lịch" để tạo lịch mới</p>
        </div>
      </td>
    </tr>
  );
}

// ─── Main table ──────────────────────────────────────────────────────────────
export default function ScheduleTable({ schedule, loading }: ScheduleTableProps) {
  const todayIso = toIsoDate(new Date());

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Horizontal scroll wrapper */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          {/* ── Sticky header ── */}
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {COLUMNS.map((col, i) => (
                <th
                  key={col.key}
                  className={`
                    ${col.minW} px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide
                    ${i === 0 ? "sticky left-0 z-20 bg-gray-50 border-r border-gray-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.05)]" : ""}
                  `}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {loading ? (
              Array.from({ length: 7 }, (_, i) => <SkeletonRow key={i} index={i} />)
            ) : !schedule || schedule.rows.length === 0 ? (
              <EmptyState />
            ) : (
              schedule.rows.map((row, i) => (
                <ScheduleRow
                  key={row.date}
                  row={row}
                  isEven={i % 2 === 0}
                  isToday={row.date === todayIso}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer info ── */}
      {schedule && !loading && (
        <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-400">
          <span>
            Hiển thị 7 ngày &nbsp;·&nbsp; Tuần {schedule.weekNumber}/{new Date(schedule.startDate + "T00:00:00").getFullYear()}
          </span>
          <span>Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}</span>
        </div>
      )}
    </div>
  );
}
