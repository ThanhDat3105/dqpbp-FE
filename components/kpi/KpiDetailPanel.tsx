"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckCircle, Clock, ListTodo, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { KpiStatCard } from "@/components/kpi/KpiStatCard";
import { cn } from "@/lib/utils";
import {
  getKpiUser,
  getRecentTasks,
  KpiRecentTask,
  KpiUser,
} from "@/services/api/kpi";

interface KpiDetailPanelProps {
  userId: number | null;
  period: "week" | "month" | "quarter" | "year";
}

const roleBadgeClass: Record<string, string> = {
  DQTT: "bg-blue-100 text-blue-700 border-blue-200",
  DQCD: "bg-orange-100 text-orange-700 border-orange-200",
};

const taskStatusClass: Record<KpiRecentTask["status"], string> = {
  pending: "bg-slate-100 text-slate-700 border-slate-200",
  in_progress: "bg-blue-100 text-blue-700 border-blue-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const taskStatusLabel: Record<KpiRecentTask["status"], string> = {
  pending: "Chờ xử lý",
  in_progress: "Đang làm",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const completionTone = (value: number): "green" | "amber" | "red" => {
  if (value >= 70) {
    return "green";
  }
  if (value >= 40) {
    return "amber";
  }
  return "red";
};

export function KpiDetailPanel({ userId, period }: KpiDetailPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<KpiUser | null>(null);
  const [tasks, setTasks] = useState<KpiRecentTask[]>([]);

  useEffect(() => {
    if (!userId) {
      setUserData(null);
      setTasks([]);
      return;
    }

    const fetchDetail = async () => {
      setIsLoading(true);

      try {
        const [kpiResponse, taskResponse] = await Promise.all([
          getKpiUser({ user_id: userId, period }),
          getRecentTasks({ user_id: userId, limit: 5 }),
        ]);

        setUserData(kpiResponse.data[0] ?? null);
        setTasks(taskResponse.slice(0, 5));
      } catch (error) {
        console.error(error);
        toast.error("Không tải được dữ liệu KPI");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetail();
  }, [userId, period]);

  const stats = useMemo(() => {
    if (!userData) {
      return [];
    }

    return [
      {
        title: "Tổng nhiệm vụ",
        value: userData.total_assigned,
        icon: ListTodo,
        tone: "default" as const,
      },
      {
        title: "Hoàn thành",
        value: userData.completed,
        icon: CheckCircle,
        tone: "green" as const,
      },
      {
        title: "Đúng hạn",
        value: userData.on_time,
        icon: Clock,
        tone: "blue" as const,
      },
      {
        title: "Tỉ lệ HT",
        value: `${userData.completion_rate.toFixed(2)}%`,
        icon: TrendingUp,
        tone: completionTone(userData.completion_rate),
      },
    ];
  }, [userData]);

  if (!userId) {
    return (
      <div className="flex h-full min-h-105 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
        Chọn một thành viên để xem KPI
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-14 rounded-full" />
          </div>
        ) : userData ? (
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              {userData.name}
            </h3>
            <Badge
              className={cn(
                "mt-1 border",
                roleBadgeClass[userData.role] ?? "bg-slate-100 text-slate-700",
              )}
            >
              {userData.role}
            </Badge>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Không có dữ liệu KPI</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`detail-skeleton-${index}`}
                className="rounded-lg border border-slate-200 bg-white p-3"
              >
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-7 w-16" />
              </div>
            ))
          : stats.map((stat) => (
              <KpiStatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                tone={stat.tone}
              />
            ))}
      </div>

      <div className="mt-3 rounded-lg border border-slate-200">
        <div className="border-b border-slate-200 px-3 py-2">
          <h4 className="text-sm font-medium text-slate-700">
            Nhiệm vụ gần đây
          </h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-115 text-sm">
            <thead className="text-xs text-slate-500">
              <tr className="border-b border-slate-100">
                <th className="px-3 py-2 text-left font-medium">
                  Tên nhiệm vụ
                </th>
                <th className="px-3 py-2 text-left font-medium">Công tác</th>
                <th className="px-3 py-2 text-left font-medium">
                  Ngày hết hạn
                </th>
                <th className="px-3 py-2 text-left font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, index) => (
                    <tr
                      key={`task-skeleton-${index}`}
                      className="border-b border-slate-100"
                    >
                      <td className="px-3 py-2">
                        <Skeleton className="h-4 w-30" />
                      </td>
                      <td className="px-3 py-2">
                        <Skeleton className="h-4 w-22" />
                      </td>
                      <td className="px-3 py-2">
                        <Skeleton className="h-4 w-18" />
                      </td>
                      <td className="px-3 py-2">
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </td>
                    </tr>
                  ))
                : tasks.map((task) => (
                    <tr key={task.id} className="border-b border-slate-100">
                      <td className="px-3 py-2 text-slate-700">{task.title}</td>
                      <td className="px-3 py-2 text-slate-600">
                        {task.activity.name}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {task.due_date
                          ? format(new Date(task.due_date), "dd/MM/yyyy", {
                              locale: vi,
                            })
                          : "-"}
                      </td>
                      <td className="px-3 py-2">
                        <Badge
                          className={cn(
                            "border",
                            taskStatusClass[task.status] ??
                              taskStatusClass.pending,
                          )}
                        >
                          {taskStatusLabel[task.status] ?? "Chờ xử lý"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {!isLoading && tasks.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-slate-500">
            Chưa có nhiệm vụ gần đây
          </p>
        )}
      </div>
    </div>
  );
}
