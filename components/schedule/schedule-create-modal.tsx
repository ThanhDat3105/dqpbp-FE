"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CalendarPlus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { calendarDQTTAPI } from "@/services/api/calendar-dqtt";

interface ScheduleCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

type TargetOption = "current" | "next" | "custom";

export default function ScheduleCreateModal({
  isOpen,
  onClose,
  onCreated,
}: ScheduleCreateModalProps) {
  const [selected, setSelected] = useState<TargetOption>("next");
  const [customDate, setCustomDate] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = () => {
    if (isSaving) return;
    setSelected("next");
    setCustomDate("");
    onClose();
  };

  const handleConfirm = async () => {
    if (selected === "custom" && !customDate) {
      toast.error("Vui lòng chọn ngày cụ thể.");
      return;
    }

    const target = selected === "custom" ? customDate : selected;
    setIsSaving(true);
    try {
      const result = await calendarDQTTAPI.createWeek(target);
      if (result.skipped > 0) {
        toast.success(
          `Đã tạo ${result.created} ngày mới. ${result.skipped} ngày đã tồn tại, bỏ qua.`
        );
      } else {
        toast.success("Đã tạo lịch tuần thành công.");
      }
      onCreated();
      handleClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Có lỗi xảy ra.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-blue-600" />
            Tạo lịch trực tuần mới
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-3">
          {(
            [
              { value: "current", label: "Tuần hiện tại" },
              { value: "next", label: "Tuần sau" },
              { value: "custom", label: "Chọn ngày cụ thể" },
            ] as { value: TargetOption; label: string }[]
          ).map((opt) => (
            <label
              key={opt.value}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selected === opt.value
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="target"
                value={opt.value}
                checked={selected === opt.value}
                onChange={() => setSelected(opt.value)}
                className="accent-blue-600"
              />
              <span className="text-sm font-medium text-gray-700">
                {opt.label}
              </span>
            </label>
          ))}

          {selected === "custom" && (
            <div className="pl-2 pt-1 space-y-1.5">
              <Label htmlFor="custom-date-input" className="text-sm">
                Chọn ngày trong tuần cần tạo
              </Label>
              <Input
                id="custom-date-input"
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSaving}
          >
            Hủy
          </Button>
          <Button
            id="create-week-confirm-btn"
            type="button"
            onClick={handleConfirm}
            disabled={isSaving}
            className="gap-1.5"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tạo...
              </>
            ) : (
              <>
                <CalendarPlus className="h-4 w-4" />
                Tạo lịch
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
