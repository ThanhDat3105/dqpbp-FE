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
import { PlusCircle, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

function buildExistingSlots(
  schedule: Record<number | string, DaySchedule>,
): Record<string, { start: string; end: string }> {
  const result: Record<string, { start: string; end: string }> = {};
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
  const [existingSlots, setExistingSlots] = useState<
    Record<string, { start: string; end: string }>
  >({});
  const [loadingExisting, setLoadingExisting] = useState(false);

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
    }
  };

  const handleUserChange = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedSchedules({});
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
                  <div className="flex items-center gap-3 mb-2 px-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-3 h-3 rounded bg-green-100 border border-green-300" />
                      Đã đăng ký
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

                            return (
                              <td
                                key={day.id}
                                className={`py-3 px-2 border-r align-top ${existing ? "bg-green-50" : ""}`}
                              >
                                <div className="flex flex-col items-center gap-2">
                                  {existing ? (
                                    <div className="flex flex-col items-center gap-0.5">
                                      <span className="text-[10px] font-semibold text-green-700 bg-green-100 rounded px-1 py-0.5 leading-tight">
                                        Đã đăng ký
                                      </span>
                                      <span className="text-[10px] text-green-600">
                                        {existing.start.slice(0, 5)}–{existing.end.slice(0, 5)}
                                      </span>
                                    </div>
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
  );
}
