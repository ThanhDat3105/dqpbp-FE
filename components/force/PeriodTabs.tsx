"use client";

import clsx from "clsx";

export type Period = "week" | "month" | "quarter" | "year";

const TABS: { label: string; value: Period }[] = [
  { label: "Tuần", value: "week" },
  { label: "Tháng", value: "month" },
  { label: "Quý", value: "quarter" },
  { label: "Năm", value: "year" },
];

interface PeriodTabsProps {
  value: Period;
  onChange: (p: Period) => void;
}

export function PeriodTabs({ value, onChange }: PeriodTabsProps) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            "px-3 py-1 text-sm font-medium rounded-md transition-colors cursor-pointer",
            value === tab.value
              ? "bg-[#6B8E23] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
