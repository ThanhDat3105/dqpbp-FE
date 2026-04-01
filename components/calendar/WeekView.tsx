"use client";

import React, { memo } from "react";
import dayjs, { type Dayjs } from "dayjs";
import clsx from "clsx";
import type {
  CalendarMetaData,
  CalendarActivity,
  CalendarTaskItem,
} from "./types";
import { isActivityList } from "./types";
import EventItem from "./EventItem";

interface WeekViewProps {
  currentDate: Dayjs;
  data: CalendarMetaData;
  role: string;
  today: Dayjs;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEKDAYS_SHORT = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const WeekView = memo(function WeekView({
  currentDate,
  data,
  role,
  today,
}: WeekViewProps) {
  const startOfWeek = currentDate.startOf("week");
  const days: Dayjs[] = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.add(i, "day"),
  );

  // Get all events for a day, labeled for rendering
  function getDayEvents(day: Dayjs): {
    taskId: number;
    title: string;
    status: "pending" | "done";
    subLabel?: string;
  }[] {
    const key = day.format("YYYY-MM-DD");
    const dayData = data[key];
    if (!dayData || dayData.length === 0) return [];

    if (role === "COMMANDER" && isActivityList(dayData)) {
      const acts = dayData as CalendarActivity[];
      return acts.flatMap((act) =>
        act.tasks.map((t) => ({
          taskId: t.task_id,
          title: t.title,
          status: t.status,
          subLabel: act.activity_name,
        })),
      );
    }

    return (dayData as CalendarTaskItem[]).map((t) => ({
      taskId: t.task_id,
      title: t.title,
      status: t.status,
    }));
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Sticky day header row */}
      <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-gray-200 bg-white shrink-0 sticky top-0 z-10 shadow-sm">
        <div className="border-r border-gray-200" /> {/* time gutter */}
        {days.map((day, i) => {
          const isToday = day.isSame(today, "day");
          return (
            <div
              key={day.format("YYYY-MM-DD")}
              className={clsx(
                "py-2 text-center",
                i === 0 && "text-red-500",
              )}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {WEEKDAYS_SHORT[i]}
              </p>
              <span
                className={clsx(
                  "inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold mt-0.5 transition-all",
                  isToday
                    ? "bg-emerald-600 text-white shadow"
                    : "text-gray-800 hover:bg-gray-100",
                )}
              >
                {day.date()}
              </span>
            </div>
          );
        })}
      </div>

      {/* Scrollable time grid */}
      <div className="flex-1 overflow-y-auto">
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-gray-200 min-h-14"
          >
            {/* Hour label */}
            <div className="flex items-start justify-end pr-2 pt-1 border-r border-gray-200 shrink-0">
              <span className="text-xs text-gray-400 font-medium">
                {hour === 0 ? "" : `${hour}:00`}
              </span>
            </div>

            {/* Day columns */}
            {days.map((day, di) => {
              const isToday = day.isSame(today, "day");
              const events = getDayEvents(day);
              // For the week view we show all events in the 8:00 slot (business hours)
              // and keep other slots empty — a simplified approach matching the spec
              const showEvents = hour === 0 && events.length > 0;

              return (
                <div
                  key={day.format("YYYY-MM-DD")}
                  className={clsx(
                    "border-r border-gray-200 last:border-r-0 p-0.5",
                    "hover:bg-gray-50/60 transition-colors duration-100",
                    isToday && "bg-emerald-50/30",
                    di === 0 && "bg-red-50/10",
                  )}
                >
                  {showEvents && (
                    <div className="flex flex-col gap-0.5">
                      {events.slice(0, 4).map((ev) => (
                        <EventItem
                          key={ev.taskId}
                          taskId={ev.taskId}
                          title={ev.title}
                          status={ev.status}
                          subLabel={ev.subLabel}
                          compact={true}
                        />
                      ))}
                      {events.length > 4 && (
                        <span className="text-[10px] text-gray-500 pl-1">
                          +{events.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

export default WeekView;
