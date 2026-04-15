"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  toIsoDate,
  getIsoWeek,
  type WeekSchedule,
} from "@/components/schedule/schedule-data";
import ScheduleHeader from "@/components/schedule/schedule-header";
import ScheduleTable from "@/components/schedule/schedule-table";
import { calendarDQTTAPI } from "@/services/api/calendar-dqtt";

export default function CalendarQdttPage() {
  const [schedule, setSchedule] = useState<WeekSchedule | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSchedule = useCallback(async () => {
    setLoading(true);
    setSchedule(null);
    try {
      const weekStart = toIsoDate(new Date());
      const data = await calendarDQTTAPI.getSchedule(weekStart);

      const monDate = new Date(data.weekStart + "T00:00:00");

      setSchedule({
        ...data,
        weekNumber: getIsoWeek(monDate),
        weekId: `${monDate.getFullYear()}-${String(getIsoWeek(monDate)).padStart(2, "0")}`,
        officeColumns: data.officeColumns ?? [],
      });
    } catch (err) {
      toast.error("Failed to load schedule. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const handleExport = () => {
    toast.info("Đang xuất file Excel...");
  };

  return (
    <div className="flex flex-col min-h-screen space-y-6">
      <ScheduleHeader
        schedule={
          schedule ?? {
            weekId: "",
            weekNumber: 0,
            officeColumns: [],
            rows: [],
          }
        }
        onExport={handleExport}
      />

      <main className="flex-1">
        <ScheduleTable
          schedule={loading ? null : schedule}
          loading={loading}
          onUpdateRow={(updatedRow) => {
            setSchedule((prev) => {
              if (!prev) return prev;
              const newRows = prev.rows.map((r) =>
                r.date === updatedRow.date ? updatedRow : r,
              );
              return { ...prev, rows: newRows };
            });
          }}
        />
      </main>
    </div>
  );
}
