"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import type { KpiDeptOverview } from "@/services/api/kpi-types";

const SEGMENTS = [
  { key: "exceeded" as const, label: "Vượt", color: "#16a34a" },
  { key: "achieved" as const, label: "Đạt", color: "#4ade80" },
  { key: "warning" as const, label: "Cảnh báo", color: "#fbbf24" },
  { key: "failed" as const, label: "Không đạt", color: "#f87171" },
  { key: "in_progress" as const, label: "Đang làm", color: "#93c5fd" },
];

interface TaskStatusDonutProps {
  overview: KpiDeptOverview | null;
  loading: boolean;
}

function Skeleton() {
  return <div className="animate-pulse bg-gray-200 rounded-full w-36 h-36 mx-auto mt-2" />;
}

export function TaskStatusDonut({ overview, loading }: TaskStatusDonutProps) {
  const data = SEGMENTS.map((s) => ({
    ...s,
    value: overview ? (overview[s.key] ?? 0) : 0,
  })).filter((d) => d.value > 0);

  const isEmpty = data.length === 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 w-full md:w-72 shrink-0">
      <h2 className="font-bold text-gray-800 text-sm">Cơ cấu trạng thái nhiệm vụ</h2>

      {loading ? (
        <Skeleton />
      ) : (
        <>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={
                  isEmpty
                    ? [{ label: "Trống", value: 1, color: "#e5e7eb" }]
                    : data
                }
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={68}
                dataKey="value"
                strokeWidth={2}
                stroke="#fff"
              >
                {(isEmpty ? [{ color: "#e5e7eb" }] : data).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, name) => [`${v}`, name]}
                contentStyle={{ borderRadius: 8, fontSize: 11 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="flex flex-col gap-1.5 mt-1">
            {SEGMENTS.map(({ key, label, color }) => (
              <div key={key} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-sm shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-500 flex-1">{label}</span>
                <span className="font-semibold text-gray-700">
                  {overview?.[key] ?? 0}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
