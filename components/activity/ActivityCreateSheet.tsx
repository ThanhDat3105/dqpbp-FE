"use client";

import { useCallback, useEffect, useState } from "react";
import { z } from "zod";
import { Plus, Info, ListTodo, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { activityAPI, CreateActivityInterface } from "@/services/api/activity";
import Task from "@/components/activity/Task";
import { createActivitySchema } from "@/lib/validations";
import { toast } from "sonner";
import { departmentAPI } from "@/services/api/department";
import { handleGetDepartment } from "@/utils/activity";

interface FormData {
  name: string;
  work_type: string;
  department: string;
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
    start_date: string;
    due_date: string;
    notes: string;
    report_fields: Array<{ id: number; name: string; value: string }>;
    status: string;
    accepted_at: string | null;
    completed: boolean;
    created_at: Date | string;
    updated_at: Date | string;
    requires_dqcd: boolean;
  }>;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export default function ActivityCreateSheet({
  onSuccess,
  onCancel,
}: {
  onSuccess?: (newActivity: any) => void;
  onCancel?: () => void;
}) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    work_type: "",
    department: "",
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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});
  const [department, setDepartment] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const validateDateRange = (
    start: string,
    end: string,
    tasks: FormData["tasks"],
  ) => {
    const newDateErrors: Record<string, string> = {};

    if (start && end && start > end) {
      newDateErrors["start_date"] =
        "Ngày bắt đầu không được lớn hơn ngày kết thúc";
    }

    // Thêm T23:59 để đảm bảo due_date (datetime-local) có thể chọn vào ngày cuối cùng
    const endOfDay = end ? `${end}T23:59` : "";

    tasks.forEach((task, index) => {
      const displayStart = new Date(start).toLocaleDateString("vi-VN");
      const displayEnd = new Date(end).toLocaleDateString("vi-VN");

      // Validate Task Start Date
      if (task.start_date) {
        if (start && task.start_date < start) {
          newDateErrors[`tasks.${index}.start_date`] =
            `Thời gian bắt đầu nhiệm vụ phải từ ngày bắt đầu kế hoạch (${displayStart}) trở đi`;
        }
        if (task.due_date && task.start_date > task.due_date) {
          newDateErrors[`tasks.${index}.start_date`] =
            `Thời gian bắt đầu không được trễ hơn thời hạn hoàn thành`;
        }
      }

      // Validate Task Due Date
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
      const payload: CreateActivityInterface = {
        ...formData,
        tasks: formData.tasks.map((task) => ({
          ...task,
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
          start_date: "", // Khởi tạo trường start_date
          due_date: "",
          notes: "",
          report_fields: [],
          status: "pending",
          accepted_at: null,
          completed: false,
          created_at: new Date(),
          updated_at: new Date(),
          requires_dqcd: false,
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

      // Trigger validate lại khi thay đổi ngày của task
      if (field === "start_date" || field === "due_date") {
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

      const department = res.map((de) => de.code);

      setDepartment(department);
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    handleGetDepartments();
  }, [handleGetDepartments]);

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

          <FormField label="Tên Kế Hoạch" required error={errors.name}>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Huấn luyện sử dụng vũ khí"
              className={errors.name ? "border-red-500" : ""}
            />
          </FormField>

          <FormField label="Loại Hoạt Động" required error={errors.work_type}>
            <select
              name="work_type"
              value={formData.work_type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.work_type ? "border-red-500" : "border-gray-200"
              }`}
            >
              <option value="">-- Chọn loại công việc --</option>
              <option value="suddenly">Công việc đột xuất</option>
              <option value="annual">Công việc theo năm</option>
            </select>
          </FormField>

          <FormField label="Tổ Công Tác" required error={errors.department}>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.department ? "border-red-500" : "border-gray-200"
              }`}
            >
              <option value="">-- Chọn tổ công tác --</option>
              {department.map((dept) => (
                <option key={dept} value={dept}>
                  {handleGetDepartment(dept)}
                </option>
              ))}
            </select>
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

          <FormField label="Ngày Kết Thúc" required error={errors.end_date}>
            <Input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              className={errors.end_date ? "border-red-500" : ""}
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

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-gray-600" />
              <h2 className="font-semibold text-gray-800 text-lg">Nhiệm Vụ</h2>
            </div>
            <Button type="button" size="sm" onClick={handleAddTask}>
              <Plus className="h-4 w-4 mr-1" />
              Thêm
            </Button>
          </div>

          {formData.tasks.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-500">
              <p>Chưa có nhiệm vụ nào</p>
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
            </div>
          )}
          {errors.tasks && (
            <p className="text-sm text-red-500">{errors.tasks}</p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 pb-2 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading || hasDraftDateErrors}>
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Đang lưu..." : "Tạo Hoạt Động"}
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
