"use client";

import { useState } from "react";
import { WeekSchedule, ScheduleRow as ScheduleRowData } from "./schedule-data";
import ScheduleRow from "./schedule-row";
import ScheduleFormModal from "./schedule-form-modal";

interface ScheduleTableProps {
  schedule: WeekSchedule | null;
  loading: boolean;
  onUpdateRow?: (row: ScheduleRowData) => void;
}

// Index 0 = T2, 1 = T3, ..., 5 = T7, 6 = CN
const DAY_LABELS = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

function SkeletonRow({ index, colCount }: { index: number; colCount: number }) {
  return (
    <tr className={index % 2 === 0 ? "bg-gray-50/70" : "bg-white"}>
      {Array.from({ length: colCount }).map((_, i) => (
        <td key={i} className="px-3 py-4">
          <div className="h-4 bg-gray-200 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

function EmptyState({ colCount }: { colCount: number }) {
  return (
    <tr>
      <td colSpan={colCount} className="py-20 text-center">
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
          <p className="text-sm font-medium">Chưa có lịch trực</p>
          <p className="text-xs">Nhấn "Lưu lịch" để tạo lịch mới</p>
        </div>
      </td>
    </tr>
  );
}

export default function ScheduleTable({
  schedule,
  loading,
  onUpdateRow,
}: ScheduleTableProps) {
  const [editingRow, setEditingRow] = useState<ScheduleRowData | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const fixedLeft = [
    { key: "day", label: "Thứ/Ngày", minW: "min-w-[100px]" },
    { key: "commander", label: "Trực chỉ huy", minW: "min-w-[130px]" },
    { key: "duty_officer", label: "Trực ban", minW: "min-w-[130px]" },
    { key: "document_officer", label: "Trực công văn", minW: "min-w-[130px]" },
    { key: "internal_affairs", label: "Trực nội vụ", minW: "min-w-[130px]" },
    { key: "meal_duty", label: "Trực cơm", minW: "min-w-[120px]" },
  ];

  const officeColumns = (schedule?.officeColumns ?? []).map((col) => ({
    key: col.code,
    label: col.label,
    minW: "min-w-[175px]",
  }));

  const fixedRight = [
    { key: "dqtt_leader", label: "DQTT phụ trách A", minW: "min-w-[140px]" },
    {
      key: "dqcd_patrol",
      label: "DQCD trực – Tuần tra",
      minW: "min-w-[130px]",
    },
  ];

  const COLUMNS = [...fixedLeft, ...officeColumns, ...fixedRight];
  const colCount = COLUMNS.length;

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {COLUMNS.map((col) => (
                  <th
                    key={col.key}
                    className={`${col.minW} px-3 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wide`}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 7 }, (_, i) => (
                  <SkeletonRow key={i} index={i} colCount={colCount} />
                ))
              ) : !schedule || schedule.rows.length === 0 ? (
                <EmptyState colCount={colCount} />
              ) : (
                schedule.rows.map((row, i) => (
                  <ScheduleRow
                    key={i}
                    row={row}
                    dayLabel={DAY_LABELS[i]}
                    officeColumns={schedule.officeColumns}
                    onEdit={(r) => {
                      setEditingRow(r);
                      setEditingIndex(i);
                    }}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {schedule && !loading && (
          <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end text-xs text-gray-400">
            <span>Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}</span>
          </div>
        )}
      </div>

      {editingRow && schedule && (
        <ScheduleFormModal
          isOpen={!!editingRow}
          onClose={() => {
            setEditingRow(null);
            setEditingIndex(null);
          }}
          row={editingRow}
          dayLabel={editingIndex !== null ? DAY_LABELS[editingIndex] : ""}
          officeColumns={schedule.officeColumns}
          onSave={(updated) => {
            if (onUpdateRow) onUpdateRow(updated);
            setEditingRow(null);
            setEditingIndex(null);
          }}
        />
      )}
    </>
  );
}
