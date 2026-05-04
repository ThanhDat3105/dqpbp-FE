"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { DEPARTMENT_MAP } from "@/types/user";
import { useAuth } from "@/context/AuthContext";
import { TaskHistoryItem, fetchUserTasks } from "@/services/api/activity-task";
import {
  ArrowLeft,
  Edit,
  FileDown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  Shield,
  Award,
  Clock,
  History,
  TrendingUp,
  UserCircle2,
} from "lucide-react";
import { fetchUserDetail, UserWithKpi } from "@/services/api/user";

export default function UserDetailPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const userId = Number(rawId);

  const [user, setUser] = useState<UserWithKpi | null>(null);
  const [tasks, setTasks] = useState<TaskHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!Number.isFinite(userId)) {
        setError("Không tải được thông tin nhân sự");
        setLoading(false);
        return;
      }

      if (!token) {
        setError("Không tải được thông tin nhân sự");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [userData, taskData] = await Promise.all([
          fetchUserDetail(userId),
          fetchUserTasks(userId),
        ]);

        setUser(userData);
        setTasks(taskData);
      } catch {
        setError("Không tải được thông tin nhân sự");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [userId, token]);

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return "---";
    return new Date(isoStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeInfo = (isoStr: string) => {
    return new Date(isoStr).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-10">
      {loading ? (
        <div className="space-y-6 animate-pulse">
          {/* Skeleton Header */}
          <div className="bg-white rounded-2xl border border-slate-200 h-72" />
          {/* Skeleton Body */}
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="w-full lg:w-90 space-y-6 shrink-0">
              <div className="bg-white rounded-2xl border border-slate-200 h-64" />
              <div className="bg-white rounded-2xl border border-slate-200 h-48" />
            </div>
            <div className="flex-1 bg-white rounded-2xl border border-slate-200 h-96" />
          </div>
        </div>
      ) : error || !user ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <p className="text-red-600 text-sm">
            {error || "Không tải được thông tin nhân sự"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. HEADER SECTION (Facebook Style Hero) */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Cover Image Placeholder */}
            <div className="h-48 md:h-64 bg-linear-to-r from-[#6A7B46] via-[#556B2F] to-[#4A4031] relative">
              {/* Có thể thêm nút "Chỉnh sửa ảnh bìa" ở đây sau này */}
            </div>

            <div className="px-6 pb-6 relative">
              <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-4">
                {/* Avatar & Name Wrapper */}
                <div className="flex flex-col md:flex-row items-center md:items-end gap-5 -mt-16 md:-mt-20 z-10 w-full md:w-auto">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden bg-slate-100 shadow-md shrink-0 relative">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-16 h-16 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>

                  <div className="text-center md:text-left mb-2">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 tracking-tight">
                      {user.name}
                    </h2>
                    <div className="flex items-center justify-center md:justify-start gap-2 mt-1.5">
                      <p className="text-blue-600 font-semibold text-sm bg-blue-50 px-2.5 py-0.5 rounded-full">
                        {user.military_rank} - {user.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions & Status Component */}
                <div className="flex flex-col items-center md:items-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Trạng thái:
                    </span>
                    {user.status === "on_duty" ? (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                        Sẵn sàng chiến đấu
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600">
                        <span className="w-2 h-2 bg-slate-400 rounded-full" />
                        Tranh thủ
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. BODY SECTION (2 Columns) */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Left Column: Info Cards */}
            <div className="w-full lg:w-90 flex flex-col gap-6 shrink-0 lg:sticky lg:top-6">
              {/* Thông tin cá nhân */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCircle2 className="w-5 h-5 text-blue-500" />
                    Giới thiệu
                  </div>
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">
                        Ngày sinh
                      </p>
                      <p className="text-sm text-slate-800 font-medium">
                        {formatDate(user.date_of_birth)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">
                        Số điện thoại
                      </p>
                      <p className="text-sm text-slate-800 font-medium">
                        {user.phone || "---"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500 font-medium mb-0.5">
                        Email
                      </p>
                      <p
                        className="text-sm text-slate-800 font-medium truncate"
                        title={user.email || ""}
                      >
                        {user.email || "---"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">
                        Sống tại
                      </p>
                      <p className="text-sm text-slate-800 font-medium leading-snug">
                        {user.address || "---"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Đơn vị quản lý */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-500" />
                  Đơn vị công tác
                </h3>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">
                        Đơn vị quản lý trực tiếp
                      </p>
                      <p className="text-sm text-slate-800 font-medium">
                        {user.department_name ||
                          DEPARTMENT_MAP[user.department_id] ||
                          "Chưa phân bổ"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">
                        Ngày tham gia / Nhập ngũ
                      </p>
                      <p className="text-sm text-slate-800 font-medium">
                        {formatDate(user.enlistment_date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500 font-medium mb-0.5">
                        Cấp bậc hiện tại
                      </p>
                      <p className="text-sm text-slate-800 font-medium">
                        {user.military_rank || "---"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chỉ số KPI */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-base font-bold text-slate-800 mb-4 pb-3 border-b border-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                  Hiệu suất (KPI)
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      label: "Tổng NV",
                      value: user?.kpi_total_assigned ?? 0,
                      color: "text-slate-800",
                      bg: "bg-slate-50",
                    },
                    {
                      label: "Hoàn thành",
                      value: user?.kpi_completed ?? 0,
                      color: "text-emerald-700",
                      bg: "bg-emerald-50",
                    },
                    {
                      label: "Đúng hạn",
                      value: user?.kpi_on_time ?? 0,
                      color: "text-blue-700",
                      bg: "bg-blue-50",
                    },
                    {
                      label: "Tỉ lệ HT",
                      value:
                        user?.kpi_completion_rate != null
                          ? `${user.kpi_completion_rate}%`
                          : "-",
                      color:
                        (user?.kpi_completion_rate ?? 0) >= 70
                          ? "text-emerald-700"
                          : (user?.kpi_completion_rate ?? 0) >= 40
                            ? "text-amber-700"
                            : "text-red-600",
                      bg:
                        (user?.kpi_completion_rate ?? 0) >= 70
                          ? "bg-emerald-50"
                          : (user?.kpi_completion_rate ?? 0) >= 40
                            ? "bg-amber-50"
                            : "bg-red-50",
                    },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className={`${stat.bg} rounded-xl p-3 text-center border border-white/50`}
                    >
                      <p className="text-xs text-slate-500 font-medium mb-1">
                        {stat.label}
                      </p>
                      <p className={`text-lg font-bold ${stat.color}`}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Task History Timeline */}
            <div className="flex-1 w-full min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
                <History className="w-5 h-5 text-slate-500" />
                Lịch sử nhiệm vụ
              </h3>

              {tasks.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <History className="w-8 h-8 text-slate-300" />
                  </div>
                  <p className="text-slate-600 font-medium">
                    Chưa có nhiệm vụ nào
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    Các nhiệm vụ được giao sẽ hiển thị tại đây.
                  </p>
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-slate-100 space-y-6">
                  {tasks.map((task) => (
                    <div key={task.id} className="relative group">
                      {/* Timeline dot */}
                      <div className="absolute -left-7.75 bg-white p-1 rounded-full border-2 border-white transition-transform group-hover:scale-110">
                        <div
                          className={`w-3.5 h-3.5 rounded-full ${
                            task.status === "completed"
                              ? "bg-emerald-500"
                              : task.status === "in_progress"
                                ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                                : task.status === "cancelled"
                                  ? "bg-red-400"
                                  : "bg-slate-300"
                          }`}
                        />
                      </div>

                      {/* Task Card */}
                      <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2">
                          <div>
                            <h4 className="font-bold text-slate-800 text-base leading-tight">
                              {task.title}
                            </h4>
                            <p className="text-sm text-slate-500 mt-1 font-medium flex items-center gap-1.5">
                              {task.activity.name || "---"}
                              <span className="w-1 h-1 bg-slate-300 rounded-full" />
                              <span className="text-slate-600">
                                {task.activity.work_type || "---"}
                              </span>
                            </p>
                          </div>
                          <StatusBadge status={task.status} />
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-50 flex flex-wrap items-center gap-4 text-xs font-medium">
                          <p
                            className="text-slate-500 flex items-center gap-1.5"
                            title={
                              task.due_date
                                ? formatTimeInfo(task.due_date)
                                : undefined
                            }
                          >
                            <Clock className="w-4 h-4 text-slate-400" />
                            Hạn chót:{" "}
                            <span className="text-slate-700">
                              {formatDate(task.due_date)}
                            </span>
                          </p>

                          {task.completed_at && (
                            <>
                              <span className="text-slate-300 hidden sm:inline">
                                •
                              </span>
                              <p className="text-emerald-600 flex items-center gap-1.5">
                                <Award className="w-4 h-4" />
                                Hoàn thành lúc: {formatDate(task.completed_at)}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    completed: {
      label: "Hoàn thành",
      className: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    },
    in_progress: {
      label: "Đang thực hiện",
      className: "bg-blue-50 text-blue-700 border border-blue-100",
    },
    pending: {
      label: "Chờ thực hiện",
      className: "bg-slate-50 text-slate-600 border border-slate-200",
    },
    cancelled: {
      label: "Đã hủy",
      className: "bg-red-50 text-red-600 border border-red-100",
    },
  };

  const s = map[status] ?? map.pending;

  return (
    <span
      className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${s.className}`}
    >
      {s.label}
    </span>
  );
}

function UserIcon({ className }: { className?: string }) {
  return <UserCircle2 className={className} />;
}
