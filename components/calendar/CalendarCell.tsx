"use client";

import { memo, useState, useRef, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import clsx from "clsx";
import { createPortal } from "react-dom";
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

type ItemShape = {
  id: string;
  taskId?: number;
  title: string;
  status?: "pending" | "completed";
  subLabel?: string;
  taskCount?: number;
  isActivity?: boolean;
};

// ─────────────────────────────────────────────────────────────────────────────
// Unified popover — used for both "overflow items" (desktop) and
// "all items" (mobile tap on cell). Anchors to the triggering element.
// ─────────────────────────────────────────────────────────────────────────────
function CellPopover({
  items,
  anchorRect,
  date,
  onClose,
}: {
  items: ItemShape[];
  anchorRect: DOMRect;
  date: string;
  onClose: () => void;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const POPOVER_WIDTH = 260;

  useEffect(() => {
    const handleClick = (e: MouseEvent | TouchEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node))
        onClose();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    // slight delay so the same tap that opened it doesn't immediately close it
    const t = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("touchstart", handleClick);
    }, 50);
    document.addEventListener("keydown", handleKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("touchstart", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  // Position: prefer below anchor, flip if near edge
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const estimatedH = 52 + items.length * 44;

  let left = anchorRect.left;
  let top = anchorRect.bottom + 6;

  if (left + POPOVER_WIDTH > vw - 8)
    left = Math.max(8, anchorRect.right - POPOVER_WIDTH);
  if (left < 8) left = 8;
  if (top + estimatedH > vh - 8)
    top = Math.max(8, anchorRect.top - estimatedH - 6);

  return createPortal(
    <>
      {/* Backdrop — transparent, just captures outside tap */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 9998 }}
        onMouseDown={onClose}
        onTouchStart={onClose}
      />

      <div
        ref={popoverRef}
        style={{ left, top, width: POPOVER_WIDTH, zIndex: 9999 }}
        className="fixed bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 bg-gray-50">
          <div>
            <p className="text-xs font-semibold text-gray-700">
              {dayjs(date).format("dddd")}
            </p>
            <p className="text-[10px] text-gray-400">
              {dayjs(date).format("DD/MM/YYYY")}
            </p>
          </div>
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors text-xs"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-1 p-2 max-h-72 overflow-y-auto">
          {items.map((item) => (
            <div
              key={item.id}
              // Close popover as user navigates away
              onClick={onClose}
              onTouchStart={(e) => e.stopPropagation()}
            >
              <EventItem
                task={item}
                taskId={item.taskId}
                title={item.title}
                status={item.status}
                subLabel={item.subLabel}
                taskCount={item.taskCount}
                isActivity={item.isActivity}
                compact={false}
              />
            </div>
          ))}
        </div>
      </div>
    </>,
    document.body,
  );
}

function DotRow({ items }: { items: ItemShape[] }) {
  return (
    <div className="flex items-center justify-center gap-0.75 mt-0.5">
      {items.map((item) => (
        <span
          key={item.id}
          className={clsx(
            "w-1.25 h-1.25 rounded-full shrink-0",
            item.isActivity
              ? "bg-blue-500"
              : item.status === "completed"
                ? "bg-emerald-500"
                : "bg-amber-400",
          )}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CalendarCell
// ─────────────────────────────────────────────────────────────────────────────
const CalendarCell = memo(function CalendarCell({
  date,
  dayData,
  role,
  isToday,
  isCurrentMonth = true,
  compact = false,
  maxVisible = 2,
}: CalendarCellProps) {
  const d = dayjs(date);
  const hasData = dayData && dayData.length > 0;
  const cellRef = useRef<HTMLDivElement>(null);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverItems, setPopoverItems] = useState<ItemShape[]>([]);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  // ── Build items ────────────────────────────────────────────────────────────
  const items: ItemShape[] = [];

  if (hasData) {
    if (role === "CHI_HUY" && isActivityList(dayData)) {
      const activityMap = new Map<
        string,
        { task_id: number; title: string; status: "pending" | "completed" }[]
      >();
      for (const act of dayData as CalendarActivity[]) {
        const existing = activityMap.get(act.activity_name) || [];
        activityMap.set(act.activity_name, [
          ...existing,
          ...act.tasks.map((t) => ({
            task_id: t.task_id,
            title: t.title,
            status: t.status,
          })),
        ]);
      }
      for (const [activityName, tasks] of activityMap.entries()) {
        if (tasks.length > 0)
          items.push({
            id: activityName,
            title: activityName,
            taskCount: tasks.length,
            isActivity: true,
          });
      }
    } else if (isActivityList(dayData)) {
      for (const act of dayData as CalendarActivity[]) {
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
      for (const t of dayData as CalendarTaskItem[]) {
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

  const desktopVisible = items.slice(0, maxVisible);

  // ── Open popover ───────────────────────────────────────────────────────────
  const openPopover = useCallback(
    (e: React.MouseEvent | React.TouchEvent, itemsToShow: ItemShape[]) => {
      e.stopPropagation();
      const rect =
        "currentTarget" in e
          ? (e.currentTarget as HTMLElement).getBoundingClientRect()
          : cellRef.current?.getBoundingClientRect();
      if (!rect) return;
      setAnchorRect(rect);
      setPopoverItems(itemsToShow);
      setPopoverOpen(true);
    },
    [],
  );

  // Mobile: tap anywhere on the cell → show ALL items
  const handleCellTap = useCallback(
    (e: React.MouseEvent) => {
      if (!hasData) return;
      // Only handle on touch/mobile — on desktop EventItems handle their own clicks
      const isTouch = window.matchMedia(
        "(hover: none) and (pointer: coarse)",
      ).matches;
      if (!isTouch) return;
      openPopover(e, items);
    },
    [hasData, items, openPopover],
  );

  // Desktop "+N more" button
  const handleMoreClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      openPopover(e, items);
    },
    [items, openPopover],
  );

  return (
    <>
      <div
        ref={cellRef}
        onClick={handleCellTap}
        className={clsx(
          "flex flex-col h-full min-h-0 transition-colors duration-150 select-none",
          !isCurrentMonth && "opacity-35",
          hasData &&
            "sm:cursor-default active:bg-gray-50 sm:active:bg-transparent",
        )}
      >
        {/* Day number */}
        <div className="flex items-center justify-end shrink-0 mb-0.5 sm:mb-1">
          <span
            className={clsx(
              "flex items-center justify-center font-semibold rounded-full transition-all duration-150",
              "w-5 h-5 text-[11px] sm:w-6 sm:h-6 sm:text-sm lg:w-7 lg:h-7 lg:text-base",
              isToday
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-gray-700 sm:hover:bg-gray-100",
            )}
          >
            {d.date()}
          </span>
        </div>

        {/* Mobile: dots (decorative) — whole cell is the tap target */}
        {hasData && (
          <div
            onClick={handleMoreClick}
            className="sm:hidden w-full h-full cursor-pointer"
          >
            <DotRow items={items} />
          </div>
        )}

        {/* sm+: full EventItem pills */}
        {hasData && (
          <div className="hidden sm:flex flex-1 min-h-0 flex-col gap-0.5 overflow-hidden">
            {desktopVisible.map((item) => (
              <EventItem
                key={item.id}
                task={item}
                taskId={item.taskId}
                title={item.title}
                status={item.status}
                subLabel={item.subLabel}
                taskCount={item.taskCount}
                isActivity={item.isActivity}
                compact={compact}
              />
            ))}

            {items.length > 0 && (
              <button
                onClick={handleMoreClick}
                className={clsx(
                  "text-left text-[10px] font-medium pl-1 py-0.5 rounded w-full cursor-pointer",
                  "text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50",
                  "transition-colors duration-100",
                  popoverOpen && "bg-emerald-50 text-emerald-900",
                )}
              >
                +{items.length} more
              </button>
            )}
          </div>
        )}

        {!hasData && <div className="flex-1" />}
      </div>

      {/* Unified popover */}
      {popoverOpen && anchorRect && (
        <CellPopover
          items={popoverItems}
          anchorRect={anchorRect}
          date={date}
          onClose={() => setPopoverOpen(false)}
        />
      )}
    </>
  );
});

export default CalendarCell;
