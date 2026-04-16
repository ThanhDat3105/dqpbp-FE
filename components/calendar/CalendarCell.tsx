"use client";

import { memo } from "react";
import dayjs from "dayjs";
import clsx from "clsx";
import EventItem from "./EventItem";
import type { DayData, CalendarActivity, CalendarTaskItem } from "./types";
import { isActivityList } from "./types";

interface CalendarCellProps {
  date: string;
  dayData: DayData | undefined;
  role: string;
  isToday: boolean;
  isCurrentMonth?: boolean;
  compact?: boolean;
  maxVisible?: number;
}

const CalendarCell = memo(function CalendarCell({
  date,
  dayData,
  role,
  isToday,
  isCurrentMonth = true,
  compact = false,
  maxVisible = 3,
}: CalendarCellProps) {
  const d = dayjs(date);
  const hasData = dayData && dayData.length > 0;

  // ── Transform with role-based logic + deduplication ──────────────────────
  const items: {
    id: string;
    taskId?: number;
    title: string;
    status?: "pending" | "completed";
    subLabel?: string;
    taskCount?: number;
    isActivity?: boolean;
  }[] = [];

  if (hasData) {
    if (role === "CHI_HUY" && isActivityList(dayData)) {
      // CHI_HUY: Group and deduplicate by activity_name
      const activities = dayData as CalendarActivity[];
      const activityMap = new Map<
        string,
        { task_id: number; title: string; status: "pending" | "completed" }[]
      >();

      // Merge activities with same name
      for (const act of activities) {
        const existing = activityMap.get(act.activity_name) || [];
        const newTasks = act.tasks.map((t) => ({
          task_id: t.task_id,
          title: t.title,
          status: t.status,
        }));
        activityMap.set(act.activity_name, [...existing, ...newTasks]);
      }

      // Create one item per activity
      for (const [activityName, tasks] of activityMap.entries()) {
        if (tasks.length > 0) {
          items.push({
            id: activityName,
            title: activityName,
            taskCount: tasks.length,
            isActivity: true,
          });
        }
      }
    } else {
      // DQTT: Flatten all tasks individually
      if (isActivityList(dayData)) {
        const activities = dayData as CalendarActivity[];
        for (const act of activities) {
          for (const task of act.tasks) {
            items.push({
              id: task.task_id.toString(),
              taskId: task.task_id,
              title: task.title,
              status: task.status,
              subLabel: act.activity_name,
              isActivity: false,
            });
          }
        }
      } else {
        const tasks = dayData as CalendarTaskItem[];
        for (const t of tasks) {
          items.push({
            id: t.task_id.toString(),
            taskId: t.task_id,
            title: t.title,
            status: t.status,
            isActivity: false,
          });
        }
      }
    }
  }

  const visible = items.slice(0, maxVisible);
  const overflow = items.length - maxVisible;

  return (
    <div
      className={clsx(
        "flex flex-col h-full min-h-0 transition-colors duration-150",
        !isCurrentMonth && "opacity-40",
      )}
    >
      {/* Day number */}
      <div className="flex items-center justify-end shrink-0 mb-1">
        <span
          className={clsx(
            "flex items-center justify-center font-semibold transition-all duration-150",
            compact
              ? "w-6 h-6 text-sm rounded-full"
              : "w-7 h-7 text-base rounded-full",
            isToday
              ? "bg-emerald-600 text-white shadow-sm"
              : "text-gray-700 hover:bg-gray-100",
          )}
        >
          {d.date()}
        </span>
      </div>

      {/* Events list */}
      {hasData && (
        <div className="flex-1 min-h-0 flex flex-col gap-0.5 overflow-hidden">
          {visible.map((item) => (
            <EventItem
              task={item}
              key={item.id}
              taskId={item.taskId}
              title={item.title}
              status={item.status}
              subLabel={item.subLabel}
              taskCount={item.taskCount}
              isActivity={item.isActivity}
              compact={compact}
            />
          ))}

          {overflow > 0 && (
            <span className="text-[10px] text-gray-500 font-medium pl-1">
              +{overflow} more
            </span>
          )}
        </div>
      )}

      {!hasData && (
        <div className="flex-1" /> // spacer so cell fills height
      )}
    </div>
  );
});

export default CalendarCell;
