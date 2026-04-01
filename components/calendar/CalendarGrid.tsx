"use client";

import { memo } from "react";
import type { Dayjs } from "dayjs";
import clsx from "clsx";
import type { ViewMode, CalendarMetaData } from "./types";
import MonthView from "./MonthView";
import WeekView from "./WeekView";
import DayView from "./DayView";

interface CalendarGridProps {
  viewMode: ViewMode;
  currentDate: Dayjs;
  data: CalendarMetaData;
  role: string;
  today: Dayjs;
}

const CalendarGrid = memo(function CalendarGrid({
  viewMode,
  currentDate,
  data,
  role,
  today,
}: CalendarGridProps) {
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
          role={role}
          today={today}
        />
      )}
      {viewMode === "week" && (
        <WeekView
          currentDate={currentDate}
          data={data}
          role={role}
          today={today}
        />
      )}
      {viewMode === "day" && (
        <DayView
          currentDate={currentDate}
          data={data}
          role={role}
          today={today}
        />
      )}
    </div>
  );
});

export default CalendarGrid;
