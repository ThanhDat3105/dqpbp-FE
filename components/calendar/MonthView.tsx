"use client";

import { memo } from "react";
import { type Dayjs } from "dayjs";
import clsx from "clsx";
import CalendarCell from "./CalendarCell";
import type { CalendarMetaData } from "./types";

interface MonthViewProps {
  currentDate: Dayjs;
  data: CalendarMetaData;
  role: string;
  today: Dayjs;
}

const WEEKDAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const MonthView = memo(function MonthView({
  currentDate,
  data,
  role,
  today,
}: MonthViewProps) {
  // Build the 6-week grid
  const startOfMonth = currentDate.startOf("month");
  const startOfGrid = startOfMonth.startOf("isoWeek"); // Monday

  const weeks: Dayjs[][] = [];
  let pointer = startOfGrid;
  for (let w = 0; w < 6; w++) {
    const week: Dayjs[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(pointer);
      pointer = pointer.add(1, "day");
    }
    weeks.push(week);
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 shrink-0">
        {WEEKDAYS.map((day, i) => (
          <div
            key={day}
            className={clsx(
              "py-2 text-center text-xs font-semibold uppercase tracking-wider",
              i === 6 ? "text-red-500" : "text-gray-500",
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-rows-6 min-h-0 overflow-auto">
        {weeks.map((week, wi) => (
          <div
            key={wi}
            className="grid grid-cols-7 border-b border-gray-200 last:border-b-0"
          >
            {week.map((day) => {
              const key = day.format("YYYY-MM-DD");
              const isToday = day.isSame(today, "day");
              const isCurrentMonth = day.month() === currentDate.month();
              return (
                <div
                  key={key}
                  className={clsx(
                    "border-r border-gray-200 last:border-r-0 p-1.5 min-h-25",
                    "hover:bg-gray-50/80 transition-colors duration-100",
                    isToday && "bg-emerald-50/60",
                  )}
                >
                  <CalendarCell
                    date={key}
                    dayData={data[key]}
                    role={role}
                    isToday={isToday}
                    isCurrentMonth={isCurrentMonth}
                    compact={true}
                    maxVisible={3}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

export default MonthView;
