"use client";

import { memo } from "react";
import clsx from "clsx";
import Link from "next/link";

interface EventItemProps {
  id?: string | number;
  taskId?: number;
  title: string;
  status?: "pending" | "done";
  subLabel?: string;
  taskCount?: number;
  isActivity?: boolean;
  compact?: boolean;
}

const EventItem = memo(function EventItem({
  id,
  taskId,
  title,
  status,
  subLabel,
  taskCount,
  isActivity = false,
  compact = false,
}: EventItemProps) {
  const href = isActivity ? `/ActivityList` : `/ActivityList/${taskId}`;

  return (
    <Link
      href={href}
      type="button"
      title={title}
      className={clsx(
        "group w-full text-left flex items-center gap-1.5 rounded-md select-none",
        "transition-all duration-150 cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
        isActivity
          ? "bg-blue-500 hover:bg-blue-600 active:bg-blue-700"
          : status === "done"
            ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800"
            : "bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700",
        compact ? "px-1.5 py-0.5" : "px-2 py-1",
      )}
    >
      {/* Status dot */}
      <span
        className={clsx(
          "shrink-0 rounded-full",
          compact ? "w-1.5 h-1.5" : "w-2 h-2",
          isActivity
            ? "bg-blue-200"
            : status === "done"
              ? "bg-emerald-200"
              : "bg-white/80",
        )}
      />

      <span className="flex-1 min-w-0">
        <span
          className={clsx(
            "block text-white font-medium truncate leading-tight",
            compact ? "text-xs" : "text-base",
            !isActivity && status === "done" && "line-through opacity-80",
          )}
        >
          {title}
        </span>
        {isActivity && taskCount !== undefined && (
          <span className={clsx(
            "block text-white text-opacity-80 truncate leading-tight",
            compact ? "text-[10px] mt-0" : "text-xs mt-0.5",
          )}>
            ({taskCount} nhiệm vụ)
          </span>
        )}
        {subLabel && !compact && !isActivity && (
          <span className="block text-emerald-100 text-[10px] truncate leading-tight mt-0.5 opacity-80">
            {subLabel}
          </span>
        )}
      </span>

      {/* Arrow indicator on hover */}
      <span className="shrink-0 text-white/0 group-hover:text-white/80 transition-all duration-150 text-[10px]">
        →
      </span>
    </Link>
  );
});

export default EventItem;
