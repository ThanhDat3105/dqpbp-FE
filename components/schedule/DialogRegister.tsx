"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Pencil, Trash2, X, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DaySchedule, MemberSchedule, scheduleAPI } from "@/services/api/schedule";
import { toast } from "sonner";
import { getNextWeekMonday } from "@/utils/formatDate";

const DAYS = [
  { id: 1, label: "Thứ 2" },
  { id: 2, label: "Thứ 3" },
  { id: 3, label: "Thứ 4" },
  { id: 4, label: "Thứ 5" },
  { id: 5, label: "Thứ 6" },
  { id: 6, label: "Thứ 7" },
  { id: 7, label: "Chủ nhật" },
];

const generateTimeOptions = (startHour: number, endHour: number) => {
  const options = [];
  for (let i = startHour; i <= endHour; i++) {
    const hourStr = i.toString().padStart(2, "0");
    options.push(`${hourStr}:00`);
    if (i < endHour) {
      options.push(`${hourStr}:30`);
    }
  }
  return options;
};

const SHIFTS = [
  {
    id: "SANG",
    label: "SÁNG",
    defaultStart: "07:00",
    defaultEnd: "14:00",
    timeOptions: generateTimeOptions(0, 14),
  },
  {
    id: "CHIEU",
    label: "CHIỀU",
    defaultStart: "14:00",
    defaultEnd: "18:00",
    timeOptions: generateTimeOptions(14, 18),
  },
  {
    id: "DEM",
    label: "TỐI",
    defaultStart: "19:00",
    defaultEnd: "23:00",
    timeOptions: generateTimeOptions(18, 23),
  },
];

type ExistingSlot = { start: string; end: string };

function buildExistingSlots(
  schedule: Record<number | string, DaySchedule>,
): Record<string, ExistingSlot> {
  const result: Record<string, ExistingSlot> = {};
  for (let dow = 1; dow <= 7; dow++) {
    const daySchedule = schedule[dow];
    if (!daySchedule) continue;
    (["SANG", "CHIEU", "DEM"] as const).forEach((shift) => {
      const slot = daySchedule[shift];
      if (slot) result[`${dow}-${shift}`] = { start: slot.start, end: slot.end };
    });
  }
  return result;
}

interface Props {
  members: MemberSchedule[];
  isFetchingUsers: boolean;
  onSuccess?: () => void;
}

