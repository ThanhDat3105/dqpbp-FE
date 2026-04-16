"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // <-- Import Select của shadcn
import { useAuth } from "@/context/AuthContext";
import { scheduleAPI } from "@/services/api/schedule";
// import { useToast } from "@/components/ui/use-toast";

const DAYS = [
  { id: 1, label: "Thứ 2" },
  { id: 2, label: "Thứ 3" },
  { id: 3, label: "Thứ 4" },
  { id: 4, label: "Thứ 5" },
  { id: 5, label: "Thứ 6" },
  { id: 6, label: "Thứ 7" },
  { id: 7, label: "Chủ nhật" },
];

// Hàm helper tạo mảng giờ (cách nhau 30 phút) theo khoảng thời gian cho trước
const generateTimeOptions = (startHour: number, endHour: number) => {
  const options = [];
  for (let i = startHour; i <= endHour; i++) {
    const hourStr = i.toString().padStart(2, "0");
    options.push(`${hourStr}:00`);
    // Không thêm phút 30 cho mốc giờ kết thúc cuối cùng (ví dụ 14:00, 18:00)
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
    timeOptions: generateTimeOptions(0, 14), // 00:00 đến 14:00
  },
  {
    id: "CHIEU",
    label: "CHIỀU",
    defaultStart: "14:00",
    defaultEnd: "18:00",
    timeOptions: generateTimeOptions(14, 18), // 14:00 đến 18:00
  },
  {
    id: "DEM",
    label: "TỐI",
    defaultStart: "19:00",
    defaultEnd: "23:00",
    timeOptions: generateTimeOptions(18, 23), // 18:00 đến 23:30 (23h tương đương 00:00 hôm sau)
  },
];

export default function DialogRegisterSchedule() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedSchedules, setSelectedSchedules] = useState<
    Record<string, { start_time: string; end_time: string }>
  >({});

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
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);

    const schedulesArray = Object.keys(selectedSchedules).map((key) => {
      const [dayId, shift] = key.split("-");
      return {
        day_of_week: parseInt(dayId),
        shift: shift,
        start_time: selectedSchedules[key].start_time,
        end_time: selectedSchedules[key].end_time,
      };
    });

    const payload = {
      user_id: user?.id || 1,
      week_start: new Date().toISOString().split("T")[0],
      schedules: schedulesArray,
    };

    try {
      const res = await scheduleAPI.registerSchedule(payload);
      setOpen(false);
      setSelectedSchedules({});
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-[#556B2F] hover:bg-[#556b2fc1] text-white rounded-md text-sm font-medium transition-colors">
          <PlusCircle className="w-4 h-4 mr-2" /> Đăng ký lịch rảnh
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-6xl w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Đăng ký lịch công tác (DQCĐ)
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 flex flex-col gap-4">
          <div className="rounded-md overflow-hidden">
            <table className="w-full text-sm text-center">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="py-3 px-2 border-r font-semibold w-24">CA</th>
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

                      return (
                        <td
                          key={day.id}
                          className="py-3 px-2 border-r align-top"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Checkbox
                              checked={isSelected}
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

                            {isSelected && (
                              <div className="flex flex-col gap-2 mt-1">
                                {/* Component Select cho Giờ Bắt Đầu */}
                                <Select
                                  value={selectedSchedules[key].start_time}
                                  onValueChange={(value) =>
                                    handleTimeChange(
                                      day.id,
                                      shift.id,
                                      "start_time",
                                      value,
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-7 text-xs px-2 w-[75px] mx-auto focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Từ" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[200px]">
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

                                {/* Component Select cho Giờ Kết Thúc */}
                                <Select
                                  value={selectedSchedules[key].end_time}
                                  onValueChange={(value) =>
                                    handleTimeChange(
                                      day.id,
                                      shift.id,
                                      "end_time",
                                      value,
                                    )
                                  }
                                >
                                  <SelectTrigger className="h-7 text-xs px-2 w-[75px] mx-auto focus:ring-0 focus:ring-offset-0">
                                    <SelectValue placeholder="Đến" />
                                  </SelectTrigger>
                                  <SelectContent className="max-h-[200px]">
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
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            className="bg-[#556B2F] hover:bg-[#556b2fc1]"
            onClick={handleSubmit}
            disabled={isLoading || Object.keys(selectedSchedules).length === 0}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Đăng ký
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
