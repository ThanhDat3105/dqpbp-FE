"use client";

import { useState } from "react";
import { ZodFormattedError } from "zod";
import AddIcon from "@mui/icons-material/Add";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import TaskOutlinedIcon from "@mui/icons-material/TaskOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import { CreateActivityInterface, departments } from "@/services/api/activity";
import Task from "@/components/activity/Task";
import {
  createActivitySchema,
  CreateActivityFormData,
} from "@/lib/validations";

type FormErrors = ZodFormattedError<CreateActivityFormData>;

// Helper function to find first error path recursively
const findFirstErrorPath = (errors: FormErrors): string | null => {
  const traverse = (obj: any, path: string[] = []): string | null => {
    for (const key in obj) {
      if (obj[key]?._errors && obj[key]._errors.length > 0) {
        return [...path, key].join(".");
      }
      if (typeof obj[key] === "object" && obj[key] !== null) {
        const result = traverse(obj[key], [...path, key]);
        if (result) return result;
      }
    }
    return null;
  };
  return traverse(errors);
};

// Helper function to get error message by path
const getErrorMessage = (
  errors: FormErrors,
  path: string,
): string | undefined => {
  const keys = path.split(".");
  let current: any = errors;

  for (const key of keys) {
    if (current[key]) {
      current = current[key];
    } else {
      return undefined;
    }
  }

  return current?._errors?.[0];
};

// Helper function to scroll to error element
const scrollToError = (errorPath: string) => {
  const element = document.querySelector(`[data-error="${errorPath}"]`);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    (element as HTMLInputElement | HTMLSelectElement).focus();
  }
};

