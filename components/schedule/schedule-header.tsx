"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeekSchedule, formatDayMonth, formatFullDate, getMonday } from "./schedule-data";
import Notification from "@/components/notification/Notification";
import ScheduleCreateModal from "./schedule-create-modal";

interface ScheduleHeaderProps {
  schedule: WeekSchedule;
  referenceDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  onExport: () => void;
  onCreated: () => void;
}

function getWeekLabel(referenceDate: Date): {
  weekNumber: number;
  label: string;
  isCurrentWeek: boolean;
} {
  const monday = getMonday(new Date(referenceDate));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  // ISO week number
  const d = new Date(Date.UTC(monday.getFullYear(), monday.getMonth(), monday.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);

  const label = `Tuần ${weekNumber}: ${formatDayMonth(monday)} – ${formatFullDate(sunday)}`;

  // Is current week?
  const todayMonday = getMonday(new Date());
  const isCurrentWeek =
    monday.getFullYear() === todayMonday.getFullYear() &&
    monday.getMonth() === todayMonday.getMonth() &&
    monday.getDate() === todayMonday.getDate();

  return { weekNumber, label, isCurrentWeek };
}

export default function ScheduleHeader({
  schedule,
  referenceDate,
  onPrevWeek,
  onNextWeek,
  onToday,
  onExport,
  onCreated,
}: ScheduleHeaderProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const { label, isCurrentWeek } = getWeekLabel(referenceDate);

  return (
    <>
      <header>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Title */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Lịch Trực Dân Quân
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Quản lý lịch trực tuần cho các tổ dân quân
            </p>
          </div>

          {/* Week navigation */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <Button
              id="prev-week-btn"
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white hover:shadow-sm"
              onClick={onPrevWeek}
              aria-label="Tuần trước"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <span className="px-3 py-1 text-sm font-medium text-gray-700 select-none min-w-[220px] text-center">
              {label}
            </span>

            <Button
              id="next-week-btn"
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-white hover:shadow-sm"
              onClick={onNextWeek}
              aria-label="Tuần sau"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              id="today-btn"
              variant="outline"
              size="sm"
              onClick={onToday}
              disabled={isCurrentWeek}
              className="text-sm"
            >
              Hôm nay
            </Button>

            <Notification />

            <Button
              id="create-week-btn"
              variant="outline"
              size="sm"
              onClick={() => setCreateOpen(true)}
              className="gap-1.5 text-blue-700 border-blue-300 hover:bg-blue-50"
            >
              <CalendarPlus className="h-4 w-4" />
              Tạo lịch tuần
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

      <ScheduleCreateModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => {
          onCreated();
          setCreateOpen(false);
        }}
      />
    </>
  );
}
