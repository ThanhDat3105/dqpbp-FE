"use client";

import { memo, useMemo } from "react";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import clsx from "clsx";
import type {
  CalendarMetaData,
  CalendarActivity,
  CalendarTaskItem,
} from "./types";
import { isActivityList } from "./types";
import EventItem from "./EventItem";

interface DayViewProps {
  currentDate: Dayjs;
  data: CalendarMetaData;
  role: string;
  today: Dayjs;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const DayView = memo(function DayView({
  currentDate,
  data,
  role,
  today,
}: DayViewProps) {
  const key = currentDate.format("YYYY-MM-DD");
  const dayData = data[key];

  // 🔥 Transform data with role-based logic + deduplication
  const events = useMemo(() => {
    const result: {
      id: string | number;
      taskId?: number;
      title: string;
      status?: "pending" | "done";
      dueDate: string;
      subLabel?: string;
      taskCount?: number;
      isActivity?: boolean;
    }[] = [];

    if (!dayData || dayData.length === 0) return result;

    if (role === "COMMANDER" && isActivityList(dayData)) {
      // COMMANDER: Group and deduplicate by activity_name
      const acts = dayData as CalendarActivity[];
      const activityMap = new Map<string, { task_id: number; title: string; due_date: string; status: "pending" | "done" }[]>();

      // Merge activities with same name
      for (const act of acts) {
        const existing = activityMap.get(act.activity_name) || [];
        const newTasks = act.tasks.map(t => ({
          task_id: t.task_id,
          title: t.title,
          due_date: t.due_date,
          status: t.status,
        }));
        activityMap.set(act.activity_name, [...existing, ...newTasks]);
      }

      // Create one item per activity with merged tasks
      for (const [activityName, tasks] of activityMap.entries()) {
        if (tasks.length > 0) {
          // Find earliest due_date
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
      // STANDING_MILITIA: Flatten all tasks individually
      if (isActivityList(dayData)) {
        const acts = dayData as CalendarActivity[];
        for (const act of acts) {
          for (const t of act.tasks) {
            result.push({
              id: t.task_id,
              taskId: t.task_id,
              title: t.title,
              status: t.status,
              dueDate: t.due_date,
              subLabel: act.activity_name,
              isActivity: false,
            });
          }
        }
      } else {
        for (const t of dayData as CalendarTaskItem[]) {
          result.push({
            id: t.task_id,
            taskId: t.task_id,
            title: t.title,
            status: t.status,
            dueDate: t.due_date,
            isActivity: false,
          });
        }
      }
    }

    return result;
  }, [dayData, role]);

  // 🔥 Group theo giờ (tối ưu, tránh filter 24 lần)
  const eventsByHour = useMemo(() => {
    const map: Record<number, typeof events> = {};

    for (let i = 0; i < 24; i++) {
      map[i] = [];
    }

    events.forEach((ev) => {
      const hour = dayjs(ev.dueDate).hour();
      map[hour].push(ev);
    });

    return map;
  }, [events]);

  const isToday = currentDate.isSame(today, "day");

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div
        className={clsx(
          "flex items-center gap-3 px-6 py-3 border-b shrink-0",
          isToday
            ? "border-emerald-200 bg-emerald-50"
            : "border-gray-200 bg-gray-50",
        )}
      >
        <div className="flex flex-col items-center">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {currentDate.format("ddd")}
          </span>
          <span
            className={clsx(
              "flex items-center justify-center w-10 h-10 rounded-full text-2xl font-bold",
              isToday ? "bg-emerald-600 text-white" : "text-gray-800",
            )}
          >
            {currentDate.date()}
          </span>
        </div>

        <div>
          <p className="text-base font-semibold text-gray-700">
            {currentDate.format("MMMM YYYY")}
          </p>

          {events.length > 0 ? (
            <p className="text-sm text-gray-500">{events.length} nhiệm vụ</p>
          ) : (
            <p className="text-sm text-gray-400 italic">Không có nhiệm vụ</p>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        {HOURS.map((hour) => {
          const hourEvents = eventsByHour[hour];

          return (
            <div
              key={hour}
              className="flex border-b border-gray-100 min-h-16 group"
            >
              {/* Time label */}
              <div className="w-16 shrink-0 flex items-start justify-end pr-3 pt-1 border-r border-gray-100">
                <span className="text-xs text-gray-400 font-medium">
                  {hour === 0 ? "" : `${String(hour).padStart(2, "0")}:00`}
                </span>
              </div>

              {/* Content */}
              <div
                className={clsx(
                  "flex-1 p-1.5 transition-colors duration-100",
                  "hover:bg-gray-50/70",
                  isToday && "bg-emerald-50/20",
                )}
              >
                {hourEvents.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {hourEvents.map((ev) => (
                      <EventItem
                        key={ev.id}
                        id={ev.id}
                        taskId={ev.taskId}
                        title={ev.title}
                        status={ev.status}
                        subLabel={ev.subLabel}
                        taskCount={ev.taskCount}
                        isActivity={ev.isActivity}
                        compact={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default DayView;
