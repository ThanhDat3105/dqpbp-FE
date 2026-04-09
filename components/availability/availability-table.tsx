"use client";

import { useState, useMemo } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  UserSchedule,
  DAY_KEYS,
  DAY_LABELS,
  STATUS_CONFIG,
  SlotStatus,
} from "./availability-data";
import AvailabilityRow from "./availability-row";
import { cn } from "@/lib/utils";

interface AvailabilityTableProps {
  users: UserSchedule[];
  weekLabel?: string;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}

const LEGEND_ORDER: SlotStatus[] = [
  "available", "busy", "partial", "flexible", "night", "off",
];

export default function AvailabilityTable({
  users,
  weekLabel,
  onPrevWeek,
  onNextWeek,
}: AvailabilityTableProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      search.trim()
        ? users.filter((u) =>
            u.name.toLowerCase().includes(search.toLowerCase()),
          )
        : users,
    [users, search],
  );

  const handleExport = () => {
    toast.info("Đang xuất file Excel...");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-gray-200 bg-gray-50/50">
        {/* Week label + navigation */}
        {weekLabel && (
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            {onPrevWeek && (
              <button
                id="avail-prev-week"
                onClick={onPrevWeek}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                aria-label="Tuần trước"
              >
                ‹
              </button>
            )}
            <span>{weekLabel}</span>
            {onNextWeek && (
              <button
                id="avail-next-week"
                onClick={onNextWeek}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
                aria-label="Tuần sau"
              >
                ›
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 ml-auto">
          {/* Search filter */}
          <input
            id="avail-search"
            type="text"
            placeholder="Tìm theo tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/40 w-48"
          />

          {/* Export */}
          <Button
            id="avail-export-btn"
            size="sm"
            onClick={handleExport}
            className="gap-1.5 bg-[#217346] hover:bg-[#1a5c38] text-white border-0 h-8"
          >
            <Download className="h-3.5 w-3.5" />
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
          Chú thích:
        </span>
        {LEGEND_ORDER.map((status) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <div key={status} className="flex items-center gap-1.5">
              <span
                className={cn(
                  "w-3.5 h-3.5 rounded-sm border",
                  cfg.bg,
                  cfg.border,
                )}
              />
              <span className="text-xs text-gray-600">{cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          {/* Header */}
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              {/* Name */}
              <th
                className="border border-gray-300 px-3 py-2.5 text-left font-semibold text-gray-700 text-xs sticky left-0 z-20 bg-gray-100 min-w-[140px]"
                rowSpan={1}
              >
                Tên
              </th>

              {/* Shift */}
              <th className="border border-gray-300 px-2 py-2.5 text-center font-semibold text-gray-700 text-xs min-w-[58px]">
                Ca
              </th>

              {/* Days */}
              {DAY_KEYS.map((day) => (
                <th
                  key={day}
                  className={cn(
                    "border border-gray-300 px-2 py-2.5 text-center font-semibold text-gray-700 text-xs min-w-[90px]",
                    day === "sunday" && "bg-red-50 text-red-700",
                    day === "saturday" && "bg-orange-50 text-orange-700",
                  )}
                >
                  {DAY_LABELS[day]}
                </th>
              ))}

              {/* Total */}
              <th className="border border-gray-300 px-2 py-2.5 text-center font-semibold text-gray-700 text-xs min-w-[80px]">
                Số lần<br />huy động
              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="py-16 text-center text-gray-400 text-sm"
                >
                  Không tìm thấy người dùng phù hợp
                </td>
              </tr>
            ) : (
              filtered.map((user, i) => (
                <AvailabilityRow key={user.id} user={user} isEven={i % 2 === 0} />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer ── */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between text-xs text-gray-400">
        <span>
          {filtered.length} / {users.length} thành viên
        </span>
        <span>Cập nhật: {new Date().toLocaleString("vi-VN")}</span>
      </div>
    </div>
  );
}
