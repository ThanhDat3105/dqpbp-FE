"use client";

import { PieChart, Pie, Cell } from "recharts";
import type { KpiSummaryResponse } from "@/services/api/kpi-types";

interface PersonalDonutCardProps {
  summaryRes: KpiSummaryResponse | null;
  loading: boolean;
}

function Skeleton() {
  return <div className="animate-pulse bg-gray-200 rounded-xl h-48" />;
}

export function PersonalDonutCard({ summaryRes, loading }: PersonalDonutCardProps) {
  if (loading) return <Skeleton />;

  const s = summaryRes?.summary;
  const total = s?.total_assigned ?? 0;
  const completed = s?.completed ?? 0;
  const onTime = s?.completed_on_time ?? 0;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filled = Math.min(pct, 100);
  const pieData = [
    { value: filled, color: "#6B8E23" },
    { value: 100 - filled, color: "#e5e7eb" },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-center gap-6">
      {/* Donut */}
      <div className="relative shrink-0">
        <PieChart width={120} height={120}>
          <Pie
            data={pieData}
            cx={55}
            cy={55}
            innerRadius={38}
            outerRadius={54}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            {pieData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold text-gray-900">{pct}%</span>
          <span className="text-[10px] text-gray-400 font-medium leading-tight">hoàn thành</span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-3">
        <p className="text-sm font-bold text-gray-700">Tỉ lệ hoàn thành của tôi</p>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-24">Được giao</span>
            <span className="text-sm font-bold text-gray-800">{total}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-24">Hoàn thành</span>
            <span className="text-sm font-bold text-[#6B8E23]">{completed}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 w-24">Đúng hạn</span>
            <span className="text-sm font-bold text-blue-600">{onTime}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
