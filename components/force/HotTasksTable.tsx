"use client";

import clsx from "clsx";
import { FileDownloadOutlined } from "@mui/icons-material";
import type { HotTask, HotTaskFilter } from "@/services/api/kpi-types";
import Cookies from "js-cookie";

interface HotTasksTableProps {
  tasks: HotTask[];
  total: number;
  loading: boolean;
  filter: HotTaskFilter;
  onFilterChange: (f: HotTaskFilter) => void;
  exportUrl: string;
}

const FILTER_TABS: { label: string; value: HotTaskFilter }[] = [
  { label: "Tất cả", value: "all" },
  { label: "Quá hạn", value: "overdue" },
  { label: "Sắp hết hạn", value: "warning" },
];

function UrgencyBadge({ urgency }: { urgency: HotTask["urgency"] }) {
  return (
    <span
      className={clsx(
        "text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap",
        urgency === "overdue"
          ? "bg-red-100 text-red-700"
          : "bg-yellow-100 text-yellow-700",
      )}
    >
      {urgency === "overdue" ? "Quá hạn" : "Cảnh báo"}
    </span>
  );
}

function formatDueDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 rounded h-10" />
      ))}
    </div>
  );
}

function AssigneeAvatars({ assignees }: { assignees: HotTask["assignees"] }) {
  if (assignees.length === 0) return <span className="text-gray-300 text-xs">—</span>;
  const first = assignees[0];
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
        {first.user_initials}
      </span>
      <span className="text-xs text-gray-700 font-medium truncate max-w-[80px]">
        {first.user_name}
      </span>
      {assignees.length > 1 && (
        <span className="text-xs text-gray-400">+{assignees.length - 1}</span>
      )}
    </div>
  );
}

export function HotTasksTable({
  tasks,
  total,
  loading,
  filter,
  onFilterChange,
  exportUrl,
}: HotTasksTableProps) {
  const handleExport = () => {
    const token = Cookies.get("token");
    const url = token ? `${exportUrl}${exportUrl.includes("?") ? "&" : "?"}token=${token}` : exportUrl;
    window.open(url, "_blank");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-gray-800 text-sm">
            Điểm nóng — quá hạn &amp; sắp hết hạn
          </h2>
          {total > 0 && (
            <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              {total}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => onFilterChange(tab.value)}
                className={clsx(
                  "px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer",
                  filter === tab.value
                    ? "bg-white text-gray-800 shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Export button */}
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6B8E23] border border-[#6B8E23] px-3 py-1.5 rounded-lg hover:bg-[#6B8E23] hover:text-white transition-colors cursor-pointer"
          >
            <FileDownloadOutlined fontSize="small" />
            Excel
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <Skeleton />
      ) : tasks.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">
          Không có nhiệm vụ nào
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Nhiệm vụ", "Người phụ trách", "Tổ", "Hạn", "TT"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {tasks.map((task, idx) => (
                <tr
                  key={task.task_id}
                  className={clsx(
                    "border-b border-gray-50 hover:bg-gray-50/60 transition-colors",
                    idx % 2 === 1 && "bg-gray-50/30",
                  )}
                >
                  <td className="px-4 py-3 max-w-[180px]">
                    <p className="font-medium text-gray-800 truncate text-sm">
                      {task.task_title}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {task.activity_name}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <AssigneeAvatars assignees={task.assignees} />
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 font-medium whitespace-nowrap">
                    {task.assignees[0]?.department_name ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                    {formatDueDate(task.due_date)}
                  </td>
                  <td className="px-4 py-3">
                    <UrgencyBadge urgency={task.urgency} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
