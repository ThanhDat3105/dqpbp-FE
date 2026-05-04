"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { KpiDetailPanel } from "@/components/kpi/KpiDetailPanel";
import type { KpiPeriod } from "@/components/kpi/KpiPageLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";

export default function KpiMePage() {
  const { user, isLoadingFetchUser } = useAuth();
  const router = useRouter();
  const [period, setPeriod] = useState<KpiPeriod>("month");

  useEffect(() => {
    if (isLoadingFetchUser || !user) {
      return;
    }

    if (user.role !== "DQTT" && user.role !== "DQCD") {
      router.replace("/dashboard/kpi");
    }
  }, [isLoadingFetchUser, user, router]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">KPI Cá Nhân</h1>
          <p className="text-xs text-slate-500">Theo dõi hiệu suất của bạn</p>
        </div>

        <Select value={period} onValueChange={(value: KpiPeriod) => setPeriod(value)}>
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

      <KpiDetailPanel userId={user?.id ?? null} period={period} />
    </div>
  );
}
