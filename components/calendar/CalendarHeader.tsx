"use client";

import React, { memo } from "react";
import clsx from "clsx";
import type { ViewMode } from "./types";
import Notification from "../notification/Notification";

interface CalendarHeaderProps {
  viewMode: ViewMode;
  label: string;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (mode: ViewMode) => void;
}

const VIEW_OPTIONS: { label: string; value: ViewMode }[] = [
  { label: "Ngày", value: "day" },
  { label: "Tuần", value: "week" },
  { label: "Tháng", value: "month" },
];

const CalendarHeader = memo(function CalendarHeader({
  viewMode,
  label,
  onPrev,
  onNext,
  onToday,
  onViewChange,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shrink-0 flex-wrap">
      {/* Today button */}
      <button
        type="button"
        onClick={onToday}
        className={clsx(
          "px-3 py-1.5 text-sm font-medium rounded-lg border transition-all duration-150",
          "border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
        )}
      >
        Hôm nay
      </button>

      {/* Prev / Next */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Trước"
          className={clsx(
            "w-8 h-8 flex items-center justify-center rounded-full",
            "text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          type="button"
          onClick={onNext}
          aria-label="Sau"
          className={clsx(
            "w-8 h-8 flex items-center justify-center rounded-full",
            "text-gray-600 hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Date label */}
      <h2 className="flex-1 text-lg font-semibold text-gray-800 tracking-tight select-none">
        {label}
      </h2>

      <Notification />

      {/* View selector */}
      <div className="flex items-center bg-gray-100 rounded-lg p-0.5 gap-0.5">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onViewChange(opt.value)}
            className={clsx(
              "px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400",
              viewMode === opt.value
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-600 hover:text-gray-800 hover:bg-white/60",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
});

export default CalendarHeader;