export default function DialogRegisterSchedule({
  members,
  isFetchingUsers,
  onSuccess,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedSchedules, setSelectedSchedules] = useState<
    Record<string, { start_time: string; end_time: string }>
  >({});
  const [existingSlots, setExistingSlots] = useState<Record<string, ExistingSlot>>({});
  const [loadingExisting, setLoadingExisting] = useState(false);

  // Edit mode: key → editing times
  const [editingSlots, setEditingSlots] = useState<
    Record<string, { start: string; end: string }>
  >({});

  // Delete confirm dialog
  const [deleteTarget, setDeleteTarget] = useState<{ key: string; label: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchExistingForUser = async (userId: string) => {
    const nextMonday = getNextWeekMonday();
    setLoadingExisting(true);
    setExistingSlots({});
    try {
      const res = await scheduleAPI.getWeeklySchedule(nextMonday, userId, "all");
      const member = res.members.find((m) => String(m.user_id) === userId);
      setExistingSlots(member ? buildExistingSlots(member.schedule) : {});
    } catch {
      setExistingSlots({});
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    if (!value) {
      setSelectedUserId("");
      setSelectedSchedules({});
      setExistingSlots({});
      setEditingSlots({});
      setDeleteTarget(null);
    }
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedSchedules({});
    setEditingSlots({});
    fetchExistingForUser(userId);
  };

  const handleToggle = (
    dayId: number,
    shiftId: string,
    defaultStart: string,
    defaultEnd: string,
    checked: boolean,
  ) => {
    const key = `${dayId}-${shiftId}`;
    setSelectedSchedules((prev) => {
      const newData = { ...prev };
      if (checked) {
        newData[key] = { start_time: defaultStart, end_time: defaultEnd };
      } else {
        delete newData[key];
      }
      return newData;
    });
  };

  const handleTimeChange = (
    dayId: number,
    shiftId: string,
    field: "start_time" | "end_time",
    value: string,
  ) => {
    const key = `${dayId}-${shiftId}`;
    setSelectedSchedules((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  // --- Edit existing slot ---
  const startEditSlot = (key: string, slot: ExistingSlot) => {
    setEditingSlots((prev) => ({
      ...prev,
      [key]: { start: slot.start.slice(0, 5), end: slot.end.slice(0, 5) },
    }));
  };

  const cancelEditSlot = (key: string) => {
    setEditingSlots((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleEditTimeChange = (
    key: string,
    field: "start" | "end",
    value: string,
  ) => {
    setEditingSlots((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const confirmEditSlot = async (key: string) => {
    const [dayStr, shift] = key.split("-");
    const editing = editingSlots[key];
    const shiftDef = SHIFTS.find((s) => s.id === shift);
    if (!editing || !shiftDef) return;

    setIsLoading(true);
    try {
      await scheduleAPI.registerSchedule({
        user_id: parseInt(selectedUserId),
        week_start: getNextWeekMonday(),
        schedules: [
          {
            day_of_week: parseInt(dayStr),
            shift,
            start_time: editing.start,
            end_time: editing.end,
          },
        ],
      });
      toast.success("Cập nhật lịch thành công");
      setExistingSlots((prev) => ({
        ...prev,
        [key]: { start: editing.start, end: editing.end },
      }));
      cancelEditSlot(key);
      onSuccess?.();
    } catch {
      toast.error("Cập nhật lịch thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Delete existing slot ---
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const [dayStr, shift] = deleteTarget.key.split("-");
    setIsDeleting(true);
    try {
      await scheduleAPI.deleteRegisteredSchedule({
        user_id: parseInt(selectedUserId),
        week_start: getNextWeekMonday(),
        day_of_week: parseInt(dayStr),
        shift: shift as "SANG" | "CHIEU" | "DEM",
      });
      toast.success("Đã xóa lịch thành công");
      setExistingSlots((prev) => {
        const next = { ...prev };
        delete next[deleteTarget.key];
        return next;
      });
      onSuccess?.();
    } catch {
      toast.error("Xóa lịch thất bại");
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  // --- Submit new schedules ---
  const handleSubmit = async () => {
    if (!selectedUserId) {
      toast.error("Vui lòng chọn thành viên DQCĐ");
      return;
    }

    setIsLoading(true);

    const schedulesArray = Object.keys(selectedSchedules).map((key) => {
      const [dayId, shift] = key.split("-");
      return {
        day_of_week: parseInt(dayId),
        shift,
        start_time: selectedSchedules[key].start_time,
        end_time: selectedSchedules[key].end_time,
      };
    });

    const payload = {
      user_id: parseInt(selectedUserId),
      week_start: getNextWeekMonday(),
      schedules: schedulesArray,
    };

    try {
      const res = await scheduleAPI.registerSchedule(payload);
      toast.success(res.message);
      handleOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast.error("Đã có lỗi xảy ra");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUserName = members.find(
    (u) => String(u.user_id) === selectedUserId,
  )?.name;

  const canSubmit =
    !isLoading &&
    !!selectedUserId &&
    !loadingExisting &&
    Object.keys(selectedSchedules).length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <button className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-[#556B2F] hover:bg-[#556b2fc1] text-white rounded-md text-sm font-medium transition-colors">
            <PlusCircle className="w-4 h-4 mr-2" /> Đăng ký lịch rảnh
          </button>
        </DialogTrigger>

        <DialogContent className="w-[95vw] max-w-6xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-xl font-semibold">
              Đăng ký lịch công tác (DQCĐ)
            </DialogTitle>
          </DialogHeader>

          <div className="py-3 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
            {/* Chọn thành viên DQCĐ */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Thành viên DQCĐ:
              </span>
              <Select
                value={selectedUserId}
                onValueChange={handleUserChange}
                disabled={isFetchingUsers}
              >
                <SelectTrigger className="w-full sm:w-64 focus:ring-0 focus:ring-offset-0">
                  {isFetchingUsers ? (
                    <span className="flex items-center gap-2 text-sm text-gray-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Đang tải...
                    </span>
                  ) : (
                    <SelectValue placeholder="-- Chọn thành viên --" />
                  )}
                </SelectTrigger>
                <SelectContent>
                  {members.map((u) => (
                    <SelectItem key={u.user_id} value={String(u.user_id)}>
                      {u.name && <span className="ml-1 text-xs">{u.name}</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bảng chọn lịch */}
            {selectedUserName && (
              <div className="rounded-md overflow-x-auto">
                {loadingExisting ? (
                  <div className="flex items-center justify-center py-12 text-sm text-gray-400 gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang tải lịch tuần sau...
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-2 px-1 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="inline-block w-3 h-3 rounded bg-green-100 border border-green-300" />
                        Đã đăng ký
                      </span>
                      <span className="flex items-center gap-1">
                        <Pencil className="w-3 h-3 text-blue-400" />
                        Chỉnh sửa
                      </span>
                      <span className="flex items-center gap-1">
                        <Trash2 className="w-3 h-3 text-red-400" />
                        Xóa
                      </span>
                    </div>
                    <table className="min-w-160 w-full text-sm text-center">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="py-3 px-2 border-r font-semibold w-24">
                            CA
                          </th>
                          {DAYS.map((day) => (
                            <th
                              key={day.id}
                              className="py-3 px-2 border-r font-semibold"
                            >
                              {day.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {SHIFTS.map((shift) => (
                          <tr
                            key={shift.id}
                            className="border-b last:border-0 hover:bg-slate-50/50"
                          >
                            <td
                              className={`py-4 px-2 border-r font-bold ${
                                shift.id === "SANG"
                                  ? "text-blue-600"
                                  : shift.id === "CHIEU"
                                    ? "text-orange-500"
                                    : "text-purple-600"
                              }`}
                            >
                              {shift.label}
                            </td>

                            {DAYS.map((day) => {
                              const key = `${day.id}-${shift.id}`;
                              const isSelected = !!selectedSchedules[key];
                              const existing = existingSlots[key];
                              const isEditing = !!editingSlots[key];

                              return (
                                <td
                                  key={day.id}
                                  className={`py-3 px-2 border-r align-top ${existing ? "bg-green-50" : ""}`}
                                >
                                  <div className="flex flex-col items-center gap-2">
                                    {existing ? (
                                      isEditing ? (
                                        /* Edit mode */
                                        <div className="flex flex-col items-center gap-1 w-full">
                                          <Select
                                            value={editingSlots[key].start}
                                            onValueChange={(v) =>
                                              handleEditTimeChange(key, "start", v)
                                            }
                                          >
                                            <SelectTrigger className="h-7 text-xs px-2 w-18.75 mx-auto focus:ring-0 focus:ring-offset-0">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-50">
                                              {shift.timeOptions.map((t) => (
                                                <SelectItem key={`es-${t}`} value={t} className="text-xs">
                                                  {t}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <Select
                                            value={editingSlots[key].end}
                                            onValueChange={(v) =>
                                              handleEditTimeChange(key, "end", v)
                                            }
                                          >
                                            <SelectTrigger className="h-7 text-xs px-2 w-18.75 mx-auto focus:ring-0 focus:ring-offset-0">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-50">
                                              {shift.timeOptions.map((t) => (
                                                <SelectItem key={`ee-${t}`} value={t} className="text-xs">
                                                  {t}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                          <div className="flex gap-1 mt-0.5">
                                            <button
                                              onClick={() => confirmEditSlot(key)}
                                              disabled={isLoading}
                                              className="p-1 rounded bg-green-100 hover:bg-green-200 text-green-700 disabled:opacity-50"
                                              title="Lưu"
                                            >
                                              <Check className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => cancelEditSlot(key)}
                                              className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
                                              title="Hủy"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        /* Registered slot display */
                                        <div className="flex flex-col items-center gap-0.5">
                                          <span className="text-[10px] font-semibold text-green-700 bg-green-100 rounded px-1 py-0.5 leading-tight">
                                            Đã đăng ký
                                          </span>
                                          <span className="text-[10px] text-green-600">
                                            {existing.start.slice(0, 5)}–{existing.end.slice(0, 5)}
                                          </span>
                                          <div className="flex gap-1 mt-0.5">
                                            <button
                                              onClick={() => startEditSlot(key, existing)}
                                              className="p-1 rounded hover:bg-blue-100 text-blue-500"
                                              title="Chỉnh sửa"
                                            >
                                              <Pencil className="w-3 h-3" />
                                            </button>
                                            <button
                                              onClick={() => {
                                                console.log("Delete target:", { key, existing });
                                                const dayLabel = DAYS.find((d) => d.id === day.id)?.label ?? "";
                                                setDeleteTarget({
                                                  key,
                                                  label: `${dayLabel} – ${shift.label}`,
                                                });
                                              }}
                                              className="p-1 rounded hover:bg-red-100 text-red-500"
                                              title="Xóa"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </div>
                                      )
                                    ) : (
                                      <Checkbox
                                        checked={isSelected}
                                        disabled={!selectedUserId}
                                        onCheckedChange={(checked) =>
                                          handleToggle(
                                            day.id,
                                            shift.id,
                                            shift.defaultStart,
                                            shift.defaultEnd,
                                            checked as boolean,
                                          )
                                        }
                                      />
                                    )}

                                    {isSelected && !existing && (
                                      <div className="flex flex-col gap-2 mt-1">
                                        <Select
                                          value={selectedSchedules[key].start_time}
                                          onValueChange={(value) =>
                                            handleTimeChange(day.id, shift.id, "start_time", value)
                                          }
                                        >
                                          <SelectTrigger className="h-7 text-xs px-2 w-18.75 mx-auto focus:ring-0 focus:ring-offset-0">
                                            <SelectValue placeholder="Từ" />
                                          </SelectTrigger>
                                          <SelectContent className="max-h-50">
                                            {shift.timeOptions.map((time) => (
                                              <SelectItem
                                                key={`start-${time}`}
                                                value={time}
                                                className="text-xs"
                                              >
                                                {time}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>

                                        <Select
                                          value={selectedSchedules[key].end_time}
                                          onValueChange={(value) =>
                                            handleTimeChange(day.id, shift.id, "end_time", value)
                                          }
                                        >
                                          <SelectTrigger className="h-7 text-xs px-2 w-18.75 mx-auto focus:ring-0 focus:ring-offset-0">
                                            <SelectValue placeholder="Đến" />
                                          </SelectTrigger>
                                          <SelectContent className="max-h-50">
                                            {shift.timeOptions.map((time) => (
                                              <SelectItem
                                                key={`end-${time}`}
                                                value={time}
                                                className="text-xs"
                                              >
                                                {time}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}

            {!selectedUserId && (
              <p className="text-xs text-gray-400 text-center">
                Chọn thành viên DQCĐ để bắt đầu đăng ký lịch
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Hủy
            </Button>
            <Button
              className="bg-[#556B2F] hover:bg-[#556b2fc1]"
              onClick={handleSubmit}
              disabled={!canSubmit}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đăng ký
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa lịch</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa lịch <strong>{deleteTarget?.label}</strong> của{" "}
              <strong>{selectedUserName}</strong> tuần tới không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
