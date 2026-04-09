"use client";

import { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Bell } from "lucide-react";
import AvailabilityTable from "@/components/availability/availability-table";
import { MOCK_SCHEDULES } from "@/components/availability/availability-data";
import {
  getMonday,
  formatFullDate,
  getIsoWeek,
} from "@/components/schedule/schedule-data";
import Notification from "@/components/notification/Notification";

export default function CalendarQdcdPage() {
  const [monday, setMonday] = useState<Date>(() => getMonday(new Date()));

  const handlePrevWeek = useCallback(() => {
    setMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }, []);

  const handleNextWeek = useCallback(() => {
    setMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }, []);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const weekLabel = `Tuần ${getIsoWeek(monday)}: ${formatFullDate(monday)} – ${formatFullDate(sunday)}`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* ── Page header ── */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left: title */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Lịch làm việc / Thời khóa biểu
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Quản lý lịch huy động và tình trạng sẵn sàng của các thành viên
              dân quân
            </p>
          </div>

          {/* Right: bell + week nav */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Notification bell */}
            <Notification />

            {/* Week navigation */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
              <button
                id="avail-header-prev"
                onClick={handlePrevWeek}
                aria-label="Tuần trước"
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-gray-600" />
              </button>

              <span className="text-sm font-semibold text-gray-700 whitespace-nowrap px-2 min-w-[220px] text-center">
                {weekLabel}
              </span>

              <button
                id="avail-header-next"
                onClick={handleNextWeek}
                aria-label="Tuần sau"
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 p-4 sm:p-6">
        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            {
              label: "Tổng thành viên",
              value: MOCK_SCHEDULES.length,
              color: "text-blue-700",
              bg: "bg-blue-50 border-blue-100",
            },
            {
              label: "Sẵn sàng hôm nay",
              value: 5,
              color: "text-green-700",
              bg: "bg-green-50 border-green-100",
            },
            {
              label: "Đang bận",
              value: 2,
              color: "text-red-700",
              bg: "bg-red-50 border-red-100",
            },
            {
              label: "Tổng lần huy động",
              value: MOCK_SCHEDULES.reduce(
                (s, u) => s + u.total_assignments,
                0,
              ),
              color: "text-[#4a6318]",
              bg: "bg-[#6B8E23]/5 border-[#6B8E23]/15",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-lg border p-3 ${stat.bg} flex flex-col gap-0.5`}
            >
              <span className="text-xs text-gray-500">{stat.label}</span>
              <span className={`text-2xl font-extrabold ${stat.color}`}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>

        {/* Availability table */}
        <AvailabilityTable
          users={MOCK_SCHEDULES}
          weekLabel={weekLabel}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
        />
      </main>
    </div>
  );
}
