import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AddIcon from "@mui/icons-material/Add";
import { departments, TaskInterface } from "@/services/api/activity";
import { Autocomplete, TextField } from "@mui/material";
import { ZodFormattedError } from "zod";
import { TaskFormData } from "@/lib/validations";

type TaskErrors = ZodFormattedError<TaskFormData> | undefined;

interface Props {
  task: Omit<TaskInterface, "id" | "activity_id">;
  index: number;
  errors?: TaskErrors;
  handleDeleteTask: (index: number) => void;
  handleAddReportField: (index: number) => void;
  handleRemoveReportField: (taskIndex: number, fieldIndex: number) => void;
  handleChangeTask: (e: any) => void;
  handleChangeReportField: (
    taskIndex: number,
    fieldIndex: number,
    key: "name" | "value",
    value: string,
  ) => void;
  handleChangeAssignees: (taskIndex: number, userIds: string[]) => void;
}

export default function Task({
  task,
  index,
  errors,
  handleDeleteTask,
  handleAddReportField,
  handleRemoveReportField,
  handleChangeTask,
  handleChangeReportField,
  handleChangeAssignees,
}: Props) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 bg-gray-50">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">Nhiệm vụ {index + 1}</h3>
        <button
          className="text-red-500 hover:bg-red-100 p-1 cursor-pointer transition-all rounded flex items-center justify-center"
          onClick={() => handleDeleteTask(index)}
        >
          <DeleteOutlineIcon fontSize="small" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Title */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Tên nhiệm vụ <span className="text-red-500">*</span>
          </label>
          <input
            data-error={`tasks.${index}.title`}
            placeholder="VD: Chuẩn bị vũ khí"
            className={`mt-1 w-full px-3 py-2 border rounded-lg bg-white focus:outline-none transition-colors ${
              errors?.title?._errors?.length
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:ring-2 focus:ring-olive"
            }`}
            value={task.title}
            onChange={handleChangeTask}
            name="title"
          />
          {errors?.title?._errors?.[0] && (
            <p className="mt-1 text-sm text-red-500">
              {errors.title._errors[0]}
            </p>
          )}
        </div>

        {/* Team */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Tổ phụ trách
          </label>
          <select
            data-error={`tasks.${index}.team`}
            className={`mt-1 w-full px-3 py-2 border rounded-lg bg-white focus:outline-none transition-colors ${
              errors?.team?._errors?.length
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:ring-2 focus:ring-olive"
            }`}
            value={task.team}
            name="team"
            onChange={handleChangeTask}
          >
            <option>Tất cả</option>
            {departments.map((dept) => (
              <option key={dept.value} value={dept.value}>
                {dept.label}
              </option>
            ))}
          </select>

          <p className="mt-1 text-xs text-gray-500 flex items-center gap-1">
            <LightbulbOutlinedIcon fontSize="inherit" /> Chọn tổ để lọc người
            thực hiện
          </p>
          {errors?.team?._errors?.[0] && (
            <p className="mt-1 text-sm text-red-500">
              {errors.team._errors[0]}
            </p>
          )}
        </div>

        {/* Assignee */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Người thực hiện <span className="text-red-500">*</span>
          </label>

          <div
            data-error={`tasks.${index}.assignees`}
            className={`mt-1 border rounded-lg transition-colors ${
              errors?.assignees?._errors?.length
                ? "border-red-500"
                : "border-gray-300"
            }`}
          >
            <Autocomplete
              multiple
              options={
                departments.find((dept) => dept.value === task.team)?.teams ||
                []
              }
              getOptionLabel={(option) => option.name}
              value={(
                departments.find((dept) => dept.value === task.team)?.teams ||
                []
              ).filter((user) => task.assignees?.includes(user.id))}
              onChange={(_, newValue) => {
                handleChangeAssignees(
                  index,
                  newValue.map((item) => item.id),
                );
              }}
              renderInput={(params) => (
                <TextField {...params} placeholder="Chọn người thực hiện" />
              )}
            />
          </div>

          <p className="mt-1 text-xs text-gray-500">
            Bạn có thể chọn nhiều người
          </p>
          {errors?.assignees?._errors?.[0] && (
            <p className="mt-1 text-sm text-red-500">
              {errors.assignees._errors[0]}
            </p>
          )}
        </div>

        {/* Date */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Thời hạn hoàn thành
          </label>
          <input
            data-error={`tasks.${index}.dueDate`}
            type="date"
            className={`mt-1 w-full px-3 py-2 border rounded-lg bg-white focus:outline-none transition-colors ${
              errors?.dueDate?._errors?.length
                ? "border-red-500 focus:ring-2 focus:ring-red-200"
                : "border-gray-300 focus:ring-2 focus:ring-olive"
            }`}
            value={
              task.dueDate
                ? new Date(task.dueDate).toISOString().split("T")[0]
                : ""
            }
            onChange={handleChangeTask}
            name="dueDate"
          />

          <p className="mt-1 text-xs text-orange-600 flex items-center gap-1">
            <WarningAmberIcon fontSize="inherit" /> Khi quá hạn, hệ thống sẽ gửi
            email cảnh báo tự động
          </p>
          {errors?.dueDate?._errors?.[0] && (
            <p className="mt-1 text-sm text-red-500">
              {errors.dueDate._errors[0]}
            </p>
          )}
        </div>

        {/* Report fields */}
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Hạng mục báo cáo (tùy chọn)
            </label>

            <button
              onClick={() => handleAddReportField(index)}
              className="text-sm text-olive flex items-center gap-1 hover:opacity-80"
            >
              <AddIcon fontSize="small" />
              Thêm hạng mục
            </button>
          </div>

          {/* Empty */}
          {task.reportFields.length === 0 && (
            <p className="text-xs text-gray-500 italic mb-2">
              Chưa có hạng mục báo cáo nào
            </p>
          )}

          {/* Field item */}
          <div className="space-y-2">
            {task.reportFields.map((field, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  data-error={`tasks.${index}.reportFields.${idx}.name`}
                  placeholder="VD: Số lượng súng, Số người tham gia..."
                  className={`flex-1 px-3 py-2 border rounded-lg text-sm transition-colors ${
                    errors?.reportFields?.[idx]?.name?._errors?.length
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  value={field.name}
                  onChange={(e) =>
                    handleChangeReportField(index, idx, "name", e.target.value)
                  }
                  name={`reportFields.${idx}.name`}
                />
                <button
                  className="text-red-500 hover:bg-red-100 transition-all size-6 cursor-pointer rounded flex items-center justify-center"
                  onClick={() => handleRemoveReportField(index, idx)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
