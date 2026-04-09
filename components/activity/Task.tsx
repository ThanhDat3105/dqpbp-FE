import { Trash2, Lightbulb, AlertTriangle, Plus } from "lucide-react";
import { departments } from "@/services/api/activity";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "../ui/multi-select";
import { Label } from "@/components/ui/label";
import { Switch } from "../ui/switch";

interface TaskData {
  id: number;
  title: string;
  team: string[];
  assignees: string[];
  due_date: string;
  notes: string;
  report_fields: Array<{ id: number; name: string; value: string }>;
  status: string;
  accepted_at: string | null;
  completed: boolean;
  created_at: Date | string;
  updated_at: Date | string;
  requires_dqcd: boolean;
}

interface Props {
  task: TaskData;
  taskIndex: number;
  errors?: Record<string, string>;
  activityStartDate?: string;
  activityEndDate?: string;
  onDeleteTask: () => void;
  onChangeField: (field: string, value: any) => void;
  onAddReportField: () => void;
  onRemoveReportField: (fieldIndex: number) => void;
  onChangeReportField: (
    fieldIndex: number,
    key: "name" | "value",
    value: string,
  ) => void;
}

export default function Task({
  task,
  taskIndex,
  errors = {},
  activityStartDate,
  activityEndDate,
  onDeleteTask,
  onChangeField,
  onAddReportField,
  onRemoveReportField,
  onChangeReportField,
}: Props) {
  const getUserOptions = (teams: string[]) => {
    if (teams.length === 0) {
      return departments
        .flatMap((d) => d.teams || [])
        .map((u) => ({ value: u.id, label: u.name }));
    }

    return departments
      .filter((d) => teams.includes(d.value))
      .flatMap((d) => d.teams || [])
      .map((u) => ({ value: u.id, label: u.name }));
  };

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-gray-50">
      {/* Header */}
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
        {/* Title */}
        <FormField
          label="Tên Nhiệm Vụ"
          required
          error={errors[`tasks.${taskIndex}.title`]}
        >
          <Input
            value={task.title}
            onChange={(e) => onChangeField("title", e.target.value)}
            placeholder="VD: Chuẩn bị vũ khí"
          />
        </FormField>

        {/* Team */}
        <FormField
          label="Tổ Phụ Trách"
          error={errors[`tasks.${taskIndex}.team`]}
          hint={
            <div className="flex items-center gap-1 text-gray-500">
              <Lightbulb className="h-3 w-3" />
              Chọn tổ để lọc người thực hiện
            </div>
          }
        >
          <MultiSelect
            options={departments.map((dept) => ({
              value: dept.value,
              label: dept.label,
            }))}
            value={task.team}
            onValueChange={(value) => {
              onChangeField("assignees", []);
              onChangeField("team", value);
            }}
            placeholder="Chọn tổ phụ trách..."
          />
        </FormField>

        {/* Assignees */}
        <FormField
          label="Người Thực Hiện"
          required
          error={errors[`tasks.${taskIndex}.assignees`]}
        >
          <MultiSelect
            disabled={task.team.length === 0}
            options={getUserOptions(task.team)}
            value={task.assignees}
            onValueChange={(value) => onChangeField("assignees", value)}
            placeholder="Chọn người thực hiện..."
          />

          <p className="text-xs text-gray-500 mt-1">
            💡 Bạn có thể chọn nhiều người
          </p>
        </FormField>

        {/* Due Date */}
        <FormField
          label="Thời Hạn Hoàn Thành"
          error={errors[`tasks.${taskIndex}.due_date`]}
          hint={
            <div className="flex items-center gap-1 text-yellow-600">
              <AlertTriangle className="h-3 w-3" />
              Khi quá hạn, hệ thống sẽ gửi email cảnh báo
            </div>
          }
        >
          <Input
            type="datetime-local"
            value={task.due_date}
            min={activityStartDate || undefined}
            max={activityEndDate || undefined}
            onChange={(e) => onChangeField("due_date", e.target.value)}
          />
        </FormField>

        {/* Due Date */}
        <div className="flex items-center space-x-2">
          <Switch
            id="requires_dqcd"
            checked={task.requires_dqcd}
            onCheckedChange={(value) => onChangeField("requires_dqcd", value)}
          />
          <Label htmlFor="requires_dqcd">
            Loại nhiệm vụ cần điều động DQCĐ
          </Label>
        </div>

        {/* Report Fields */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Hạng Mục Báo Cáo (tùy chọn)
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
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
              {task.report_fields.map((field, fieldIdx) => (
                <div key={fieldIdx} className="flex gap-2">
                  <Input
                    value={field.name}
                    onChange={(e) =>
                      onChangeReportField(fieldIdx, "name", e.target.value)
                    }
                    placeholder="VD: Số lượng súng..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemoveReportField(fieldIdx)}
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

/**
 * Reusable FormField Component
 */
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
