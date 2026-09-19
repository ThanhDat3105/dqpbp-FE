"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import {
  Info,
  ListTodo,
  Save,
  AlertTriangle,
  Paperclip,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { activityAPI, CreateActivityInterface } from "@/services/api/activity";
import Task from "@/components/activity/Task";
import { createActivitySchema } from "@/lib/validations";
import { toast } from "sonner";
import { departmentAPI, DepartmentInterface } from "@/services/api/department";
import { handleGetDepartment } from "@/utils/activity";
import { useAuth } from "@/context/AuthContext";
import {
  activityTemplateAPI,
  ActivityTemplateInterface,
} from "@/services/api/activity-template";
import { uploadAPI } from "@/services/api/upload";
import { kpiTargetAPI, KpiTargetInterface } from "@/services/api/kpi-target";

/** Radix Select không cho SelectItem có value rỗng, nên cần giá trị đại diện */
const NO_KPI_TARGET = "none";

interface FormData {
  name: string;
  department: string;
  /** KpiTargetLine["id"] được chọn, null = chưa chọn */
  kpiTargetLine: number | null;
  location: string;
  start_date: string;
  end_date: string;
  document_number: string;
  attached_files: string[];
  tasks: Array<{
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
    require_media_report: boolean;
  }>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function ActivityCreateSheet({
  onSuccess,
  onCancel,
  onRequestClose,
}: {
  onSuccess?: (newActivity: any) => void;
  onCancel?: () => void;
  onRequestClose?: (confirmFn: () => void) => void;
}) {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ActivityTemplateInterface[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | "">("");
  const [applyingTemplate, setApplyingTemplate] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [attachedFile, setAttachedFile] = useState<{
    name: string;
    url: string;
  } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: "",
    department: "",
    kpiTargetLine: null,
    location: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    document_number: "",
    attached_files: [],
    tasks: [],
    created_by: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const isDirty =
    formData.name !== "" ||
    formData.department !== "" ||
    formData.kpiTargetLine !== null ||
    formData.location !== "" ||
    formData.document_number !== "" ||
    formData.tasks.length > 0;

  const handleRequestClose = useCallback(() => {
    if (isDirty) {
      setShowConfirm(true);
    } else {
      onCancel?.();
    }
  }, [isDirty, onCancel]);

  useEffect(() => {
    onRequestClose?.(handleRequestClose);
  }, [onRequestClose, handleRequestClose]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});
  const [department, setDepartment] = useState<DepartmentInterface[]>([]);
  const [kpiTarget, setKpiTarget] = useState<KpiTargetInterface[]>([]);
  const [loading, setLoading] = useState(false);

  const selectedDepartmentId = department.find(
    (dept) => dept.code === formData.department,
  )?.id;

  const validateDateRange = (
    start: string,
    end: string,
    tasks: FormData["tasks"],
  ) => {
    const newDateErrors: Record<string, string> = {};

    if (start && end && start > end) {
      newDateErrors["end_date"] =
        "Ngày kết thúc không được nhỏ hơn ngày bắt đầu";
    }

    // Thêm T23:59 để đảm bảo due_date (datetime-local) có thể chọn vào ngày cuối cùng
    const endOfDay = end ? `${end}T23:59` : "";

    tasks.forEach((task, index) => {
      const displayStart = new Date(start).toLocaleDateString("vi-VN");
      const displayEnd = new Date(end).toLocaleDateString("vi-VN");

      if (task.due_date) {
        if (start && task.due_date < start) {
          newDateErrors[`tasks.${index}.due_date`] =
            `Thời hạn hoàn thành phải từ ngày bắt đầu kế hoạch (${displayStart}) trở đi`;
        } else if (endOfDay && task.due_date > endOfDay) {
          newDateErrors[`tasks.${index}.due_date`] =
            `Thời hạn hoàn thành phải trước hoặc bằng kết thúc kế hoạch (${displayEnd})`;
        }
      }
    });

    setDateErrors(newDateErrors);
    return newDateErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    const nextFormData = { ...formData, [name]: value };
    setFormData(nextFormData);

    if (name === "start_date" && value) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startDate = new Date(value);

      if (startDate < today) {
        setErrors((prev) => ({
          ...prev,
          start_date: `Ngày bắt đầu không được nhỏ hơn ngày hiện tại (${today.toLocaleDateString("vi-VN")})`,
        }));
      } else {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.start_date;
          return updated;
        });
      }
    }

    if (name === "start_date" || name === "end_date") {
      const start = name === "start_date" ? value : formData.start_date;
      const end = name === "end_date" ? value : formData.end_date;

      validateDateRange(start, end, formData.tasks);
    }

    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const validateForm = (): boolean => {
    const currentDateErrors = validateDateRange(
      formData.start_date,
      formData.end_date,
      formData.tasks,
    );
    if (Object.keys(currentDateErrors).length > 0) return false;

    try {
      createActivitySchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};

        error.issues.forEach((err) => {
          const field = err.path[0] as string;
          if (field && !fieldErrors[field]) {
            fieldErrors[field] = err.message;
          }
        });

        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const hasDraftDateErrors = Object.keys(dateErrors).length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { kpiTargetLine, ...activityFields } = formData;

      const payload: CreateActivityInterface = {
        ...activityFields,
        created_by: String(user?.id) || "admin",
        kpi_target_line_id: kpiTargetLine,
        // luôn gắn tổ, kể cả kế hoạch phát sinh, để outOfTargetCount đếm được
        kpi_team_id: selectedDepartmentId ?? null,
        out_of_target: kpiTargetLine === null,
        tasks: formData.tasks.map((task) => ({
          ...task,
          start_date: formData.start_date,
          created_at:
            typeof task.created_at === "string"
              ? task.created_at
              : task.created_at.toISOString(),
          updated_at:
            typeof task.updated_at === "string"
              ? task.updated_at
              : task.updated_at.toISOString(),
          report_fields: task.report_fields.map(({ id, ...rest }) => rest),
          requires_dqcd: task.requires_dqcd,
        })),
      };

      const response = await activityAPI.createActivity(payload);

      if (response) {
        const createdActivity = response.metaData
          ? response.metaData
          : response;
        toast.success("Tạo hoạt động thành công!");
        if (onSuccess) onSuccess(createdActivity);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi tạo hoạt động!");
    } finally {
      setLoading(false);
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
          due_date: "",
          notes: "",
          report_fields: [],
          status: "pending",
          accepted_at: null,
          completed: false,
          created_at: new Date(),
          updated_at: new Date(),
          requires_dqcd: false,
          require_media_report: false,
        },
      ],
    }));
  };

  const handleDeleteTask = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((task) => task.id !== id),
    }));
  };

  const handleChangeTask = (taskId: number, field: string, value: any) => {
    setFormData((prev) => {
      const updatedTasks = [...prev.tasks];
      const taskIndex = updatedTasks.findIndex((task) => task.id === taskId);
      if (taskIndex === -1) return prev;

      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        [field]: value,
      };

      if (field === "due_date") {
        validateDateRange(prev.start_date, prev.end_date, updatedTasks);
      }

      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleAddReportField = (taskId: number) => {
    setFormData((prev) => {
      const updatedTasks = prev.tasks.map((task) => {
        if (task.id !== taskId) return task;

        return {
          ...task,
          report_fields: [
            ...task.report_fields,
            { id: Math.random(), name: "", value: "" },
          ],
        };
      });

      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleRemoveReportField = (taskId: number, fieldIndex: number) => {
    setFormData((prev) => {
      const updatedTasks = prev.tasks.map((task) => {
        if (task.id !== taskId) return task;

        return {
          ...task,
          report_fields: task.report_fields.filter(
            (_, index) => index !== fieldIndex,
          ),
        };
      });

      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleChangeReportField = (
    taskId: number,
    fieldIndex: number,
    key: "name" | "value",
    value: string,
  ) => {
    setFormData((prev) => {
      const updatedTasks = [...prev.tasks];
      const taskIndex = updatedTasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        updatedTasks[taskIndex].report_fields[fieldIndex][key] = value;
      }
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleGetDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await departmentAPI.getAllDepartment();
      setDepartment(res);
    } catch (error) {
      console.error("Error fetching departments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // nhận teamId qua tham số để useCallback([]) không bắt phải giá trị cũ
  const handleGetKpiTarget = useCallback(async (teamId: number) => {
    setLoading(true);
    try {
      const res = await kpiTargetAPI.getAllKpiTargets(teamId);
      setKpiTarget(res);
    } catch (error) {
      console.error("Error fetching KPI targets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleGetDepartments();
  }, [handleGetDepartments]);

  useEffect(() => {
    if (!selectedDepartmentId) {
      setKpiTarget([]);
      return;
    }
    handleGetKpiTarget(selectedDepartmentId);
  }, [selectedDepartmentId, handleGetKpiTarget]);

  useEffect(() => {
    activityTemplateAPI
      .getTemplates({ status: "active", limit: 100 })
      .then((data) => setTemplates(data.results))
      .catch(() => {});
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const url = await uploadAPI.uploadDocument(file, "activities");
      setAttachedFile({ name: file.name, url });
      setFormData((prev) => ({ ...prev, attached_files: [url] }));
    } catch {
      toast.error("Không thể tải file lên, vui lòng thử lại");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleRemoveFile = async () => {
    if (!attachedFile) return;
    try {
      await uploadAPI.deleteFile(attachedFile.url);
    } catch {
      // bỏ qua lỗi xóa — FE vẫn clear state
    } finally {
      setAttachedFile(null);
      setFormData((prev) => ({ ...prev, attached_files: [] }));
    }
  };

  const handleApplyTemplate = async (templateId: number) => {
    setApplyingTemplate(true);
    try {
      const tpl = await activityTemplateAPI.getTemplateById(templateId);
      setFormData((prev) => ({
        ...prev,
        name: tpl.name ?? prev.name,
        department: tpl.department ?? prev.department,
        kpiTargetLine: null,
        location: tpl.location ?? prev.location,
        document_number: tpl.document_number ?? prev.document_number,
        tasks: tpl.tasks.map((t) => ({
          id: Math.random(),
          title: t.title,
          team: t.team ?? [],
          assignees: t.assignees.map((a) => String(a)) ?? [],
          due_date: "",
          notes: t.notes ?? "",
          report_fields: (t.report_fields ?? []).map((rf, j) => ({
            id: j,
            name: rf.name,
            value: rf.value ?? "",
          })),
          status: "pending",
          accepted_at: null,
          completed: false,
          created_at: new Date(),
          updated_at: new Date(),
          requires_dqcd: t.requires_dqcd ?? false,
          require_media_report: t.require_media_report ?? false,
        })),
      }));
    } catch {
      toast.error("Không thể tải mẫu kế hoạch");
    } finally {
      setApplyingTemplate(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Tạo Hoạt Động Mới</h1>
        <p className="text-sm text-gray-500 mt-1">
          Nhập thông tin cơ bản và những nhiệm vụ cần hoàn thành
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-gray-600" />
            <h2 className="font-semibold text-gray-800 text-lg">
              Thông Tin Cơ Bản
            </h2>
          </div>

          <FormField label="Dùng mẫu có sẵn">
            <Select
              value={selectedTemplateId ? String(selectedTemplateId) : ""}
              onValueChange={(val) => {
                const id = Number(val);
                setSelectedTemplateId(id);
                handleApplyTemplate(id);
              }}
              disabled={applyingTemplate}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="-- Chọn mẫu kế hoạch --" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((tpl) => (
                  <SelectItem key={tpl.id} value={String(tpl.id)}>
                    {tpl.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Tên Kế Hoạch" required error={errors.name}>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Huấn luyện sử dụng vũ khí"
              className={errors.name ? "border-red-500" : ""}
            />
          </FormField>

          <FormField label="Tổ Công Tác" required error={errors.department}>
            <Select
              value={formData.department}
              onValueChange={(val) =>
                // đổi tổ thì chỉ tiêu cũ không còn hợp lệ -> reset
                setFormData((prev) => ({
                  ...prev,
                  department: val,
                  kpiTargetLine: null,
                }))
              }
            >
              <SelectTrigger
                className={errors.department ? "border-red-500" : ""}
              >
                <SelectValue placeholder="-- Chọn tổ công tác --" />
              </SelectTrigger>
              <SelectContent>
                {department.map((dept) => (
                  <SelectItem key={dept.id} value={dept.code}>
                    {handleGetDepartment(dept.code)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField
            label="Chỉ Tiêu"
            error={errors.kpiTargetLine}
            hint={
              !formData.department ? (
                <span className="text-gray-500">
                  Chọn tổ công tác trước để hiện danh sách chỉ tiêu
                </span>
              ) : kpiTarget[0]?.lines.length === 0 ? (
                <span className="text-amber-600">
                  Tổ này chưa có chỉ tiêu nào
                </span>
              ) : (
                <span className="text-gray-500">
                  Để trống nếu là nhiệm vụ phát sinh — sẽ không tính vào KPI
                </span>
              )
            }
          >
            <Select
              // Radix không nhận SelectItem value="" nên dùng sentinel cho "phát sinh"
              value={
                formData.kpiTargetLine === null
                  ? NO_KPI_TARGET
                  : String(formData.kpiTargetLine)
              }
              onValueChange={(val) =>
                setFormData((prev) => ({
                  ...prev,
                  kpiTargetLine: val === NO_KPI_TARGET ? null : Number(val),
                }))
              }
              disabled={
                !formData.department || kpiTarget[0]?.lines.length === 0
              }
            >
              <SelectTrigger
                className={errors.kpiTargetLine ? "border-red-500" : ""}
              >
                <SelectValue placeholder="-- Chọn chỉ tiêu --" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_KPI_TARGET}>
                  -- Không thuộc chỉ tiêu (phát sinh) --
                </SelectItem>
                {kpiTarget[0]?.lines.map((line) => (
                  <SelectItem key={line.id} value={String(line.id)}>
                    {line.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Địa Điểm" error={errors.location}>
            <Input
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="VD: Sân tập P10"
              className={errors.location ? "border-red-500" : ""}
            />
          </FormField>

          <FormField label="Ngày Bắt Đầu" required error={errors.start_date}>
            <Input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className={errors.start_date ? "border-red-500" : ""}
            />
          </FormField>

          <FormField
            label="Ngày Kết Thúc"
            required
            error={dateErrors.end_date || errors.end_date}
          >
            <Input
              type="date"
              name="end_date"
              value={formData.end_date}
              min={formData.start_date || undefined}
              onChange={handleChange}
              className={
                dateErrors.end_date || errors.end_date ? "border-red-500" : ""
              }
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

          <FormField label="File đính kèm">
            {attachedFile ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50">
                <Paperclip className="h-4 w-4 text-gray-400 shrink-0" />
                <a
                  href={attachedFile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline truncate flex-1"
                >
                  {attachedFile.name}
                </a>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="shrink-0 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-gray-300 hover:border-[#556B2F] hover:bg-[#F4FAE8] transition-colors cursor-pointer">
                {uploadingFile ? (
                  <Loader2 className="h-4 w-4 text-[#556B2F] animate-spin" />
                ) : (
                  <Paperclip className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm text-gray-500">
                  {uploadingFile ? "Đang tải lên..." : "Chọn file (PDF, Word)"}
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  disabled={uploadingFile}
                />
              </label>
            )}
          </FormField>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-gray-600" />
              <h2 className="font-semibold text-gray-800 text-lg">Nhiệm Vụ</h2>
            </div>
          </div>

          {formData.tasks.length === 0 ? (
            <div
              onClick={handleAddTask}
              className="items-center text-center gap-2 px-6 py-2.5 rounded-lg border border-dashed border-[#556B2F] bg-[#F4FAE8] text-[#556B2F] font-semibold text-sm hover:bg-[#e8f3cc] transition-colors cursor-pointer"
            >
              <p>+ Thêm nhiệm vụ</p>
            </div>
          ) : (
            <div className="space-y-4">
              {formData.tasks.map((task, index) => (
                <div key={index} className="border rounded-xl p-4 bg-gray-50">
                  <Task
                    task={task}
                    taskIndex={index}
                    errors={{ ...errors, ...dateErrors }}
                    activityStartDate={formData.start_date}
                    activityEndDate={formData.end_date}
                    onDeleteTask={() => handleDeleteTask(task.id)}
                    onChangeField={(field, value) =>
                      handleChangeTask(task.id, field, value)
                    }
                    onAddReportField={() => handleAddReportField(task.id)}
                    onRemoveReportField={(i) =>
                      handleRemoveReportField(task.id, i)
                    }
                    onChangeReportField={(i, key, value) =>
                      handleChangeReportField(task.id, i, key, value)
                    }
                  />
                </div>
              ))}
              <div
                onClick={handleAddTask}
                className="items-center text-center gap-2 px-6 py-2.5 rounded-lg border border-dashed border-[#556B2F] bg-[#F4FAE8] text-[#556B2F] font-semibold text-sm hover:bg-[#e8f3cc] transition-colors cursor-pointer"
              >
                <p>+ Thêm nhiệm vụ</p>
              </div>
            </div>
          )}
          {errors.tasks && (
            <p className="text-sm text-red-500">{errors.tasks}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 pb-2 border-t">
          <Button type="button" variant="outline" onClick={handleRequestClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading || hasDraftDateErrors}
            className="bg-[#556b2f]"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Đang lưu..." : "Tạo Hoạt Động"}
          </Button>
        </div>
      </form>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <DialogTitle>Xác nhận đóng</DialogTitle>
            </div>
            <DialogDescription>
              Bạn đã nhập một số thông tin. Nếu đóng, dữ liệu sẽ bị mất. Bạn có
              chắc muốn đóng không?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>
              Tiếp tục chỉnh sửa
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowConfirm(false);
                onCancel?.();
              }}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      <Label className="text-sm font-medium text-gray-700 block mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {hint && <div className="mt-1 text-xs">{hint}</div>}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}
