"use client";

import clsx from "clsx";
import { FileDownloadOutlined } from "@mui/icons-material";
import type { KpiUser } from "@/services/api/kpi-types";
import { getKpiHotTasksExportUrl } from "@/services/api/kpi-hot-tasks";
import Cookies from "js-cookie";
import {
  MemberAvatar,
  MemberProgressBar,
  MemberStatusBadge,
  MemberTableSkeleton,
} from "./member-kpi-table-cells";

const COLUMNS = ["THÀNH VIÊN", "ĐƯỢC GIAO", "HOÀN THÀNH", "TRỄ HẠN", "TỈ LỆ", "TRẠNG THÁI"];

interface MemberKpiTableProps {
  members: KpiUser[];
  loading: boolean;
  showExport?: boolean;
}

export function MemberKpiTable({ members, loading, showExport = false }: MemberKpiTableProps) {
  const handleExport = () => {
    const token = Cookies.get("token");
    const base = getKpiHotTasksExportUrl({ filter: "all" });
    window.open(token ? `${base}&token=${token}` : base, "_blank");
  };

  const hasOverdue = members.some((m) => (m.overdue ?? 0) > 0);

  return (
    <div className="flex flex-col gap-0">
      {/* Section label — chỉ hiện khi có thành viên trễ hạn */}
      {!loading && hasOverdue && (
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-5 rounded-full bg-[#6B8E23] shrink-0" />
          <p className="text-sm font-semibold text-gray-700">
            Thành viên tổ
            </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 text-sm">Danh sách thành viên</h2>
          {showExport && (
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#6B8E23] border border-[#6B8E23] px-3 py-1.5 rounded-lg hover:bg-[#6B8E23] hover:text-white transition-colors cursor-pointer"
            >
              <FileDownloadOutlined fontSize="small" />
              Xuất Excel nhiệm vụ sắp/quá hạn
            </button>
          )}
        </div>

        {loading ? (
          <MemberTableSkeleton />
        ) : members.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            Không có dữ liệu thành viên
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  {COLUMNS.map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {members.map((m, idx) => {
                  const pct = Math.round(m.completion_rate ?? 0);
                  const isOverdue = (m.overdue ?? 0) > 0;
                  return (
                    <tr
                      key={m.user_id}
                      className={clsx(
                        "border-b border-gray-50 transition-colors",
                        isOverdue
                          ? "bg-red-50/60 hover:bg-red-50"
                          : idx % 2 === 1
                            ? "bg-gray-50/40 hover:bg-gray-50/80"
                            : "hover:bg-gray-50/60",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <MemberAvatar name={m.name} index={idx} />
                          <span
                            className={clsx(
                              "font-medium text-sm",
                              isOverdue ? "text-red-700" : "text-gray-800",
                            )}
                          >
                            {m.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                        {m.total_assigned}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-gray-700">
                        {m.completed}
                      </td>
                      <td className="px-4 py-3">
                        {isOverdue ? (
                          <span className="inline-flex items-center gap-1 text-sm font-bold text-red-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                            {m.overdue}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-300 font-medium">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <MemberProgressBar pct={pct} />
                      </td>
                      <td className="px-4 py-3">
                        <MemberStatusBadge pct={pct} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
