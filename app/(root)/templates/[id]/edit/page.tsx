"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Info, ListTodo, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  activityTemplateAPI,
  UpdateTemplatePayload,
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

export default function EditTemplatePage() {
  const { id } = useParams<{ id: string }>();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchTemplate = useCallback(async () => {
    try {
      const tpl = await activityTemplateAPI.getTemplateById(Number(id));
      setFormData({
        name: tpl.name,
        description: tpl.description ?? "",
        work_type: tpl.work_type ?? "",
        department: tpl.department ?? "",
        location: tpl.location ?? "",
        document_number: tpl.document_number ?? "",
        status: tpl.status,
        tasks: tpl.tasks.map((t, i) => ({
          id: t.id ?? i,
          title: t.title,
          team: t.team ?? [],
          assignees: (t.assignees ?? []).map(String),
          notes: t.notes ?? "",
          report_fields: (t.report_fields ?? []).map((f, fi) => ({
            id: fi,
            name: typeof f === "string" ? f : f.name,
          })),
          requires_dqcd: t.requires_dqcd ?? false,
          require_media_report: t.require_media_report ?? false,
        })),
      });
    } catch {
      toast.error("Không tìm thấy mẫu kế hoạch");
      router.push("/templates");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name])
      setErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
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
          require_media_report: false,
        },
      ],
    }));
  };

  const handleDeleteTask = (taskId: number) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
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

  const handleRemoveReportField = (taskId: number, idx: number) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? { ...t, report_fields: t.report_fields.filter((_, i) => i !== idx) }
          : t,
      ),
    }));
  };

  const handleChangeReportField = (
    taskId: number,
    idx: number,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t;
        const fields = [...t.report_fields];
        fields[idx] = { ...fields[idx], name: value };
        return { ...t, report_fields: fields };
      }),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Tên mẫu không được để trống";
    for (const [i, task] of formData.tasks.entries()) {
      if (!task.title.trim())
        newErrors[`tasks.${i}.title`] = "Tên nhiệm vụ không được để trống";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload: UpdateTemplatePayload = {
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
          require_media_report: t.require_media_report || false,
        })),
      };
      await activityTemplateAPI.updateTemplate(Number(id), payload);
      toast.success("Cập nhật mẫu kế hoạch thành công!");
      router.push(`/templates/${id}`);
    } catch {
      toast.error("Có lỗi xảy ra khi cập nhật mẫu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="space-y-4">
          <div className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-4">
      <div className="border-b border-gray-200 flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/templates/${id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chỉnh Sửa Mẫu</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Cập nhật thông tin và nhiệm vụ của mẫu kế hoạch
          </p>
        </div>
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

          <FormField label="Tên Mẫu" required error={errors.name}>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Mẫu huấn luyện vũ khí hàng tháng"
              className={errors.name ? "border-red-500" : ""}
            />
          </FormField>

          <FormField label="Mô Tả">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Mô tả ngắn về mẫu kế hoạch này..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          </FormField>

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

          <FormField label="Trạng Thái">
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Đang dùng</option>
              <option value="inactive">Tạm ẩn</option>
            </select>
          </FormField>
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
            onClick={() => router.push(`/templates/${id}`)}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
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
