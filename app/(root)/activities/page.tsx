"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import { formatMonth } from "@/utils/formatDate";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

// ─── Status helpers ────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: "Chưa bắt đầu" },
  { value: "in_progress", label: "Đang thực hiện" },
  { value: "completed", label: "Hoàn thành" },
  { value: "cancelled", label: "Hủy bỏ" },
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
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all ${progress === 100 ? "bg-green-500" : "bg-[#6B8E23]"}`}
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
  const router = useRouter();
  const [activities, setActivities] = useState<ActivityInterface[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [department, setDepartment] = useState<string[]>([]);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const debouncedCurrentDate = useDebounce(currentDate, 300);

  // ── Month navigation ──
  const handlePrevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };
  const handleNextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  // ── Fetch ──
  const handleGetActivities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await activityAPI.getActivities({
        month: debouncedCurrentDate.getMonth() + 1,
        year: debouncedCurrentDate.getFullYear(),
      });
      setActivities(res.results);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  }, [debouncedCurrentDate]);

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
    handleGetDepartments();
  }, [handleGetActivities]);

  const dataFiltered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return activities.filter((a) => {
      const matchDept =
        departmentFilter === "all" || a.department === departmentFilter;

      let matchStatus: boolean;
      if (statusFilter === "overdue") {
        const end = new Date(a.end_date);
        end.setHours(0, 0, 0, 0);
        matchStatus = end < today && a.status !== "cancelled";
      } else {
        matchStatus = statusFilter === "all" || a.status === statusFilter;
      }

      return matchStatus && matchDept;
    });
  }, [activities, statusFilter, departmentFilter]);

  return (
    <>
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ── Header ── */}
        <header>
          <div className="flex items-center justify-between flex-wrap gap-3">
            {/* LEFT */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Danh sách Công tác
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Quản lý và theo dõi các công tác hoạt động
              </p>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-4 flex-wrap">
              <Notification />

              {/* Month navigator */}
              <div className="flex items-center gap-1">
                <button
                  className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={handlePrevMonth}
                  aria-label="Tháng trước"
                >
                  <ArrowLeftIcon className="text-gray-600" />
                </button>
                <span className="text-sm font-medium text-gray-700 min-w-[110px] text-center">
                  {formatMonth(currentDate)}
                </span>
                <button
                  className="p-1.5 rounded-md hover:bg-gray-100 cursor-pointer"
                  onClick={handleNextMonth}
                  aria-label="Tháng sau"
                >
                  <ArrowRightIcon className="text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="ml-1 px-3 py-1.5 bg-[#6B8E23] text-white text-sm rounded-md hover:opacity-90 font-bold cursor-pointer"
                >
                  Tháng này
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="pt-4 flex-1 flex flex-col overflow-hidden">
          {/* ── Filter bar ── */}
          <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 mb-4 flex items-center gap-3 flex-wrap">
            {/* Status dropdown */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="status-filter"
                className="text-sm font-semibold text-gray-700 whitespace-nowrap"
              >
                Trạng thái
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6B8E23] cursor-pointer"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Department dropdown */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="dept-filter"
                className="text-sm font-semibold text-gray-700 whitespace-nowrap"
              >
                Bộ phận
              </label>
              <select
                id="dept-filter"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6B8E23] cursor-pointer"
              >
                <option value="all">Tất cả</option>
                {department.map((dept) => (
                  <option key={dept} value={dept}>
                    {handleGetDepartment(dept)}
                  </option>
                ))}
              </select>
            </div>

            {/* Create button */}
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#6B8E23] cursor-pointer text-white rounded-lg shadow hover:opacity-90 transition ml-auto"
            >
              <AddIcon fontSize="small" />
              <span className="font-bold text-sm">Tạo công tác</span>
            </button>
          </div>

          {/* ── Table ── */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loading />
            </div>
          ) : dataFiltered.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Không có công tác nào phù hợp.
            </div>
          ) : (
            <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-white">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 w-10">
                      #
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 min-w-[200px]">
                      Tên công tác
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Loại
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Bộ phận
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 min-w-[160px]">
                      Thời gian
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 min-w-[130px]">
                      Tiến độ
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">
                      Nhiệm vụ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dataFiltered.map((activity, idx) => (
                    <tr
                      key={activity.id}
                      onClick={() => setSelectedId(activity.id)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors hover:bg-[#6B8E23]/5 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                      }`}
                    >
                      {/* # */}
                      <td className="px-4 py-3 text-gray-400 font-medium">
                        {idx + 1}
                      </td>

                      {/* Tên công tác */}
                      <td className="px-4 py-3 max-w-[260px]">
                        <TooltipProvider delayDuration={100}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-semibold text-gray-900 truncate block max-w-[240px]">
                                {activity.name}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{activity.name}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </td>

                      {/* Loại */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-semibold whitespace-nowrap">
                          {handleGetWorkType(activity.work_type)}
                        </span>
                      </td>

                      {/* Bộ phận */}
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full font-semibold whitespace-nowrap">
                          {handleGetDepartment(activity.department)}
                        </span>
                      </td>

                      {/* Thời gian */}
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs">
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
                              className={`mt-0.5 font-medium ${deadline.className}`}
                            >
                              {deadline.text}
                            </div>
                          );
                        })()}
                      </td>

                      {/* Tiến độ */}
                      <td className="px-4 py-3">
                        <ProgressCell tasks={activity.tasks} />
                      </td>

                      {/* Trạng thái */}
                      <td className="px-4 py-3">
                        <StatusBadge status={activity.status} />
                      </td>

                      {/* Nhiệm vụ */}
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap text-xs font-medium">
                        {activity.tasks.length} nhiệm vụ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
          className="w-[480px] sm:w-[600px] overflow-y-auto px-4 py-4 border-none"
        >
          {selectedId !== null && (
            <ActivityDetailSheet activityId={selectedId} />
          )}
        </SheetContent>
      </Sheet>

      <Sheet open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <SheetContent
          side="right"
          className="w-[480px] sm:w-[600px] overflow-y-auto px-4 py-4 border-none"
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
