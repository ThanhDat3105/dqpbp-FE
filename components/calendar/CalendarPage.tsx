"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dayjs, { type Dayjs } from "dayjs";
import "dayjs/locale/vi";
import weekday from "dayjs/plugin/weekday";
import isoWeek from "dayjs/plugin/isoWeek";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import clsx from "clsx";

import CalendarHeader from "./CalendarHeader";
import CalendarGrid from "./CalendarGrid";
import type { ViewMode, CalendarMetaData } from "./types";
import { fetchCalendar } from "@/services/api/calendar";

dayjs.extend(weekday);
dayjs.extend(isoWeek);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale("vi");

export default function CalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const today = useMemo(() => dayjs(), []);

  // Parse view mode from URL params (default: "month")
  const viewMode = useMemo(() => {
    const view = searchParams.get("view");
    if (view === "day" || view === "week" || view === "month") {
      return view as ViewMode;
    }
    return "month";
  }, [searchParams]);

  // Parse current date from URL params (default: today)
  const currentDate = useMemo(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const parsed = dayjs(dateParam, "YYYY-MM-DD");
      if (parsed.isValid()) {
        return parsed;
      }
    }
    return today;
  }, [searchParams, today]);

  const [data, setData] = useState<CalendarMetaData>({});
  const [isLoading, setIsLoading] = useState(false);
  const fetchAbortRef = useRef<AbortController | null>(null);

  const headerLabel = useMemo(() => {
    if (viewMode === "day") {
      return currentDate.format("D MMMM YYYY");
    }
    if (viewMode === "week") {
      const start = currentDate.startOf("isoWeek");
      const end = currentDate.endOf("isoWeek");
      if (start.month() === end.month()) {
        return `${start.date()} – ${end.date()} tháng ${start.format("M, YYYY")}`;
      }
      return `${start.format("D MMM")} – ${end.format("D MMM YYYY")}`;
    }
    // month
    return currentDate.format("MMMM YYYY");
  }, [viewMode, currentDate]);

  // Fetch data when viewMode or currentDate from URL changes
  useEffect(() => {
    // Cancel previous fetch if it's still pending
    if (fetchAbortRef.current) {
      fetchAbortRef.current.abort();
    }

    // Create new AbortController for this fetch
    const abortController = new AbortController();
    fetchAbortRef.current = abortController;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await fetchCalendar(viewMode, currentDate);

        // Only update state if this request wasn't aborted
        if (!abortController.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        if (!abortController.signal.aborted) {
          setData({});
        }
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup: cancel fetch if component unmounts or dependencies change
    return () => {
      abortController.abort();
    };
  }, [viewMode, currentDate]);

  // Navigate to previous/next period
  const navigate = useCallback(
    (direction: "prev" | "next") => {
      const delta = direction === "next" ? 1 : -1;
      let newDate: Dayjs;

      if (viewMode === "day") {
        newDate = currentDate.add(delta, "day");
      } else if (viewMode === "week") {
        newDate = currentDate.add(delta * 7, "day");
      } else {
        newDate = currentDate.add(delta, "month");
      }

      const params = new URLSearchParams(searchParams);
      params.set("date", newDate.format("YYYY-MM-DD"));
      router.push(`?${params.toString()}`);
    },
    [viewMode, currentDate, searchParams, router],
  );

  // Navigate to today
  const goToday = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.set("date", today.format("YYYY-MM-DD"));
    router.push(`?${params.toString()}`);
  }, [today, searchParams, router]);

  // Change view mode
  const handleViewChange = useCallback(
    (mode: ViewMode) => {
      const params = new URLSearchParams(searchParams);

      const view = params.get("view");

      if (view === mode) return;

      params.set("view", mode);
      router.push(`?${params.toString()}`);
    },
    [searchParams, router],
  );

  return (
    <div className="relative flex flex-col h-full bg-white rounded-none sm:rounded-xl shadow-none sm:shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <CalendarHeader
        viewMode={viewMode}
        label={headerLabel}
        onPrev={() => navigate("prev")}
        onNext={() => navigate("next")}
        onToday={goToday}
        onViewChange={handleViewChange}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 pointer-events-none">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-gray-500">Đang tải...</span>
          </div>
        </div>
      )}

      {/* Grid */}
      <div
        className={clsx(
          "flex-1 flex flex-col min-h-0 transition-opacity duration-200",
          isLoading && "opacity-50 pointer-events-none",
        )}
      >
        <CalendarGrid
          viewMode={viewMode}
          currentDate={currentDate}
          data={data}
          today={today}
        />
      </div>
    </div>
  );
}
