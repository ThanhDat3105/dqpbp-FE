"use client";

import { ChevronLeft, ChevronRight, Download, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeekSchedule, formatFullDate } from "./schedule-data";
import Notification from "@/components/notification/Notification";

interface ScheduleHeaderProps {
  schedule: WeekSchedule;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSave: () => void;
  onExport: () => void;
}

export default function ScheduleHeader({
  schedule,
  onPrevWeek,
  onNextWeek,
  onSave,
  onExport,
}: ScheduleHeaderProps) {
  const startLabel = formatFullDate(new Date(schedule.startDate + "T00:00:00"));
  const endLabel = formatFullDate(new Date(schedule.endDate + "T00:00:00"));

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* ── Title ── */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Lịch Trực Dân Quân
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý lịch trực tuần cho các tổ dân quân
          </p>
        </div>

        {/* ── Controls ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Notification dropdown */}
          <Notification />

          {/* Week navigation */}
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
            <button
              id="prev-week-btn"
              onClick={onPrevWeek}
              aria-label="Tuần trước"
              className="p-1 rounded hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </button>

            <span className="text-sm font-semibold text-gray-700 whitespace-nowrap px-2 min-w-[220px] text-center">
              Tuần {schedule.weekNumber}: {startLabel} – {endLabel}
            </span>

            <button
              id="next-week-btn"
              onClick={onNextWeek}
              aria-label="Tuần sau"
              className="p-1 rounded hover:bg-gray-200 transition-colors"
            >
              <ChevronRight className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {/* Action buttons */}
          <Button
            id="save-schedule-btn"
            variant="outline"
            size="sm"
            onClick={onSave}
            className="gap-1.5"
          >
            <Save className="h-4 w-4" />
            Lưu lịch
          </Button>

          <Button
            id="export-excel-btn"
            size="sm"
            onClick={onExport}
            className="gap-1.5 bg-[#217346] hover:bg-[#1a5c38] text-white border-0"
          >
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>
        </div>
      </div>
    </header>
  );
}
