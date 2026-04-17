"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { calendarDQTTAPI } from "@/services/api/calendar-dqtt";
import { usersAPI } from "@/services/api/user";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScheduleRow, OfficeColumn } from "./schedule-data";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: ScheduleRow;
  dayLabel: string;
  officeColumns: OfficeColumn[];
  onSave: (row: ScheduleRow) => void;
}

interface SelectOption {
  label: string;
  value: string;
}

// Mã tiểu đội DQCĐ: a1 – a24 (tĩnh, không cần API)
const PATROL_OPTIONS: SelectOption[] = Array.from({ length: 24 }, (_, i) => ({
  label: `A${i + 1}`,
  value: `a${i + 1}`,
}));

const UserSelect = ({
  value,
  onChange,
  options,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          disabled={disabled}
          className="w-full justify-between font-normal"
        >
          {disabled
            ? "Đang tải..."
            : value
              ? (options.find((o) => o.value === value)?.label ?? value)
              : "Chọn người trực..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder="Tìm tên..." />
          <CommandList>
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.value}
                  value={opt.label}
                  onSelect={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {opt.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default function ScheduleFormModal({
  isOpen,
  onClose,
  row,
  dayLabel,
  officeColumns,
  onSave,
}: ScheduleFormModalProps) {
  const [formData, setFormData] = useState<ScheduleRow>(row);
  const [isSaving, setIsSaving] = useState(false);

  // ─── User lists from API ────────────────────────────────────────────────
  const [dutyOptions, setDutyOptions] = useState<SelectOption[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen) setFormData(row);
  }, [row, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const dutyUsers = await usersAPI.getDutyUsers();
        setDutyOptions(
          dutyUsers.map((u) => ({ label: u.name, value: u.name })),
        );
      } catch {
        toast.error("Không thể tải danh sách người dùng");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isOpen]);

  // ─── Form handlers ──────────────────────────────────────────────────────
  const handleChange = (field: keyof ScheduleRow, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOfficeChange = (code: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      office_duties: { ...prev.office_duties, [code]: value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const result = await calendarDQTTAPI.updateDay(formData.date, formData);
      toast.success(`Đã cập nhật lịch ngày ${dayLabel} thành công.`);
      onSave(result.row);
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Có lỗi xảy ra khi lưu.";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cập nhật lịch trực — {dayLabel}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Trực chỉ huy</Label>
              <UserSelect
                value={formData.commander}
                onChange={(v) => handleChange("commander", v)}
                options={dutyOptions}
                disabled={loadingUsers}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Trực ban</Label>
              <UserSelect
                value={formData.duty_officer}
                onChange={(v) => handleChange("duty_officer", v)}
                options={dutyOptions}
                disabled={loadingUsers}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Trực công văn</Label>
              <UserSelect
                value={formData.document_officer}
                onChange={(v) => handleChange("document_officer", v)}
                options={dutyOptions}
                disabled={loadingUsers}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Trực nội vụ</Label>
              <UserSelect
                value={formData.internal_affairs}
                onChange={(v) => handleChange("internal_affairs", v)}
                options={dutyOptions}
                disabled={loadingUsers}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Trực cơm</Label>
              <UserSelect
                value={formData.meal_duty}
                onChange={(v) => handleChange("meal_duty", v)}
                options={dutyOptions}
                disabled={loadingUsers}
              />
            </div>
            <div className="space-y-1.5">
              <Label>DQTT phụ trách A</Label>
              <UserSelect
                value={formData.dqtt_leader}
                onChange={(v) => handleChange("dqtt_leader", v)}
                options={dutyOptions}
                disabled={loadingUsers}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>DQCD trực – Tuần tra</Label>
            <UserSelect
              value={
                Array.isArray(formData.dqcd_patrol) &&
                formData.dqcd_patrol.length > 0
                  ? formData.dqcd_patrol[0]
                  : ""
              }
              onChange={(v) => handleChange("dqcd_patrol", [v])}
              options={PATROL_OPTIONS}
              disabled={false}
            />
          </div>

          {officeColumns.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                Nhiệm vụ trực trụ sở
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {officeColumns.map((col) => (
                  <div key={col.code} className="space-y-1.5">
                    <Label>{col.label}</Label>
                    <UserSelect
                      value={formData.office_duties?.[col.code] || ""}
                      onChange={(v) => handleOfficeChange(col.code, v)}
                      options={dutyOptions}
                      disabled={loadingUsers}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSaving} className="gap-1.5">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Lưu thay đổi"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
