"use client";

import { PersonalDonutCard } from "./PersonalDonutCard";
import { PersonalHotTasksTable } from "./PersonalHotTasksTable";
import { TrendChart } from "./TrendChart";
import type { KpiSummaryResponse, KpiTrendPoint, HotTask } from "@/services/api/kpi-types";
import type { User } from "@/services/api/auth";

interface PersonalDashboardProps {
  user: User;
  summaryRes: KpiSummaryResponse | null;
  trend: KpiTrendPoint[];
  hotTasks: HotTask[];
  loadingMain: boolean;
  loadingHot: boolean;
}

export function PersonalDashboard({
  user,
  summaryRes,
  trend,
  hotTasks,
  loadingMain,
  loadingHot,
}: PersonalDashboardProps) {
  const subtitle = [user.name, user.department_name, user.position]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-6">
      {/* Subtitle */}
      {subtitle && (
        <p className="text-xs text-[#6B8E23] font-medium -mt-4">{subtitle}</p>
      )}

      {/* Row 1: donut + trend chart */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <PersonalDonutCard summaryRes={summaryRes} loading={loadingMain} />
        <TrendChart
          trend={trend}
          loading={loadingMain}
          title="Xu hướng cá nhân — Giao vs Hoàn thành"
        />
      </section>

      {/* Row 2: hot tasks table */}
      <section>
        <PersonalHotTasksTable tasks={hotTasks} loading={loadingHot} />
      </section>
    </div>
  );
}
