"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { KpiUser } from "@/services/api/kpi-types";

interface MemberDistributionChartProps {
  members: KpiUser[];
  loading: boolean;
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-3 px-4 py-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse bg-gray-200 rounded h-5"
          style={{ width: `${60 + i * 8}%` }}
        />
      ))}
    </div>
  );
}

// Màu thanh bar theo completion_rate
function barColor(pct: number) {
  if (pct >= 80) return "#6B8E23";
  if (pct >= 50) return "#f59e0b";
  return "#f87171";
}

export function MemberDistributionChart({
  members,
  loading,
}: MemberDistributionChartProps) {
  const data = [...members]
    .sort((a, b) => b.total_assigned - a.total_assigned)
    .map((m) => {
      const lastName = m.name.trim().split(/\s+/).slice(-2).join(" ");
      return {
        name: lastName,
        total: m.total_assigned,
        completed: m.completed,
        pct: Math.round(m.completion_rate ?? 0),
      };
    });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex-1 min-w-0">
      <h2 className="font-bold text-gray-800 text-sm mb-4">
        Phân bổ nhiệm vụ theo thành viên
      </h2>

      {loading ? (
        <Skeleton />
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-36 text-sm text-gray-400">
          Không có dữ liệu
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={Math.max(data.length * 36, 120)}>
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
            barCategoryGap="20%"
          >
            <XAxis
              type="number"
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={72}
              tick={{ fontSize: 12, fill: "#374151" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: "#f3f4f6" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs">
                    <p className="font-semibold text-gray-800 mb-1">{label}</p>
                    <p className="text-gray-500">
                      Tổng: <span className="font-bold text-gray-700">{d.total}</span>
                    </p>
                    <p className="text-gray-500">
                      Hoàn thành: <span className="font-bold text-green-600">{d.completed}</span>
                    </p>
                    <p className="text-gray-500">
                      Tỉ lệ: <span className="font-bold" style={{ color: barColor(d.pct) }}>{d.pct}%</span>
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]} maxBarSize={22}>
              {data.map((entry, i) => (
                <Cell key={i} fill={barColor(entry.pct)} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
