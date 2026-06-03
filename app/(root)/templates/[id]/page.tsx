"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  Pencil,
  Trash2,
  ListTodo,
  CalendarDays,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  activityTemplateAPI,
  ActivityTemplateInterface,
  CreateActivityFromTemplatePayload,
} from "@/services/api/activity-template";
import { departments } from "@/services/api/activity";

const WORK_TYPE_LABEL: Record<string, string> = {
  suddenly: "Đột xuất",
  annual: "Theo năm",
};

function getDeptLabel(value: string | null) {
  if (!value) return null;
  return departments.find((d) => d.value === value)?.label ?? value;
}

function offsetLabel(days: number) {
  if (days === 0) return "Ngay khi bắt đầu";
  return `Sau ${days} ngày`;
}

export default function TemplateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [template, setTemplate] = useState<ActivityTemplateInterface | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [showUseForm, setShowUseForm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [useForm, setUseForm] = useState({
    name: "",
    start_date: "",
    end_date: "",
  });
  const [useErrors, setUseErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchTemplate = useCallback(async () => {
    setLoading(true);
    try {
      const data = await activityTemplateAPI.getTemplateById(Number(id));
      setTemplate(data);
      setUseForm((prev) => ({ ...prev, name: data.name }));
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

  const handleDelete = async () => {
    if (!confirm("Bạn có chắc muốn xóa mẫu này?")) return;
    setDeleting(true);
    try {
      await activityTemplateAPI.deleteTemplate(Number(id));
      toast.success("Đã xóa mẫu kế hoạch");
      router.push("/templates");
    } catch {
      toast.error("Xóa thất bại");
      setDeleting(false);
    }
  };

  const validateUseForm = () => {
    const errs: Record<string, string> = {};
    if (!useForm.name.trim()) errs.name = "Tên kế hoạch không được để trống";
    if (!useForm.start_date) errs.start_date = "Chọn ngày bắt đầu";
    if (!useForm.end_date) errs.end_date = "Chọn ngày kết thúc";
    if (
      useForm.start_date &&
      useForm.end_date &&
      useForm.start_date > useForm.end_date
    ) {
      errs.end_date = "Ngày kết thúc phải sau ngày bắt đầu";
    }
    setUseErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUseTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUseForm()) return;
    setSubmitting(true);
    try {
      const payload: CreateActivityFromTemplatePayload = {
        name: useForm.name,
        start_date: useForm.start_date,
        end_date: useForm.end_date,
      };
      await activityTemplateAPI.createActivityFromTemplate(Number(id), payload);
      toast.success("Tạo kế hoạch từ mẫu thành công!");
      router.push("/activities");
    } catch {
      toast.error("Có lỗi xảy ra khi tạo kế hoạch");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse" />
          <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!template) return null;

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Back + actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/templates")}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Quay lại
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/templates/${id}/edit`)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Chỉnh sửa
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 hover:text-red-600 hover:border-red-300"
              disabled={deleting}
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Xóa
            </Button>
            <Button size="sm" onClick={() => setShowUseForm((v) => !v)}>
              <Copy className="h-4 w-4 mr-1" />
              Dùng mẫu này
            </Button>
          </div>
        </div>

        {/* Use-template form */}
        {showUseForm && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <h2 className="font-semibold text-blue-900 mb-4">
              Tạo kế hoạch từ mẫu &ldquo;{template.name}&rdquo;
            </h2>
            <form onSubmit={handleUseTemplate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3">
                  <Label className="text-sm font-medium text-gray-700 block mb-1">
                    Tên kế hoạch <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={useForm.name}
                    onChange={(e) =>
                      setUseForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="VD: Huấn luyện tháng 6/2026"
                    className={useErrors.name ? "border-red-500" : ""}
                  />
                  {useErrors.name && (
                    <p className="mt-1 text-xs text-red-500">
                      {useErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 block mb-1">
                    Ngày bắt đầu <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={useForm.start_date}
                    onChange={(e) =>
                      setUseForm((p) => ({ ...p, start_date: e.target.value }))
                    }
                    className={useErrors.start_date ? "border-red-500" : ""}
                  />
                  {useErrors.start_date && (
                    <p className="mt-1 text-xs text-red-500">
                      {useErrors.start_date}
                    </p>
                  )}
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700 block mb-1">
                    Ngày kết thúc <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="date"
                    value={useForm.end_date}
                    onChange={(e) =>
                      setUseForm((p) => ({ ...p, end_date: e.target.value }))
                    }
                    className={useErrors.end_date ? "border-red-500" : ""}
                  />
                  {useErrors.end_date && (
                    <p className="mt-1 text-xs text-red-500">
                      {useErrors.end_date}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowUseForm(false)}
                >
                  Hủy
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? "Đang tạo..." : "Tạo kế hoạch"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Template info */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {template.name}
              </h1>
              {template.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {template.description}
                </p>
              )}
            </div>
            <span
              className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${
                template.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {template.status === "active" ? "Đang dùng" : "Tạm ẩn"}
            </span>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-600">
            {template.work_type && (
              <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                {WORK_TYPE_LABEL[template.work_type] ?? template.work_type}
              </span>
            )}
            {template.department && (
              <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full">
                {getDeptLabel(template.department)}
              </span>
            )}
            {template.location && (
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                {template.location}
              </span>
            )}
            {template.document_number && (
              <span className="bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full">
                CV: {template.document_number}
              </span>
            )}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ListTodo className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800 text-lg">
              Nhiệm Vụ ({template.tasks.length})
            </h2>
          </div>

          {template.tasks.length === 0 ? (
            <p className="text-sm text-gray-400 italic">
              Mẫu này chưa có nhiệm vụ nào
            </p>
          ) : (
            <div className="space-y-3">
              {template.tasks.map((task, i) => (
                <div
                  key={i}
                  className="border border-gray-100 rounded-lg p-4 bg-gray-50 space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-gray-800">
                      {i + 1}. {task.title}
                    </span>
                    {task.requires_dqcd && (
                      <span className="shrink-0 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                        Cần DQCĐ
                      </span>
                    )}
                  </div>

                  {task.report_fields && task.report_fields.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {task.report_fields.map((f, fi) => (
                        <span
                          key={fi}
                          className="text-xs bg-white border border-gray-200 px-2 py-0.5 rounded text-gray-600"
                        >
                          {f.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
