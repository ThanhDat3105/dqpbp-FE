"use client";

import { useState } from "react";
import { Plus, Info, ListTodo, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  activityTemplateAPI,
  CreateTemplatePayload,
} from "@/services/api/activity-template";
import TemplateTask, {
  TemplateTaskData,
} from "@/components/activity/TemplateTask";
import { departments } from "@/services/api/activity";

interface FormData {
  name: string;
  description: string;
  work_type: string;
  department: string;
  location: string;
  document_number: string;
  status: "active" | "inactive";
  tasks: TemplateTaskData[];
}

export default function CreateTemplatePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    work_type: "",
    department: "",
    location: "",
    document_number: "",
    status: "active",
    tasks: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleAddTask = () => {
    setFormData((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          id: Math.random(),
          title: "",
          team: [],
          assignees: [],
          notes: "",
          report_fields: [],
          requires_dqcd: false,
          start_offset_days: 0,
          due_offset_days: 0,
        },
      ],
    }));
  };

  const handleDeleteTask = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }));
  };

  const handleChangeTask = (taskId: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId ? { ...t, [field]: value } : t,
      ),
    }));
  };

  const handleAddReportField = (taskId: number) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              report_fields: [
                ...t.report_fields,
                { id: Math.random(), name: "" },
              ],
            }
          : t,
      ),
    }));
  };

  const handleRemoveReportField = (taskId: number, fieldIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              report_fields: t.report_fields.filter((_, i) => i !== fieldIndex),
            }
          : t,
      ),
    }));
  };

  const handleChangeReportField = (
    taskId: number,
    fieldIndex: number,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const fields = [...t.report_fields];
        fields[fieldIndex] = { ...fields[fieldIndex], name: value };
        return { ...t, report_fields: fields };
      }),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên công tác không được để trống";
    }

    for (const [i, task] of formData.tasks.entries()) {
      if (!task.title.trim()) {
        newErrors[`tasks.${i}.title`] = "Tên nhiệm vụ không được để trống";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload: CreateTemplatePayload = {
        name: formData.name,
        description: formData.description || undefined,
        work_type: formData.work_type || undefined,
        department: formData.department || undefined,
        location: formData.location || undefined,
        document_number: formData.document_number || undefined,
        status: formData.status,
        tasks: formData.tasks.map((t, index) => ({
          title: t.title,
          team: t.team,
          assignees: t.assignees,
          notes: t.notes || null,
          report_fields: t.report_fields.map(({ name }) => ({ name })),
          requires_dqcd: t.requires_dqcd,
          display_order: index,
        })),
      };

      await activityTemplateAPI.createTemplate(payload);
      toast.success("Tạo mẫu kế hoạch thành công!");
      router.push("/templates");
    } catch {
      toast.error("Có lỗi xảy ra khi tạo mẫu kế hoạch!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tạo Mẫu Kế Hoạch</h1>
        <p className="text-sm text-gray-500 mt-1">
          Định nghĩa cấu trúc nhiệm vụ để tái sử dụng khi tạo kế hoạch mới
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800 text-lg">
              Thông Tin Mẫu
            </h2>
          </div>

          <FormField label="Tên công tác" required error={errors.name}>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Mẫu huấn luyện vũ khí hàng tháng"
              className={errors.name ? "border-red-500" : ""}
            />
          </FormField>

          {/* <FormField label="Mô Tả">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Mô tả ngắn về mẫu kế hoạch này..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </FormField> */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Loại Hoạt Động">
              <select
                name="work_type"
                value={formData.work_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn loại công việc --</option>
                <option value="suddenly">Công việc đột xuất</option>
                <option value="annual">Công việc theo năm</option>
              </select>
            </FormField>

            <FormField label="Tổ Công Tác">
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn tổ công tác --</option>
                {departments.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Địa Điểm">
              <Input
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="VD: Sân tập P10"
              />
            </FormField>

            <FormField label="Số Công Văn">
              <Input
                name="document_number"
                value={formData.document_number}
                onChange={handleChange}
                placeholder="VD: 123/CV..."
              />
            </FormField>
          </div>

          {/* <FormField label="Trạng Thái">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Đang dùng</option>
              <option value="inactive">Tạm ẩn</option>
            </select>
          </FormField> */}
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-gray-600" />
              <h2 className="font-semibold text-gray-800 text-lg">
                Nhiệm Vụ Mẫu
              </h2>
            </div>
            <Button type="button" size="sm" onClick={handleAddTask}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm
            </Button>
          </div>

          {formData.tasks.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500">
              <ListTodo className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p>Chưa có nhiệm vụ nào</p>
              <p className="text-xs mt-1 text-gray-400">
                Thêm nhiệm vụ để tạo cấu trúc cho mẫu kế hoạch
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.tasks.map((task, index) => (
                <div key={task.id} className="rounded-xl bg-gray-50">
                  <TemplateTask
                    task={task}
                    taskIndex={index}
                    errors={errors}
                    onDeleteTask={() => handleDeleteTask(task.id)}
                    onChangeField={(field, value) =>
                      handleChangeTask(task.id, field, value)
                    }
                    onAddReportField={() => handleAddReportField(task.id)}
                    onRemoveReportField={(i) =>
                      handleRemoveReportField(task.id, i)
                    }
                    onChangeReportField={(i, value) =>
                      handleChangeReportField(task.id, i, value)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/templates")}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Đang lưu..." : "Tạo Mẫu"}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}

function FormField({
  label,
  required = false,
  error,
  children,
}: FormFieldProps) {
  return (
    <div>
      <Label className="text-sm font-medium text-gray-700 block mb-2">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
