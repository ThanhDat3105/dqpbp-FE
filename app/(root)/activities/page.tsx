"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { formatMonth } from "@/utils/formatDate";
import { activityAPI, ActivityInterface } from "@/services/api/activity";
import {
  handleGetDepartment,
  handleGetWorkType,
  getDeadlineDisplay,
} from "@/utils/activity";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import ActivityDetailSheet from "@/components/activity/ActivityDetailSheet";
import ActivityCreateSheet from "@/components/activity/ActivityCreateSheet";
import useDebounce from "@/hooks/useDebounce";
import Loading from "../../../components/Loaing";
import Notification from "@/components/notification/Notification";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { departmentAPI } from "@/services/api/department";
import ActivityCard from "@/components/ActivityCard";
import { LayoutGrid, List } from "lucide-react";
import AppPagination from "@/components/ui/AppPagination";
import { useAuth } from "@/context/AuthContext";

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chưa bắt đầu" },
  { value: "in_progress", label: "Đang thực hiện" },
  { value: "completed", label: "Hoàn thành" },
  { value: "overdue", label: "Quá hạn" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<
    string,
    { bg: string; text: string; dot: string; label: string }
  > = {
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      dot: "bg-yellow-500",
      label: "Chưa bắt đầu",
    },
    in_progress: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      dot: "bg-blue-500",
      label: "Đang thực hiện",
    },
    completed: {
      bg: "bg-green-100",
      text: "text-green-700",
      dot: "bg-green-500",
      label: "Hoàn thành",
    },
    cancelled: {
      bg: "bg-red-100",
      text: "text-red-600",
      dot: "bg-red-500",
      label: "Hủy bỏ",
    },
  };
  const s = map[status] ?? {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

// ─── Progress bar ──────────────────────────────────────────────────────────────

function ProgressCell({ tasks }: { tasks: ActivityInterface["tasks"] }) {
  const progress = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round(
      (tasks.filter((t) => t.status === "completed").length * 100) /
        tasks.length,
    );
  }, [tasks]);

  return (
    <div className="flex items-center gap-2 min-w-25">
      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-[#556B2F]"}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-gray-600 w-8 text-right">
        {progress}%
      </span>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function ActivityListPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityInterface[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [params, setParams] = useState<{
    page: number;
    limit: number;
    currentDate: Date;
    status: string;
  }>({
    page: 1,
    limit: 10,
    currentDate: new Date(),
    status: "all",
  });
  const [department, setDepartment] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [view, setView] = useState<"list" | "card">("list");

  const debouncedParams = useDebounce(params, 300);

  const btnBase =
    "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer";
  const btnActive = "bg-[#556B2F] text-white shadow";
  const btnInactive = "bg-white text-gray-700 hover:bg-gray-100 shadow-sm";

  // ── Month navigation ──
  const handlePrevMonth = () => {
    const d = new Date(params.currentDate);
    d.setMonth(d.getMonth() - 1);
    setParams((prev) => ({ ...prev, currentDate: d }));
  };
  const handleNextMonth = () => {
    const d = new Date(params.currentDate);
    d.setMonth(d.getMonth() + 1);
    setParams((prev) => ({ ...prev, currentDate: d }));
  };

  // ── Fetch ──
  const handleGetActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityAPI.getActivities({
        status: params.status,
        month: params.currentDate.getMonth() + 1,
        year: params.currentDate.getFullYear(),
        page: params.page,
        limit: params.limit,
      });

      setActivities(res.results);
      setTotalCount(res.total);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedParams]);

  const handleGetDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await departmentAPI.getAllDepartment();

      const department = res.map((de) => de.code);

      setDepartment(department);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleGetActivities();
  }, [handleGetActivities]);

  useEffect(() => {
    handleGetDepartments();
  }, [handleGetDepartments]);

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <>
      <main className="flex-1 flex flex-col">
        {/* ── Header ── */}
        <header>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-3">
            {/* LEFT */}
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Danh sách Công tác
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Quản lý và theo dõi các công tác hoạt động
                </p>
              </div>
              <div className="sm:hidden mt-1">
                <Notification />
              </div>
            </div>

            {/* Month navigator */}
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-1 w-full sm:w-auto">
              <div className="flex items-center gap-1 justify-center">
                <button
                  className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={handlePrevMonth}
                  aria-label="Tháng trước"
                >
                  <ArrowLeftIcon className="text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-27.5 text-center">
                  {formatMonth(params.currentDate)}
                </span>
                <button
                  className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={handleNextMonth}
                  aria-label="Tháng sau"
                >
                  <ArrowRightIcon className="text-gray-600" />
                </button>
              </div>
              <button
                onClick={() =>
                  setParams((prev) => ({ ...prev, currentDate: new Date() }))
                }
                className="w-full sm:w-auto sm:ml-1 px-3 py-1.5 bg-[#556B2F] text-white text-sm rounded-md hover:opacity-90 font-bold cursor-pointer mt-1 sm:mt-0"
              >
                Tháng này
              </button>
            </div>

            {/* RIGHT */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="hidden sm:block">
                <Notification />
              </div>
              {/* Create button */}
              {user?.role === "CHI_HUY" && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#556B2F] cursor-pointer text-white rounded-lg shadow hover:opacity-90 transition w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto"
                >
                  <AddIcon fontSize="small" />
                  <span className="font-bold text-sm">Tạo công tác</span>
                </button>
              )}

              {user?.role === "TO_TRUONG" && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-[#556B2F] cursor-pointer text-white rounded-lg shadow hover:opacity-90 transition w-full sm:w-auto mt-2 sm:mt-0 sm:ml-auto"
                >
                  <AddIcon fontSize="small" />
                  <span className="font-bold text-sm">Tạo công tác</span>
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="pt-4 flex-1 flex flex-col overflow-hidden">
          {/* ── Filter bar ── */}
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            {/* Status dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
              <label
                htmlFor="status-filter"
                className="text-sm font-semibold text-gray-700 whitespace-nowrap"
              >
                Trạng thái
              </label>
              <select
                id="status-filter"
                value={params.status}
                onChange={(e) => {
                  setParams((prev) => ({
                    ...prev,
                    page: 1,
                    status: e.target.value,
                  }));
                }}
                className="w-full sm:w-auto text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6B8E23] cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department dropdown */}
            {user?.role === "CHI_HUY" ||
              (user?.role === "TO_TRUONG" && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                  <label
                    htmlFor="dept-filter"
                    className="text-sm font-semibold text-gray-700 whitespace-nowrap"
                  >
                    Bộ phận
                  </label>
                  <select
                    id="dept-filter"
                    value={departmentFilter}
                    onChange={(e) => {
                      setDepartmentFilter(e.target.value);
                      setParams((prev) => ({ ...prev, page: 1 }));
                    }}
                    className="w-full sm:w-auto text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6B8E23] cursor-pointer"
                  >
                    <option value="all">Tất cả</option>
                    {department.map((dept) => (
                      <option key={dept} value={dept}>
                        {handleGetDepartment(dept)}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

            <div className="flex justify-end flex-1">
              <div className="flex gap-1 bg-white/90 rounded-xl p-1 shadow-lg w-fit my-2">
                {(
                  [
                    { key: "list", icon: List },
                    { key: "card", icon: LayoutGrid },
                  ] as const
                ).map(({ key, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setView(key)}
                    className={`${btnBase} ${view === key ? btnActive : btnInactive}`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {view === "list" ? (
            loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loading />
              </div>
            ) : activities.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Không có công tác nào phù hợp.
              </div>
            ) : (
              <>
                {/* Mobile Card List */}
                <div className="flex-1 overflow-auto sm:hidden space-y-3 px-1 pb-4">
                  {activities.map((activity) => (
                    <div
                      key={activity.id}
                      onClick={() => setSelectedId(activity.id)}
                      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm cursor-pointer hover:border-[#6B8E23] transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <StatusBadge status={activity.status} />
                        <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {activity.tasks.length} nhiệm vụ
                        </span>
                      </div>
                      <TooltipProvider delayDuration={100}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                              {activity.name}
                            </h3>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{activity.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="flex gap-2 mb-3 flex-wrap">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-semibold">
                          {handleGetWorkType(activity.work_type)}
                        </span>
                        <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full font-semibold">
                          {handleGetDepartment(activity.department)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-3">
                        <div>
                          {format(activity.start_date, "dd/MM/yyyy")}
                          <span className="text-gray-400 mx-1">→</span>
                          {format(activity.end_date, "dd/MM/yyyy")}
                        </div>
                        {(() => {
                          const deadline = getDeadlineDisplay(
                            activity.end_date,
                            activity.completed_at,
                          );
                          return (
                            <div
                              className={`mt-1 font-medium ${deadline.className}`}
                            >
                              {deadline.text}
                            </div>
                          );
                        })()}
                      </div>
                      <div className="w-full">
                        <ProgressCell tasks={activity.tasks} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop/Tablet Table */}
                <div className="hidden sm:block flex-1 overflow-auto rounded-lg border border-gray-200 bg-white">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-4 py-3 text-left font-semibold text-gray-600 w-10">
                          #
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600 min-w-min-w-50">
                          Tên công tác
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">
                          Loại
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">
                          Bộ phận
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600 min-w-40">
                          Thời gian
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600 min-w-32.5">
                          Tiến độ
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600">
                          Trạng thái
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">
                          Nhiệm vụ
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map((activity, idx) => (
                        <tr
                          key={activity.id}
                          onClick={() => setSelectedId(activity.id)}
                          className={`border-b border-gray-100 cursor-pointer transition-colors hover:bg-[#556B2F]/5 ${
                            idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                          }`}
                        >
                          <td className="px-4 py-3 text-gray-400 font-medium">
                            {(params.page - 1) * params.limit + idx + 1}
                          </td>
                          <td className="px-4 py-3 max-w-65">
                            <TooltipProvider delayDuration={100}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="font-semibold text-gray-900 truncate block max-w-60">
                                    {activity.name}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{activity.name}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-semibold whitespace-nowrap">
                              {handleGetWorkType(activity.work_type)}
                            </span>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full font-semibold whitespace-nowrap">
                              {handleGetDepartment(activity.department)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
                            <div>
                              {format(
                                new Date(activity.start_date),
                                "dd/MM/yyyy",
                              )}
                              <span className="text-gray-400 mx-1">→</span>
                              {format(
                                new Date(activity.end_date),
                                "dd/MM/yyyy",
                              )}
                            </div>
                            {(() => {
                              const deadline = getDeadlineDisplay(
                                activity.end_date,
                                activity.completed_at,
                              );
                              return (
                                <div
                                  className={`mt-0.5 font-medium ${deadline.className}`}
                                >
                                  {deadline.text}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-3">
                            <ProgressCell tasks={activity.tasks} />
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={activity.status} />
                          </td>
                          <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs font-medium hidden md:table-cell">
                            {activity.tasks.length} nhiệm vụ
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <AppPagination
                  page={params.page}
                  limit={params.limit}
                  total={totalCount}
                  onPageChange={handlePageChange}
                />
              </>
            )
          ) : loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loading />
            </div>
          ) : activities.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Không có kế hoạch nào trong tháng này.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {activities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Sheets */}
      <Sheet
        open={!!selectedId}
        onOpenChange={(open: boolean) => !open && setSelectedId(null)}
      >
        <SheetContent
          side="right"
          className="w-120 sm:w-150 overflow-y-auto px-4 py-4 border-none pb-20"
        >
          {selectedId !== null && (
            <ActivityDetailSheet activityId={selectedId} />
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent
          side="right"
          className="w-120 sm:w-150 overflow-y-auto px-4 py-4 border-none pb-20"
        >
          <ActivityCreateSheet
            onCancel={() => setIsCreateOpen(false)}
            onSuccess={(newActivity) => {
              setIsCreateOpen(false);
              setActivities((prev) => [newActivity, ...prev]);
            }}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
