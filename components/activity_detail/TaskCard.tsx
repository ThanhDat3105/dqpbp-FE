"use client";

import { useState, useMemo, useEffect } from "react";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import {
  activityAPI,
  TaskInterface,
  TaskStatus,
} from "@/services/api/activity";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "sonner";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import ReportDialog from "./ReportDialog";
import ProgressDialog from "./ProgressDialog";
import { handleGetDepartment } from "@/utils/activity";
import MobilizeDialog from "./MobilizeDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActivity } from "@/context/ActivityContext";
import { useAuth } from "@/context/AuthContext";

export default function TaskCard({ task }: { task: TaskInterface }) {
  const { user } = useAuth();

  const { setOpenUpdateTask, fetchActivityDetail, activity } = useActivity();
  const [formData, setFormData] = useState<TaskInterface>(task);
  const [loading, setLoading] = useState(false);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [openMobilizeModal, setOpenMobilizeModal] = useState(false);

  // Compute field validation
  const hasEmptyFields = useMemo(() => {
    if (!formData.report_fields || formData.report_fields.length === 0) {
      return false;
    }
    return formData.report_fields.some(
      (field) => !field.value || field.value.trim() === "",
    );
  }, [formData.report_fields]);

  // Handlers for report fields
  const handleReportFieldChange = (index: number, value: string) => {
    setFormData((prevState) => ({
      ...prevState,
      report_fields: prevState.report_fields.map((field, i) =>
        i === index ? { ...field, value } : field,
      ),
    }));
  };

  // Submit report fields
  const handleSubmitReport = async () => {
    try {
      setLoading(true);

      const data = formData.report_fields.filter(
        (field) => field.value && field.value.trim() !== "",
      );

      await activityAPI.updateReportFields(
        activity.id,
        task.id.toString(),
        data,
      );

      toast.success("Cập nhật báo cáo thành công");
      setOpenReportModal(false);
      await fetchActivityDetail(activity.id);
    } catch (err) {
      const errorMessage =
        err instanceof axios.AxiosError
          ? err.response?.data?.message || err.message
          : "Cập nhật báo cáo thất bại";

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const acceptMobilize = user?.role === "CHI_HUY" || user?.role === "TO_TRUONG";

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 shadow p-4 h-fit">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 text-lg">
            {formData.title}
          </h2>

          {/* Status */}
          <div className="flex items-center gap-2 text-sm">
            {format(new Date(), "yyyy-MM-dd") >
              format(task.due_date, "yyyy-MM-dd") &&
              task.status !== "completed" && (
                <div className="flex justify-end">
                  <span className="flex items-center gap-1 px-2 py-1 font-bold rounded-full text-xs bg-red-100 text-red-600 whitespace-nowrap">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      className="shrink-0"
                    >
                      <path
                        fill="currentColor"
                        d="M2.725 21q-.275 0-.5-.137t-.35-.363t-.137-.488t.137-.512l9.25-16q.15-.25.388-.375T12 3t.488.125t.387.375l9.25 16q.15.25.138.513t-.138.487t-.35.363t-.5.137zm1.725-2h15.1L12 6zm8.263-1.287Q13 17.425 13 17t-.288-.712T12 16t-.712.288T11 17t.288.713T12 18t.713-.288m0-3Q13 14.425 13 14v-3q0-.425-.288-.712T12 10t-.712.288T11 11v3q0 .425.288.713T12 15t.713-.288M12 12.5"
                      />
                    </svg>
                    <span>Quá hạn</span>
                  </span>
                </div>
              )}

            <div className="flex sm:flex-col gap-1 sm:gap-1 flex-wrap sm:flex-nowrap">
              {task?.status === "pending" && (
                <span className="flex items-center gap-1 px-2 py-1 font-bold rounded-full text-xs bg-yellow-100 text-yellow-600 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-600 shrink-0"></span>
                  <span>Chưa bắt đầu</span>
                </span>
              )}

              {task?.status === "in_progress" && (
                <span className="flex items-center gap-1 px-2 py-1 font-bold rounded-full text-xs bg-blue-100 text-blue-600 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0"></span>
                  <span>Đang thực hiện</span>
                </span>
              )}

              {task?.status === "completed" && (
                <span className="flex items-center gap-1 px-2 py-1 font-bold rounded-full text-xs bg-green-100 text-green-600 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0"></span>
                  <span>Hoàn thành</span>
                </span>
              )}

              {task?.status === "cancelled" && (
                <span className="flex items-center gap-1 px-2 py-1 font-bold rounded-full text-xs bg-red-100 text-red-600 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0"></span>
                  <span>Đã hủy</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col items-start gap-4 text-sm text-gray-500 mt-2">
          <span className="flex items-center gap-1">
            <PeopleOutlinedIcon fontSize="small" />
            {handleGetDepartment(activity?.department)}
          </span>

          {formData?.assignees?.length > 0 && (
            <span className="flex items-center gap-1">
              <PeopleOutlinedIcon fontSize="small" />

              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>{formData.assignees.length} người thực hiện</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="flex flex-col gap-1">
                      {formData.assignees.map((assignee) => (
                        <span key={assignee.id}>{assignee.name}</span>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          )}

          <span className="flex items-center gap-1">
            <CalendarTodayIcon fontSize="small" />
            {format(task?.start_date, "dd/MM/yyyy HH:mm") || ""} -{" "}
            {format(task?.due_date, "dd/MM/yyyy HH:mm") || ""}
          </span>
        </div>
      </div>

      {task?.status !== "completed" ? (
        <>
          <div className="gap-2 mt-4 mb-2 grid grid-cols-2">
            {formData?.report_fields?.length > 0 && (
              <Button
                onClick={() => setOpenReportModal(true)}
                disabled={loading}
                variant="outline"
                className="flex-1"
              >
                Báo cáo
              </Button>
            )}
            <Button
              onClick={() => setOpenUpdateTask(true)}
              disabled={loading}
              variant="default"
              className="flex-1"
            >
              Cập nhật tiến độ
            </Button>
          </div>

          {task.requires_dqcd && acceptMobilize && (
            <div className="w-full">
              <Button
                onClick={() => setOpenMobilizeModal(true)}
                disabled={loading}
                variant="default"
                className="w-full"
              >
                Điều động DQCĐ
              </Button>
            </div>
          )}

          {/* ===== REPORT MODAL ===== */}
          <ReportDialog
            formData={formData}
            handleReportFieldChange={handleReportFieldChange}
            handleSubmitReport={handleSubmitReport}
            hasEmptyFields={hasEmptyFields}
            loading={loading}
            openReportModal={openReportModal}
            setOpenReportModal={setOpenReportModal}
          />

          {/* ===== PROGRESS MODAL ===== */}
          <ProgressDialog
            task={task}
            formData={formData}
            setFormData={setFormData}
            loading={loading}
            setLoading={setLoading}
          />

          <MobilizeDialog
            task={task}
            loading={loading}
            openMobilizeModal={openMobilizeModal}
            setOpenMobilizeModal={setOpenMobilizeModal}
            onSuccess={() => {
              void fetchActivityDetail(activity.id);
            }}
          />
        </>
      ) : (
        task?.report_fields?.map((field) => (
          <div key={field.name} className="mt-4 flex gap-2">
            <h3 className="text-sm">{field.name}:</h3>
            <p className="font-bold">{field.value}</p>
          </div>
        ))
      )}
    </div>
  );
}
