"use client";

import { PIN_CONFIG } from "./types";
import type { Person, PersonType } from "./types";

interface FilterSidebarProps {
  visibleTypes: Record<PersonType, boolean>;
  onToggle: (type: PersonType) => void;
  persons: Person[];
}

const FILTER_TYPES: PersonType[] = ["TUOI_17", "QUAN_NHAN_DU_BI", "DQCD"];
const DISPLAY_COUNTS: Record<PersonType, number> = {
  TUOI_17: 14,
  QUAN_NHAN_DU_BI: 48,
  DQCD: 19,
  HQ: 1,
};

export default function FilterSidebar({
  visibleTypes,
  onToggle,
  persons,
}: FilterSidebarProps) {
  const allChecked = FILTER_TYPES.every((t) => visibleTypes[t]);

  function handleSelectAll() {
    const next = !allChecked;
    FILTER_TYPES.forEach((t) => {
      if (visibleTypes[t] !== next) onToggle(t);
    });
  }

  function countOf(type: PersonType) {
    return persons.filter((p) => p.type === type && visibleTypes[type]).length;
  }

  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl shadow-2xl"
      style={{ width: 260, minWidth: 220, maxHeight: "80vh" }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{ background: "#6B8E23" }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <span className="text-white font-semibold text-sm tracking-wide">
          Lọc theo danh sách
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col bg-white flex-1 overflow-y-auto">
        {/* Select all */}
        <label className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={handleSelectAll}
            className="w-4 h-4 accent-green-600 cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700">Chọn tất cả</span>
        </label>

        {/* Per-type rows */}
        {FILTER_TYPES.map((type) => {
          const cfg = PIN_CONFIG[type];
          const checked = visibleTypes[type];
          const count = countOf(type);
          return (
            <label
              key={type}
              className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(type)}
                className="w-4 h-4 cursor-pointer"
                style={{ accentColor: cfg.color }}
              />
              {/* Color dot */}
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: cfg.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">
                  {cfg.label}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {cfg.sublabel}
                </div>
              </div>
              {/* Count badge */}
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full text-white shrink-0"
                style={{ background: checked ? cfg.color : "#9CA3AF" }}
              >
                {DISPLAY_COUNTS[type]}
              </span>
            </label>
          );
        })}

        {/* HQ row (always visible, no toggle) */}
        <div className="flex items-center gap-3 px-4 py-3">
          <span
            className="w-4 h-4 shrink-0 flex items-center justify-center"
            title="Trụ sở"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#D69E2E">
              <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
            </svg>
          </span>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-gray-800">
              Trụ sở UBND
            </div>
            <div className="text-xs text-gray-500">Trụ sở Phường</div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white bg-yellow-500 shrink-0">
            1
          </span>
        </div>
      </div>
    </div>
  );
}
