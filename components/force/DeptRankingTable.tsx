"use client";

import clsx from "clsx";
import type { KpiDeptStat } from "@/services/api/kpi-types";

interface DeptRankingTableProps {
  departments: KpiDeptStat[];
  loading: boolean;
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 rounded h-9" />
      ))}
    </div>
  );
}

function CompletionBar({ pct }: { pct: number }) {
  const color =
    pct >= 80 ? "bg-green-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={clsx("h-full rounded-full transition-all", color)}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span
        className={clsx(
          "text-xs font-bold w-10 text-right shrink-0",
          pct >= 80
            ? "text-green-600"
            : pct >= 50
              ? "text-yellow-600"
              : "text-red-500",
        )}
      >
        {pct}%
      </span>
    </div>
  );
}

export function DeptRankingTable({
  departments,
  loading,
}: DeptRankingTableProps) {
  const ranked = [...departments]
    .map((d) => {
      const achieved = (d.exceeded ?? 0) + (d.achieved ?? 0);
      const pct = d.total > 0 ? Math.round((achieved / d.total) * 100) : 0;
      return { ...d, pct };
    })
    .sort((a, b) => b.pct - a.pct);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h2 className="font-bold text-gray-800 text-sm">Bảng xếp hạng tổ</h2>
      </div>

      {loading ? (
        <Skeleton />
      ) : ranked.length === 0 ? (
        <div className="py-10 text-center text-sm text-gray-400">
          Chưa có dữ liệu
        </div>
      ) : (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {["#", "Tổ", "Hoàn thành", "Quá hạn"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ranked.map((dept, idx) => (
              <tr
                key={dept.department_id ?? idx}
                className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
              >
                <td className="px-4 py-3 text-xs font-bold text-gray-400 w-8">
                  {idx + 1}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800 text-sm max-w-[120px] truncate">
                  {dept.department_name}
                </td>
                <td className="px-4 py-3 w-48">
                  <CompletionBar pct={dept.pct} />
                </td>
                <td className="px-4 py-3">
                  {dept.failed > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                      {dept.failed}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
