"use client";

import { Trash2, Lightbulb, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "../ui/multi-select";
import { Switch } from "../ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserOption, usersAPI } from "@/services/api/user";
import { departmentAPI, DepartmentInterface } from "@/services/api/department";
import { useCallback, useEffect, useState } from "react";

export interface TemplateTaskData {
  id: number;
  title: string;
  team: string[];
  assignees: string[];
  notes: string;
  report_fields: Array<{ id: number; name: string }>;
  requires_dqcd: boolean;
  require_media_report: boolean;
}

interface Props {
  task: TemplateTaskData;
  taskIndex: number;
  errors?: Record<string, string>;
  onDeleteTask: () => void;
  onChangeField: (field: string, value: any) => void;
  onAddReportField: () => void;
  onRemoveReportField: (fieldIndex: number) => void;
  onChangeReportField: (fieldIndex: number, value: string) => void;
}

type DqcdValue = "unset" | "no" | "yes";

export default function TemplateTask({
  task,
  taskIndex,
  errors = {},
  onDeleteTask,
  onChangeField,
  onAddReportField,
  onRemoveReportField,
  onChangeReportField,
}: Props) {
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [dqcdValue, setDqcdValue] = useState<DqcdValue>(
    task.requires_dqcd ? "yes" : task.assignees.length > 0 || task.title ? "no" : "unset",
  );

  const isTypeSelected = dqcdValue !== "unset";

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await departmentAPI.getAllDepartment();
      setDepartments(data);
    } catch {}
  }, []);

  const fetchUsers = useCallback(async (teams: string[], requiresDqcd: boolean) => {
    if (teams.length === 0) return;
    try {
      const data = await usersAPI.getAllUser({
        departmentCode: teams,
        role: requiresDqcd ? ["TO_TRUONG"] : ["DQTT", "TO_TRUONG"],
      });
      setUsers(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    if (task.team.length > 0) {
      fetchUsers(task.team, task.requires_dqcd);
    } else {
      setUsers([]);
    }
  }, [task.team, task.requires_dqcd, fetchUsers]);

  const handleDqcdChange = (val: string) => {
    const next = val as DqcdValue;
    setDqcdValue(next);
    onChangeField("requires_dqcd", next === "yes");
    onChangeField("assignees", []);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">
          Nhiệm Vụ {taskIndex + 1}
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onDeleteTask}
          className="text-red-500 hover:bg-red-100 h-8"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Loại nhiệm vụ — DQCĐ */}
        <FormField
          label="Loại Nhiệm Vụ"
          required
          hint={
            !isTypeSelected ? (
              <div className="flex items-center gap-1 text-amber-600">
                <Lightbulb className="h-3 w-3" />
                Chọn loại nhiệm vụ trước để tiếp tục
              </div>
            ) : dqcdValue === "yes" ? (
              <div className="flex items-center gap-1 text-amber-600">
                <Lightbulb className="h-3 w-3" />
                Nếu chọn loại này, chỉ có thể giao nhiệm vụ cho tổ trưởng trở lên
              </div>
            ) : undefined
          }
        >
          <Select
            value={dqcdValue === "unset" ? "" : dqcdValue}
            onValueChange={handleDqcdChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="-- Chọn loại nhiệm vụ --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">Không cần điều động DQCĐ</SelectItem>
              <SelectItem value="yes">Cần điều động DQCĐ</SelectItem>
            </SelectContent>
          </Select>
        </FormField>

        {/* Tên nhiệm vụ */}
        <FormField
          label="Tên Nhiệm Vụ"
          required
          error={errors[`tasks.${taskIndex}.title`]}
        >
          <Input
            disabled={!isTypeSelected}
            value={task.title}
            onChange={(e) => onChangeField("title", e.target.value)}
            placeholder="VD: Chuẩn bị vũ khí"
          />
        </FormField>

        {/* Tổ phụ trách */}
        <FormField
          label="Tổ Phụ Trách"
          error={errors[`tasks.${taskIndex}.team`]}
          hint={
            isTypeSelected ? (
              <div className="flex items-center gap-1 text-gray-500">
                <Lightbulb className="h-3 w-3" />
                Chọn tổ để lọc người thực hiện
              </div>
            ) : undefined
          }
        >
          <MultiSelect
            disabled={!isTypeSelected}
            options={departments.map((d) => ({ value: d.code, label: d.name }))}
            value={task.team}
            onValueChange={(value) => onChangeField("team", value)}
            placeholder="Chọn tổ phụ trách..."
          />
        </FormField>

        {/* Người thực hiện */}
        <FormField
          label={dqcdValue === "yes" ? "Tổ Trưởng Phụ Trách" : "Người Thực Hiện Mặc Định"}
          error={errors[`tasks.${taskIndex}.assignees`]}
        >
          <MultiSelect
            disabled={!isTypeSelected || task.team.length === 0}
            options={users.map((u) => ({ value: String(u.id), label: u.name }))}
            value={task.assignees}
            onValueChange={(value) => onChangeField("assignees", value)}
            placeholder={
              dqcdValue === "yes"
                ? "Chọn tổ trưởng phụ trách..."
                : "Chọn người thực hiện..."
            }
          />
        </FormField>

        {/* Báo cáo bằng hình ảnh/file */}
        <div className="flex items-center space-x-2">
          <Switch
            id={`require_media_report_${taskIndex}`}
            disabled={!isTypeSelected}
            checked={task.require_media_report}
            onCheckedChange={(value) => onChangeField("require_media_report", value)}
          />
          <Label className="leading-5" htmlFor={`require_media_report_${taskIndex}`}>
            Báo cáo bằng hình ảnh/file
          </Label>
        </div>

        {/* Hạng mục báo cáo */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Hạng Mục Báo Cáo (tùy chọn)
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={!isTypeSelected}
              onClick={onAddReportField}
              className="text-slate-700 h-7"
            >
              <Plus className="h-4 w-4" />
              Thêm
            </Button>
          </div>

          {task.report_fields.length === 0 ? (
            <p className="text-xs text-gray-400 italic">
              Chưa có hạng mục báo cáo nào
            </p>
          ) : (
            <div className="space-y-2">
              {task.report_fields.map((field, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={field.name}
                    onChange={(e) => onChangeReportField(idx, e.target.value)}
                    placeholder="VD: Số lượng súng..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveReportField(idx)}
                    className="text-red-500 hover:bg-red-100 h-10 w-10"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}

function FormField({
  label,
  required = false,
  error,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-2">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <div className="mt-1 text-xs">{hint}</div>}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
