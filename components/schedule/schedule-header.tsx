"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeekSchedule } from "./schedule-data";
import Notification from "@/components/notification/Notification";

interface ScheduleHeaderProps {
  schedule: WeekSchedule;
  onExport: () => void;
}

export default function ScheduleHeader({
  schedule,
  onExport,
}: ScheduleHeaderProps) {
  return (
    <header>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Lịch Trực Dân Quân
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Quản lý lịch trực tuần cho các tổ dân quân
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Notification />

          <Button
            id="export-excel-btn"
            size="sm"
            onClick={onExport}
            className="gap-1.5 bg-[#217346] hover:bg-[#1a5c38] text-white border-0"
          >
            <Download className="h-4 w-4" />
            Xuất Excel
          </Button>
        </div>
      </div>
    </header>
  );
}