export default function CreateActivityPage() {
  const [form, setForm] = useState<CreateActivityInterface>({
    name: "",
    work_type: "",
    work_group: "",
    department: "",
    location: "",
    start_date: new Date(),
    end_date: new Date(),
    document_number: "",
    attached_files: [],
    tasks: [],
    created_by: "admin",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const [errors, setErrors] = useState<FormErrors | null>(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChangeTask = (e: any) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      tasks: [{ ...prev.tasks[0], [name]: value }],
    }));
  };

  const handleAddTask = () => {
    setForm((prev) => ({
      ...prev,
      tasks: [
        ...prev.tasks,
        {
          title: "",
          team: "",
          assignees: [],
          dueDate: new Date().toISOString(),
          notes: "",
          reportFields: [],
          accepted_at: null,
          completed: false,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
    }));
  };

  const handleDeleteTask = (index: number) => {
    setForm((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((_, i) => i !== index),
    }));
  };

  const handleAddReportField = (taskIndex: number) => {
    setForm((prev) => {
      const updatedTasks = [...prev.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        reportFields: [
          ...updatedTasks[taskIndex].reportFields,
          { name: "", value: "" },
        ],
      };
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleRemoveReportField = (taskIndex: number, fieldIndex: number) => {
    setForm((prev) => {
      const updatedTasks = [...prev.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        reportFields: updatedTasks[taskIndex].reportFields.filter(
          (_, i) => i !== fieldIndex,
        ),
      };
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleChangeReportField = (
    taskIndex: number,
    fieldIndex: number,
    key: "name" | "value",
    value: string,
  ) => {
    setForm((prev) => {
      const updatedTasks = [...prev.tasks];

      const updatedFields = [...updatedTasks[taskIndex].reportFields];

      updatedFields[fieldIndex] = {
        ...updatedFields[fieldIndex],
        [key]: value,
      };

      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        reportFields: updatedFields,
      };

      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleChangeAssignees = (taskIndex: number, userIds: string[]) => {
    setForm((prev) => {
      const updatedTasks = [...prev.tasks];
      updatedTasks[taskIndex] = {
        ...updatedTasks[taskIndex],
        assignees: userIds,
      };
      return { ...prev, tasks: updatedTasks };
    });
  };

  const handleCreateActivity = () => {
    const result = createActivitySchema.safeParse(form);

    if (!result.success) {
      const formatted = result.error.format();
      setErrors(formatted);

      const firstErrorPath = findFirstErrorPath(formatted);
      if (firstErrorPath) {
        setTimeout(() => scrollToError(firstErrorPath), 100);
      }
      return;
    }

    setErrors(null);
    const validData = result.data;
    console.log("Valid data:", validData);
    // TODO: Send to API
  };

  return (
    <div className="p-6 bg-gray-100">
      <div className="bg-white rounded-xl p-6 border border-gray-200 max-w-5xl mx-auto space-y-6">
        {/* Title */}
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <InfoOutlineIcon />
          Thông tin cơ bản
        </div>

        <div className="space-y-4">
          {/* Tên kế hoạch */}
          <div>
            <label className="block font-medium mb-1 text-sm">
              Tên kế hoạch <span className="text-red-500">*</span>
            </label>
            <input
              data-error="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="VD: Huấn luyện sử dụng vũ khí"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none placeholder:text-md transition-colors ${
                errors?.name?._errors?.length
                  ? "border-red-500 focus:ring-2 focus:ring-red-200"
                  : "border-gray-200 focus:ring-2 focus:ring-olive"
              }`}
            />
            {errors?.name?._errors?.[0] && (
              <p className="mt-1 text-sm text-red-500">
                {errors.name._errors[0]}
              </p>
            )}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Loại hoạt động */}
            <div>
              <label className="block font-medium mb-1 text-sm">
                Loại hoạt động <span className="text-red-500">*</span>
              </label>
              <select
                data-error="work_type"
                name="work_type"
                value={form.work_type}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 bg-white transition-colors ${
                  errors?.work_type?._errors?.length
                    ? "border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-200 focus:ring-2 focus:ring-olive"
                }`}
              >
                <option value="">-- Chọn loại công việc --</option>
                <option value="suddenly">Công việc phát sinh (đột xuất)</option>
                <option value="annual">Công việc theo kế hoạch năm</option>
              </select>
              {errors?.work_type?._errors?.[0] && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.work_type._errors[0]}
                </p>
              )}
            </div>

            {/* Tổ công tác */}
            <div>
              <label className="block font-medium mb-1 text-sm">
                Tổ công tác <span className="text-red-500">*</span>
              </label>
              <select
                data-error="work_group"
                name="work_group"
                value={form.work_group}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 bg-white transition-colors ${
                  errors?.work_group?._errors?.length
                    ? "border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-200 focus:ring-2 focus:ring-olive"
                }`}
              >
                <option value="">-- Chọn nhóm công việc --</option>
                <option value="training">Công tác Huấn luyện</option>
                <option value="deployment">Công tác Điều động</option>
                <option value="political">Công tác Chính trị</option>
                <option value="combat_readiness_check">
                  Kiểm tra tính chiến đấu
                </option>
                <option value="entertainment_sports">
                  Văn nghệ - Thể thao
                </option>
              </select>
              {errors?.work_group?._errors?.[0] && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.work_group._errors[0]}
                </p>
              )}
            </div>

            {/* Tổ phụ trách */}
            <div>
              <label className="block font-medium mb-1 text-sm">
                Tổ phụ trách <span className="text-red-500">*</span>
              </label>
              <select
                data-error="department"
                name="department"
                value={form.department}
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 bg-white transition-colors ${
                  errors?.department?._errors?.length
                    ? "border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-200 focus:ring-2 focus:ring-olive"
                }`}
              >
                <option value="">-- Chọn tổ --</option>
                {departments.map((dept) => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
              {errors?.department?._errors?.[0] && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.department._errors[0]}
                </p>
              )}
            </div>

            {/* Địa điểm */}
            <div>
              <label className="block font-medium mb-1 text-sm">Địa điểm</label>
              <input
                data-error="location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="VD: Sân tập P10, Kho vũ khí..."
                className={`w-full border rounded-lg px-3 py-2 transition-colors ${
                  errors?.location?._errors?.length
                    ? "border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-200 focus:ring-2 focus:ring-olive"
                }`}
              />
              {errors?.location?._errors?.[0] && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.location._errors[0]}
                </p>
              )}
            </div>

            {/* Ngày bắt đầu */}
            <div>
              <label className="block font-medium mb-1 text-sm">
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                data-error="start_date"
                type="date"
                name="start_date"
                value={
                  form.start_date
                    ? new Date(form.start_date).toISOString().split("T")[0]
                    : ""
                }
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 transition-colors ${
                  errors?.start_date?._errors?.length
                    ? "border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-200 focus:ring-2 focus:ring-olive"
                }`}
              />
              {errors?.start_date?._errors?.[0] && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.start_date._errors[0]}
                </p>
              )}
            </div>

            {/* Ngày kết thúc */}
            <div>
              <label className="block font-medium mb-1 text-sm">
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                data-error="end_date"
                type="date"
                name="end_date"
                value={
                  form.end_date
                    ? new Date(form.end_date).toISOString().split("T")[0]
                    : ""
                }
                onChange={handleChange}
                className={`w-full border rounded-lg px-3 py-2 transition-colors ${
                  errors?.end_date?._errors?.length
                    ? "border-red-500 focus:ring-2 focus:ring-red-200"
                    : "border-gray-200 focus:ring-2 focus:ring-olive"
                }`}
              />
              {errors?.end_date?._errors?.[0] && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.end_date._errors[0]}
                </p>
              )}
            </div>

            {/* Số công văn */}
            <div>
              <label className="block font-medium mb-1 text-sm">
                Số công văn
              </label>
              <input
                name="document_number"
                value={form.document_number}
                onChange={handleChange}
                placeholder="VD: 123/CV-DQ..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
              />
              <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                <LightbulbOutlinedIcon className="size-3!" /> Số hiệu công văn
                liên quan (nếu có)
              </p>
            </div>

            {/* Upload */}
            <div>
              <label className="block font-medium mb-1 text-sm">
                Tài liệu liên quan
              </label>
              <input
                type="file"
                multiple
                className="w-full border border-gray-200 rounded-lg px-3 py-2"
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <AttachFileIcon className="size-3!" /> Hỗ trợ: PDF, DOC, DOCX,
                JPG, PNG (Tối đa 10MB)
              </p>
            </div>
          </div>

          {/* Nhiệm vụ */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold flex items-center gap-1">
                <TaskOutlinedIcon /> Nhiệm vụ
              </span>

              <button
                onClick={handleAddTask}
                className="flex items-center gap-2 bg-olive-500 text-white px-4 py-2 rounded-lg hover:bg-olive-600/90"
              >
                <AddIcon fontSize="small" />
                Thêm nhiệm vụ
              </button>
            </div>

            {form.tasks.length === 0 && (
              <div className="border-2 border-dashed rounded-lg p-10 text-center text-gray-500">
                Chưa có nhiệm vụ nào. Nhấn "Thêm nhiệm vụ" để bắt đầu.
              </div>
            )}

            <div className="pt-5 space-y-5">
              {form.tasks.map((task, index) => {
                return (
                  <Task
                    key={index}
                    task={task}
                    index={index}
                    handleDeleteTask={handleDeleteTask}
                    handleAddReportField={handleAddReportField}
                    handleRemoveReportField={handleRemoveReportField}
                    handleChangeTask={handleChangeTask}
                    handleChangeReportField={handleChangeReportField}
                    handleChangeAssignees={handleChangeAssignees}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-6">
          <button className="border px-4 py-2 rounded-lg hover:bg-gray-100">
            Hủy
          </button>
          <button
            onClick={handleCreateActivity}
            className="bg-olive-500 text-white px-4 py-2 rounded-lg hover:bg-olive-600 flex items-center gap-2"
          >
            <SaveOutlinedIcon fontSize="small" /> Tạo hoạt động
          </button>
        </div>
      </div>
    </div>
  );
}
