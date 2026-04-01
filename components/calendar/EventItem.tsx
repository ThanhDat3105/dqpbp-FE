"use client";

import { memo } from "react";
import clsx from "clsx";
import Link from "next/link";

interface EventItemProps {
  taskId: number;
  title: string;
  status: "pending" | "done";
  subLabel?: string;
  compact?: boolean;
}

const EventItem = memo(function EventItem({
  taskId,
  title,
  status,
  subLabel,
  compact = false,
}: EventItemProps) {
  return (
    <Link
      href={`/ActivityList/${taskId}`}
      type="button"
      title={title}
      className={clsx(
        "group w-full text-left flex items-center gap-1.5 rounded-md select-none",
        "transition-all duration-150 cursor-pointer",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
        status === "done"
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
          status === "done" ? "bg-emerald-200" : "bg-white/80",
        )}
      />

      <span className="flex-1 min-w-0">
        <span
          className={clsx(
            "block text-white font-medium truncate leading-tight",
            compact ? "text-xs" : "text-base",
            status === "done" && "line-through opacity-80",
          )}
        >
          {title}
        </span>
        {subLabel && !compact && (
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
