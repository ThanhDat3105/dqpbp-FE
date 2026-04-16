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
const WEEKDAYS_SHORT = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

const WeekView = memo(function WeekView({
  currentDate,
  data,
  role,
  today,
}: WeekViewProps) {
  const startOfWeek = currentDate.startOf("isoWeek");
  const days: Dayjs[] = Array.from({ length: 7 }, (_, i) =>
    startOfWeek.add(i, "day"),
  );

  function getDayEvents(day: Dayjs): {
    id: string | number;
    taskId?: number;
    title: string;
    status?: "pending" | "completed";
    dueDate: string;
    subLabel?: string;
    taskCount?: number;
    isActivity?: boolean;
  }[] {
    const key = day.format("YYYY-MM-DD");
    const dayData = data[key];
    if (!dayData || dayData.length === 0) return [];

    const result: {
      id: string | number;
      taskId?: number;
      title: string;
      status?: "pending" | "completed";
      dueDate: string;
      subLabel?: string;
      taskCount?: number;
      isActivity?: boolean;
    }[] = [];

    if (role === "CHI_HUY" && isActivityList(dayData)) {
      // CHI_HUY: Group and deduplicate by activity_name
      const acts = dayData as CalendarActivity[];
      const activityMap = new Map<
        string,
        {
          task_id: number;
          title: string;
          due_date: string;
          status: "pending" | "completed";
        }[]
      >();

      // Merge activities with same name
      for (const act of acts) {
        const existing = activityMap.get(act.activity_name) || [];
        const newTasks = act.tasks.map((t) => ({
          task_id: t.task_id,
          title: t.title,
          due_date: t.due_date,
          status: t.status,
        }));
        activityMap.set(act.activity_name, [...existing, ...newTasks]);
      }

      // Create one item per activity
      for (const [activityName, tasks] of activityMap.entries()) {
        if (tasks.length > 0) {
          const earliestDate = tasks.reduce((min, t) => {
            return new Date(t.due_date) < new Date(min.due_date) ? t : min;
          }).due_date;

          result.push({
            id: activityName,
            title: activityName,
            taskCount: tasks.length,
            dueDate: earliestDate,
            isActivity: true,
          });
        }
      }
    } else {
      // DQTT: Flatten all tasks individually
      if (isActivityList(dayData)) {
        const acts = dayData as CalendarActivity[];

        result.push(
          ...acts.flatMap((act) =>
            act.tasks.map((t) => ({
              id: t.task_id,
              taskId: t.task_id,
              title: t.title,
              status: t.status,
              dueDate: t.due_date,
              subLabel: act.activity_name,
              isActivity: false,
            })),
          ),
        );
      } else {
        result.push(
          ...(dayData as CalendarTaskItem[]).map((t) => ({
            id: t.task_id,
            taskId: t.task_id,
            title: t.title,
            status: t.status,
            dueDate: t.due_date,
            isActivity: false,
          })),
        );
      }
    }

    return result;
  }

  const groupEventsByHour = (events: any[]) => {
    const map: Record<number, typeof events> = {};

    for (let i = 0; i < 24; i++) {
      map[i] = [];
    }

    events.forEach((ev) => {
      const hour = dayjs(ev.dueDate).hour();
      map[hour].push(ev);
    });

    return map;
  };

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
              className={clsx("py-2 text-center", i === 6 && "text-red-500")}
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
              const eventsByHour = groupEventsByHour(events);
              const hourEvents = eventsByHour[hour];

              return (
                <div
                  key={day.format("YYYY-MM-DD")}
                  className={clsx(
                    "border-r border-gray-200 last:border-r-0 p-0.5",
                    "hover:bg-gray-50/60 transition-colors duration-100",
                    isToday && "bg-emerald-50/30",
                    di === 6 && "bg-red-50/10",
                  )}
                >
                  {hourEvents.length > 0 && (
                    <div className="flex flex-col gap-0.5">
                      {hourEvents.map((ev) => (
                        <EventItem
                          task={ev}
                          key={ev.id}
                          taskId={ev.taskId}
                          title={ev.title}
                          status={ev.status}
                          subLabel={ev.subLabel}
                          taskCount={ev.taskCount}
                          isActivity={ev.isActivity}
                          compact={true}
                        />
                      ))}
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
