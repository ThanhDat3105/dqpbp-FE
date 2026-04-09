"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  generateWeekSchedule,
  getMonday,
  WeekSchedule,
} from "@/components/schedule/schedule-data";
import ScheduleHeader from "@/components/schedule/schedule-header";
import ScheduleTable from "@/components/schedule/schedule-table";

export default function CalendarQdttPage() {
  const [monday, setMonday] = useState<Date>(() => getMonday(new Date()));
  const [schedule, setSchedule] = useState<WeekSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate async data fetch
  const fetchSchedule = useCallback(async (mon: Date) => {
    setLoading(true);
    setSchedule(null);
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 600));
    setSchedule(generateWeekSchedule(mon));
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSchedule(monday);
  }, [monday, fetchSchedule]);

  const handlePrevWeek = () => {
    setMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setMonday((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handleSave = () => {
    toast.success("Đã lưu lịch trực thành công!");
  };

  const handleExport = () => {
    toast.info("Đang xuất file Excel...");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <ScheduleHeader
        schedule={
          schedule ?? {
            weekId: "",
            weekNumber: 0,
            startDate: "",
            endDate: "",
            rows: [],
          }
        }
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onSave={handleSave}
        onExport={handleExport}
      />

      {/* Main content */}
      <main className="flex-1 p-4 sm:p-6">
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-[#6B8E23]/10 border border-[#6B8E23]/30 inline-block" />
            Hôm nay
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-100 border border-gray-200 inline-block" />
            Ngày chẵn
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-8 h-3 rounded-full bg-[#6B8E23]/10 border border-[#6B8E23]/20 inline-block" />
            Mã DQCD
          </div>
        </div>

        <ScheduleTable schedule={loading ? null : schedule} loading={loading} />
      </main>
    </div>
  );
}
