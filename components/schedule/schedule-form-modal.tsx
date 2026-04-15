"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { ScheduleRow, OfficeColumn } from "./schedule-data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScheduleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: ScheduleRow;
  dayLabel: string;
  officeColumns: OfficeColumn[];
  onSave: (row: ScheduleRow) => void;
}

// Temporary mock data — replace with real API
const MOCK_USERS = [
  "Nguyễn Văn A",
  "Trần Thị B",
  "Lê Văn C",
  "Phạm Văn D",
  "Hoàng Thị E",
  "Đặng Văn F",
  "Vũ Thị G",
  "Võ Văn H",
];
const USER_OPTIONS = MOCK_USERS.map((name) => ({ label: name, value: name }));

const UserSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger>
      <SelectValue placeholder="Chọn người trực..." />
    </SelectTrigger>
    <SelectContent>
      {USER_OPTIONS.map((opt) => (
        <SelectItem key={opt.value} value={opt.value}>
          {opt.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default function ScheduleFormModal({
  isOpen,
  onClose,
  row,
  dayLabel,
  officeColumns,
  onSave,
}: ScheduleFormModalProps) {
  const [formData, setFormData] = useState<ScheduleRow>(row);

  useEffect(() => {
    if (isOpen) setFormData(row);
  }, [row, isOpen]);

  const handleChange = (field: keyof ScheduleRow, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOfficeChange = (code: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      office_duties: { ...prev.office_duties, [code]: value },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
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
              />
            </div>
            <div className="space-y-1.5">
              <Label>Trực ban</Label>
              <UserSelect
                value={formData.duty_officer}
                onChange={(v) => handleChange("duty_officer", v)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Trực công văn</Label>
              <UserSelect
                value={formData.document_officer}
                onChange={(v) => handleChange("document_officer", v)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Trực nội vụ</Label>
              <UserSelect
                value={formData.internal_affairs}
                onChange={(v) => handleChange("internal_affairs", v)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Trực cơm</Label>
              <UserSelect
                value={formData.meal_duty}
                onChange={(v) => handleChange("meal_duty", v)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>DQTT phụ trách A</Label>
              <UserSelect
                value={formData.dqtt_leader}
                onChange={(v) => handleChange("dqtt_leader", v)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>DQCD trực – Tuần tra</Label>
            <MultiSelect
              options={USER_OPTIONS}
              value={
                Array.isArray(formData.dqcd_patrol) ? formData.dqcd_patrol : []
              }
              onValueChange={(v) => handleChange("dqcd_patrol", v)}
              placeholder="Chọn người đi tuần tra..."
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
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button type="submit">Lưu thay đổi</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
