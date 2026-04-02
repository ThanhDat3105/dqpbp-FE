"use client";

import { memo } from "react";
import type { Dayjs } from "dayjs";
import clsx from "clsx";
import type { ViewMode, CalendarMetaData } from "./types";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";
import { useAuth } from "@/context/AuthContext";

interface CalendarGridProps {
  viewMode: ViewMode;
  currentDate: Dayjs;
  data: CalendarMetaData;
  today: Dayjs;
}

const CalendarGrid = memo(function CalendarGrid({
  viewMode,
  currentDate,
  data,
  today,
}: CalendarGridProps) {
  const { user } = useAuth();

  return (
    <div
      className={clsx(
        "flex-1 flex flex-col min-h-0 overflow-hidden",
        "transition-all duration-200",
      )}
    >
      {viewMode === "month" && (
        <MonthView
          currentDate={currentDate}
          data={data}
          role={user?.role || "STANDING_MILITIA"}
          today={today}
        />
      )}
      {viewMode === "week" && (
        <WeekView
          currentDate={currentDate}
          data={data}
          role={user?.role || "STANDING_MILITIA"}
          today={today}
        />
      )}
      {viewMode === "day" && (
        <DayView
          currentDate={currentDate}
          data={data}
          role={user?.role || "STANDING_MILITIA"}
          today={today}
        />
      )}
    </div>
  );
});

export default CalendarGrid;
