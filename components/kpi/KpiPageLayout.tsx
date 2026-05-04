"use client";

import { useEffect, useState } from "react";

import { KpiDetailPanel } from "@/components/kpi/KpiDetailPanel";
import { KpiUserTable } from "@/components/kpi/KpiUserTable";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { KpiUser } from "@/services/api/kpi";

export type KpiPeriod = "week" | "month" | "quarter" | "year";
export type KpiRoleFilter = "all" | "DQTT" | "DQCD";

interface KpiPageLayoutProps {
  users: KpiUser[];
  selectedUserId: number | null;
  onSelectUser: (userId: number) => void;
  period: KpiPeriod;
  onPeriodChange: (period: KpiPeriod) => void;
  roleFilter: KpiRoleFilter;
  onRoleFilterChange: (role: KpiRoleFilter) => void;
  isListLoading?: boolean;
}

export function KpiPageLayout({
  users,
  selectedUserId,
  onSelectUser,
  period,
  onPeriodChange,
  roleFilter,
  onRoleFilterChange,
  isListLoading = false,
}: KpiPageLayoutProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 1023px)");
    const update = () => setIsMobile(media.matches);

    update();
    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  const handleSelectUser = (userId: number) => {
    onSelectUser(userId);
    if (isMobile) {
      setMobileDetailOpen(true);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">
            KPI Lực Lượng
          </h1>
          <p className="text-xs text-slate-500">
            Theo dõi hiệu suất DQTT / DQCD
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={roleFilter}
            onValueChange={(value: KpiRoleFilter) => onRoleFilterChange(value)}
          >
            <SelectTrigger className="h-8 w-30">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Role: Tất cả</SelectItem>
              <SelectItem value="DQTT">Role: DQTT</SelectItem>
              <SelectItem value="DQCD">Role: DQCD</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={period}
            onValueChange={(value: KpiPeriod) => onPeriodChange(value)}
          >
            <SelectTrigger className="h-8 w-32.5">
              <SelectValue placeholder="Kỳ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Tuần này</SelectItem>
              <SelectItem value="month">Tháng này</SelectItem>
              <SelectItem value="quarter">Quý này</SelectItem>
              <SelectItem value="year">Năm này</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-10">
        <div className="lg:col-span-4">
          <KpiUserTable
            users={users}
            selectedUserId={selectedUserId}
            onSelect={handleSelectUser}
            isLoading={isListLoading}
          />
        </div>

        <div className="hidden lg:col-span-6 lg:block">
          <KpiDetailPanel userId={selectedUserId} period={period} />
        </div>
      </div>

      <Sheet open={mobileDetailOpen} onOpenChange={setMobileDetailOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md lg:hidden p-6 border-none"
        >
          <SheetHeader className="p-0">
            <SheetTitle className="text-2xl font-bold text-gray-900">
              Chi tiết KPI
            </SheetTitle>
            <SheetDescription className="text-sm text-gray-500 mt-1">
              Kết quả theo kỳ đã chọn
            </SheetDescription>
          </SheetHeader>

          <div className="mt-3">
            <KpiDetailPanel userId={selectedUserId} period={period} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
