"use client";

import clsx from "clsx";
import type { HotTask } from "@/services/api/kpi-types";

interface PersonalHotTasksTableProps {
  tasks: HotTask[];
  loading: boolean;
}

function formatDueDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}`;
}

function getDaysLabel(iso: string): { label: string; overdue: boolean } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(iso);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - now.getTime()) / 86_400_000);

  if (diff < 0) {
    const n = Math.abs(diff);
    return { label: `Quá ${n} ngày`, overdue: true };
  }
  if (diff === 0) return { label: "Hôm nay", overdue: false };
  return { label: `Còn ${diff} ngày`, overdue: false };
}

function UrgencyBadge({ urgency }: { urgency: HotTask["urgency"] }) {
  if (urgency === "overdue") {
    return (
      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 whitespace-nowrap">
        Không đạt
      </span>
    );
  }
  return (
    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 whitespace-nowrap">
      Cảnh báo
    </span>
  );
}

function Skeleton() {
  return (
    <div className="flex flex-col gap-2 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="animate-pulse bg-gray-200 rounded h-10" />
      ))}
    </div>
  );
}

const COLS = ["NHIỆM VỤ", "LOẠI CÔNG TÁC", "HẠN CHÓT", "CÒN LẠI", "TRẠNG THÁI"];

export function PersonalHotTasksTable({ tasks, loading }: PersonalHotTasksTableProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <span className="w-1 h-5 rounded-full bg-[#6B8E23] shrink-0" />
        <h2 className="font-bold text-gray-800 text-sm">Nhiệm vụ của tôi sắp tới hạn</h2>
        {!loading && tasks.length > 0 && (
          <span className="ml-auto text-xs font-semibold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        )}
      </div>

      {loading ? (
        <Skeleton />
      ) : tasks.length === 0 ? (
        <div className="py-12 text-center text-sm text-gray-400">
          Không có nhiệm vụ nào sắp tới hạn
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {COLS.map((h) => (
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
              {tasks.map((task, idx) => {
                const { label: daysLabel, overdue } = getDaysLabel(task.due_date);
                return (
                  <tr
                    key={task.task_id}
                    className={clsx(
                      "border-b border-gray-50 transition-colors",
                      overdue
                        ? "bg-red-50/50 hover:bg-red-50"
                        : idx % 2 === 1
                          ? "bg-yellow-50/30 hover:bg-yellow-50/60"
                          : "hover:bg-gray-50/60",
                    )}
                  >
                    <td className="px-4 py-3 max-w-[200px]">
                      <p className={clsx("font-semibold text-sm truncate", overdue ? "text-red-700" : "text-gray-800")}>
                        {task.task_title}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {task.activity_name}
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-gray-700 whitespace-nowrap">
                      {formatDueDate(task.due_date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={clsx("text-xs font-semibold", overdue ? "text-red-600" : "text-gray-600")}>
                        {daysLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <UrgencyBadge urgency={task.urgency} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
