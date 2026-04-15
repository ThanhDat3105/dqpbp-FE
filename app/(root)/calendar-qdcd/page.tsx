"use client";

import { useState, useEffect } from "react";
import { scheduleAPI, WeeklyResponse } from "@/services/api/schedule";
import { WeekNavigator } from "@/components/weekly-schedule/WeekNavigator";
import { LegendBar } from "@/components/weekly-schedule/LegendBar";
import { ExportExcelButton } from "@/components/weekly-schedule/ExportExcelButton";
import { ScheduleTable } from "@/components/weekly-schedule/ScheduleTable";
import { Search } from "lucide-react";
import { addWeeks, subWeeks, format, startOfWeek, parseISO } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getMonday(date: Date): string {
  const d = startOfWeek(date, { weekStartsOn: 1 });
  return format(d, "yyyy-MM-dd");
}

export default function WeeklySchedulePage() {
  const { user } = useAuth();
  const [weekStart, setWeekStart] = useState<string>(() =>
    getMonday(new Date()),
  );
  const [data, setData] = useState<WeeklyResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [unitFilter, setUnitFilter] = useState<string>("all");

  const fetchWeeklySchedule = async (dateStr: string) => {
    setLoading(true);
    try {
      const response = await scheduleAPI.getWeeklySchedule(
        dateStr,
        String(user?.id),
        unitFilter,
      );
      setData(response);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error || "Failed to fetch weekly schedule",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklySchedule(weekStart);
  }, [weekStart, unitFilter]);

  const handlePrevWeek = () => {
    const prev = format(subWeeks(parseISO(weekStart), 1), "yyyy-MM-dd");
    setWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = format(addWeeks(parseISO(weekStart), 1), "yyyy-MM-dd");
    setWeekStart(next);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto flex flex-col space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Lịch có thể công tác trong tuần của DQCĐ
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý và xem lịch công tác của các thành viên DQCĐ trong tuần
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[200px]"
              />
            </div>

            {user?.role === "CHI_HUY" && (
              <Select value={unitFilter} onValueChange={setUnitFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tất cả đơn vị" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="all">Tất cả đơn vị</SelectItem>

                  {Array.from({ length: 23 }, (_, i) => {
                    const value = `a${i + 1}`;
                    return (
                      <SelectItem key={value} value={value}>
                        {value.toUpperCase()}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            )}

            {/* Export Button */}
            {data && (
              <ExportExcelButton
                members={data.members}
                weekLabel={`Week ${data.week.week_number} (${data.week.start})`}
              />
            )}
          </div>
        </div>

        {/* Navigator & Legend */}
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <WeekNavigator
            week={data?.week || null}
            weekStart={weekStart}
            onPrev={handlePrevWeek}
            onNext={handleNextWeek}
          />
          <LegendBar />
        </div>

        {/* Schedule Table */}
        <ScheduleTable data={data} loading={loading} search={search} />
      </div>
    </div>
  );
}
