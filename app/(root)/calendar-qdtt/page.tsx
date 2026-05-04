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
  const [referenceDate, setReferenceDate] = useState<Date>(new Date());

  const fetchSchedule = useCallback(async (refDate: Date) => {
    setLoading(true);
    setSchedule(null);
    try {
      const data = await calendarDQTTAPI.getSchedule(toIsoDate(refDate));
      const monDate = new Date(data.weekStart + "T00:00:00");
      setSchedule({
        ...data,
        weekNumber: getIsoWeek(monDate),
        weekId: `${monDate.getFullYear()}-${String(getIsoWeek(monDate)).padStart(2, "0")}`,
        officeColumns: data.officeColumns ?? [],
      });
    } catch (err) {
      toast.error("Không thể tải lịch trực. Vui lòng thử lại.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedule(referenceDate);
  }, [fetchSchedule, referenceDate]);

  // ─── Week navigation ──────────────────────────────────────────────────────
  const handlePrevWeek = () => {
    setReferenceDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  };

  const handleNextWeek = () => {
    setReferenceDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  };

  const handleToday = () => {
    setReferenceDate(new Date());
  };

  const handleExport = () => {
    toast.info("Đang xuất file Excel...");
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col min-h-0 space-y-4 sm:space-y-6">
        <ScheduleHeader
          schedule={
            schedule ?? {
              weekId: "",
              weekNumber: 0,
              officeColumns: [],
              rows: [],
            }
          }
          referenceDate={referenceDate}
          onPrevWeek={handlePrevWeek}
          onNextWeek={handleNextWeek}
          onToday={handleToday}
          onExport={handleExport}
          onCreated={() => fetchSchedule(referenceDate)}
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
    </div>
  );
}
