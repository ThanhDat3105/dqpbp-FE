"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { KpiTrendPoint } from "@/services/api/kpi-types";

interface TrendChartProps {
  trend: KpiTrendPoint[];
  loading: boolean;
  title?: string;
}

function Skeleton() {
  return <div className="animate-pulse bg-gray-200 rounded-lg h-52 mt-4" />;
}

export function TrendChart({ trend, loading, title = "Xu hướng Giao vs Hoàn thành" }: TrendChartProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex-1 min-w-0">
      <h2 className="font-bold text-gray-800 text-sm">{title}</h2>
      <p className="text-xs text-gray-400 mt-0.5">Giao vs Hoàn thành theo tuần</p>

      {loading ? (
        <Skeleton />
      ) : trend.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-sm text-gray-400 mt-4">
          Chưa có dữ liệu
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220} className="mt-4">
          <BarChart
            data={trend}
            margin={{ top: 16, right: 8, left: -20, bottom: 0 }}
            barCategoryGap="30%"
            barGap={4}
          >
            <XAxis
              dataKey="week_label"
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 12 }}
              formatter={(v, name) => [
                `${Number(v)} nhiệm vụ`,
                name === "created" ? "Giao" : "Hoàn thành",
              ]}
            />
            <Legend
              formatter={(value) =>
                value === "created" ? "Giao" : "Hoàn thành"
              }
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
            <Bar dataKey="created" fill="#c8d9a0" radius={[4, 4, 0, 0]} />
            <Bar dataKey="completed" fill="#6B8E23" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
