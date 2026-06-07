"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { activityAPI, TaskInterface } from "@/services/api/activity";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { handleGetDepartment } from "@/utils/activity";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useActivity } from "@/context/ActivityContext";
import { useAuth } from "@/context/AuthContext";
import { UserOption, usersAPI } from "@/services/api/user";

const STATUS_CONFIG = {
  pending: {
    bg: "bg-yellow-100",
    dot: "bg-yellow-600",
    text: "text-yellow-600",
    label: "Chờ nhận",
  },
  in_progress: {
    bg: "bg-blue-100",
    dot: "bg-blue-600",
    text: "text-blue-600",
    label: "Đang thực hiện",
  },
  completed: {
    bg: "bg-green-100",
    dot: "bg-green-600",
    text: "text-green-600",
    label: "Hoàn thành",
  },
  cancelled: {
    bg: "bg-red-100",
    dot: "bg-red-600",
    text: "text-red-600",
    label: "Đã hủy",
  },
} as const;

function StatusBadge({ status }: { status: string }) {
  const s =
    STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ??
    STATUS_CONFIG.pending;
  return (
    <span
      className={`flex items-center gap-1 px-2 py-1 font-bold rounded-full text-xs whitespace-nowrap ${s.bg} ${s.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function TaskCard({ task }: { task: TaskInterface }) {
  const { user } = useAuth();
  const { fetchActivityDetail, activity } = useActivity();

  const [reportFields, setReportFields] = useState(
    task.report_fields?.map((f) => ({ ...f, value: f.value ?? "" })) ?? [],
  );
  const [dqcdUsers, setDqcdUsers] = useState<UserOption[]>([]);
  const [selectedDqcd, setSelectedDqcd] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [dqcdDate, setDqcdDate] = useState("");
  const [dqcdStartTime, setDqcdStartTime] = useState("");
  const [dqcdEndTime, setDqcdEndTime] = useState("");
  const [loadingDqcd, setLoadingDqcd] = useState(false);
  const [dqcdSearched, setDqcdSearched] = useState(false);

  useEffect(() => {
    setReportFields(
      task.report_fields?.map((f) => ({ ...f, value: f.value ?? "" })) ?? [],
    );
  }, [task]);

  const fetchDqcdUsers = useCallback(
    async (startDatetime: string, endDatetime: string) => {
      setLoadingDqcd(true);
      setSelectedDqcd([]);
      setDqcdSearched(false);
      try {
        const data = await usersAPI.getAvailableUsers({
          start_date: startDatetime,
          end_date: endDatetime,
        });
        setDqcdUsers(data);
      } catch {
        toast.error("Không thể tải danh sách DQCĐ");
      } finally {
        setLoadingDqcd(false);
        setDqcdSearched(true);
      }
    },
    [],
  );

  const isPrivileged = user?.role === "CHI_HUY" || user?.role === "TO_TRUONG";
  const canOperate = user?.role !== "DQCD";
  const canUpdateProgress =
    task.assignees.some((a) => String(a.id) === String(user?.id)) ||
    isPrivileged;

  const allReportFilled = useMemo(() => {
    if (task.requires_dqcd && isPrivileged && selectedDqcd.length === 0)
      return false;
    if (
      reportFields.length &&
      !reportFields.every((f) => f.value.trim() !== "")
    )
      return false;
    return true;
  }, [reportFields, selectedDqcd, task.requires_dqcd, isPrivileged]);

  const canComplete = task.status === "in_progress" && allReportFilled;

  const handleAccept = async () => {
    setLoading(true);
    try {
      await activityAPI.updateTaskStatus(task.id, "in_progress");
      toast.success("Đã nhận nhiệm vụ");
      await fetchActivityDetail(activity.id);
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!canComplete) return;
    setLoading(true);
    try {
      if (reportFields.length > 0) {
        await activityAPI.updateReportFields(
          activity.id,
          task.id.toString(),
          reportFields,
        );
      }
      if (task.requires_dqcd && isPrivileged && selectedDqcd.length > 0) {
        await usersAPI.assignDQCD(task.id, selectedDqcd);
      }
      await activityAPI.updateTaskStatus(task.id, "completed");
      toast.success("Hoàn thành nhiệm vụ");
      await fetchActivityDetail(activity.id);
    } catch {
      toast.error("Cập nhật thất bại");
    } finally {
      setLoading(false);
    }
  };

  const isOverdue =
    format(new Date(), "yyyy-MM-dd") > format(task.due_date, "yyyy-MM-dd") &&
    task.status !== "completed";

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow p-4 h-fit space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-semibold text-gray-800 text-base">{task.title}</h2>
        <div className="flex items-center gap-1.5 shrink-0">
          {isOverdue && (
            <span className="flex items-center gap-1 px-2 py-1 font-bold rounded-full text-xs bg-red-100 text-red-600 whitespace-nowrap">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M2.725 21q-.275 0-.5-.137t-.35-.363t-.137-.488t.137-.512l9.25-16q.15-.25.388-.375T12 3t.488.125t.387.375l9.25 16q.15.25.138.513t-.138.487t-.35.363t-.5.137zm1.725-2h15.1L12 6zm8.263-1.287Q13 17.425 13 17t-.288-.712T12 16t-.712.288T11 17t.288.713T12 18t.713-.288m0-3Q13 14.425 13 14v-3q0-.425-.288-.712T12 10t-.712.288T11 11v3q0 .425.288.713T12 15t.713-.288M12 12.5"
                />
              </svg>
              Quá hạn
            </span>
          )}
          <StatusBadge status={task.status} />
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-col gap-2 text-sm text-gray-500">
        {task.team?.length > 0 && (
          <span className="flex items-center gap-1.5">
            <PeopleOutlinedIcon fontSize="small" />
            <span>
              {task.team.map((t) => handleGetDepartment(t)).join(", ")}
            </span>
          </span>
        )}
        {task.assignees?.length > 0 && (
          <span className="flex items-center gap-1.5">
            <PeopleOutlinedIcon fontSize="small" />
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default">
                    {task.assignees.length} người thực hiện
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="flex flex-col gap-0.5">
                    {task.assignees.map((a) => (
                      <span key={a.id}>{a.name}</span>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <CalendarTodayIcon fontSize="small" />
          {format(task.due_date, "dd/MM/yyyy HH:mm")}
        </span>
      </div>

      {/* ── PENDING: chỉ hiện nút nhận ── */}
      {task.status === "pending" && canOperate && canUpdateProgress && (
        <Button className="w-full" onClick={handleAccept} disabled={loading}>
          {loading ? "Đang xử lý..." : "Nhận nhiệm vụ"}
        </Button>
      )}

      {canUpdateProgress && task.status === "in_progress" && canOperate && (
        <div className="space-y-4 border-t pt-4">
          {/* Báo cáo */}
          {reportFields.length > 0 && (
            <div className="space-y-3">
              {reportFields.map((field, idx) => (
                <div key={idx}>
                  <Label className="text-sm text-gray-700 mb-1 block">
                    {field.name}
                  </Label>
                  <Input
                    placeholder="Nhập câu trả lời"
                    value={field.value}
                    onChange={(e) =>
                      setReportFields((prev) =>
                        prev.map((f, i) =>
                          i === idx ? { ...f, value: e.target.value } : f,
                        ),
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {/* Điều động DQCD */}
          {task.requires_dqcd && isPrivileged && (
            <div className="space-y-2">
              <Label className="text-sm text-gray-700 block">
                Điều động DQCĐ
              </Label>

              {/* Bước 1: chọn ngày */}
              <div className="flex flex-col gap-1">
                <span className="text-xs text-gray-500">Ngày điều động</span>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={dqcdDate}
                  min={task.start_date?.slice(0, 10)}
                  max={task.due_date?.slice(0, 10)}
                  onChange={(e) => {
                    setDqcdDate(e.target.value);
                    setDqcdStartTime("");
                    setDqcdEndTime("");
                    setDqcdUsers([]);
                    setDqcdSearched(false);
                    setSelectedDqcd([]);
                  }}
                />
              </div>

              {/* Bước 2: chọn giờ bắt đầu & kết thúc */}
              {dqcdDate && (
                <div className="flex gap-2">
                  {(
                    [
                      {
                        label: "Giờ bắt đầu",
                        value: dqcdStartTime,
                        onChange: (v: string) => {
                          setDqcdStartTime(v);
                          setDqcdEndTime("");
                          setDqcdUsers([]);
                          setDqcdSearched(false);
                          setSelectedDqcd([]);
                        },
                        filterHour: () => true,
                        filterMinute: () => true,
                      },
                      {
                        label: "Giờ kết thúc",
                        value: dqcdEndTime,
                        onChange: (v: string) => {
                          setDqcdEndTime(v);
                          setDqcdUsers([]);
                          setDqcdSearched(false);
                          setSelectedDqcd([]);
                        },
                        filterHour: (h: number) => {
                          if (!dqcdStartTime) return true;
                          const [sh] = dqcdStartTime.split(":").map(Number);
                          return h >= sh;
                        },
                        filterMinute: (m: number) => {
                          if (!dqcdStartTime) return true;
                          const [sh, sm] = dqcdStartTime.split(":").map(Number);
                          const [eh] = dqcdEndTime.split(":").map(Number);
                          if (Number.isNaN(eh)) return true;
                          const curH = Number(dqcdEndTime.split(":")[0]);
                          if (curH === sh) return m > sm;
                          return true;
                        },
                      },
                    ] as const
                  ).map(
                    ({ label, value, onChange, filterHour, filterMinute }) => {
                      const [selH = "", selM = ""] = value.split(":");
                      return (
                        <div key={label} className="flex flex-col gap-1 flex-1">
                          <span className="text-xs text-gray-500">{label}</span>
                          <div className="flex gap-1">
                            <Select
                              value={selH}
                              onValueChange={(h) =>
                                onChange(`${h}:${selM || "00"}`)
                              }
                            >
                              <SelectTrigger className="flex-1 text-sm h-9">
                                <SelectValue placeholder="Giờ" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 24 }, (_, i) => i)
                                  .filter(filterHour)
                                  .map((h) => {
                                    const hStr = String(h).padStart(2, "0");
                                    return (
                                      <SelectItem key={hStr} value={hStr}>
                                        {hStr}
                                      </SelectItem>
                                    );
                                  })}
                              </SelectContent>
                            </Select>
                            <span className="self-center text-gray-400 text-sm">
                              :
                            </span>
                            <Select
                              value={selM}
                              onValueChange={(m) =>
                                onChange(`${selH || "00"}:${m}`)
                              }
                              disabled={!selH}
                            >
                              <SelectTrigger className="flex-1 text-sm h-9">
                                <SelectValue placeholder="Phút" />
                              </SelectTrigger>
                              <SelectContent>
                                {["00", "15", "30", "45"]
                                  .filter((m) => filterMinute(Number(m)))
                                  .map((m) => (
                                    <SelectItem key={m} value={m}>
                                      {m}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              )}

              {/* Bước 3: tìm DQCD rảnh */}
              {dqcdDate &&
                dqcdStartTime &&
                dqcdEndTime &&
                dqcdEndTime > dqcdStartTime && (
                  <>
                    {dqcdUsers.length === 0 && !loadingDqcd && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() =>
                          fetchDqcdUsers(
                            `${dqcdDate}T${dqcdStartTime}:00`,
                            `${dqcdDate}T${dqcdEndTime}:00`,
                          )
                        }
                      >
                        Tìm DQCĐ rảnh
                      </Button>
                    )}

                    {loadingDqcd && (
                      <p className="text-xs text-gray-400 text-center py-1">
                        Đang tải...
                      </p>
                    )}

                    {!loadingDqcd && dqcdSearched && dqcdUsers.length === 0 && (
                      <p className="text-xs text-amber-600 text-center py-1">
                        Hệ thống không tìm thấy DQCĐ rảnh trong khung giờ này
                      </p>
                    )}

                    {!loadingDqcd && dqcdUsers.length > 0 && (
                      <MultiSelect
                        options={dqcdUsers.map((u) => ({
                          value: String(u.id),
                          label: u.name,
                        }))}
                        value={selectedDqcd}
                        onValueChange={setSelectedDqcd}
                        placeholder="Chọn DQCĐ"
                      />
                    )}
                  </>
                )}
            </div>
          )}

          <Button
            className="w-full"
            onClick={handleComplete}
            disabled={loading || !canComplete}
          >
            {loading ? "Đang xử lý..." : "Hoàn thành nhiệm vụ"}
          </Button>

          {!allReportFilled && reportFields.length > 0 && (
            <p className="text-xs text-amber-600">
              Điền đầy đủ báo cáo để hoàn thành nhiệm vụ
            </p>
          )}
        </div>
      )}

      {/* ── COMPLETED: hiện báo cáo đã điền ── */}
      {task.status === "completed" && task.report_fields?.length > 0 && (
        <div className="border-t pt-4 space-y-2">
          {task.report_fields.map((field) => (
            <div key={field.name} className="flex gap-2 text-sm">
              <span className="text-gray-500">{field.name}:</span>
              <span className="font-semibold text-gray-800">{field.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
