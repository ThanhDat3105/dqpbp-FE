import {
  activityAPI,
  TaskInterface,
  TaskStatus,
} from "@/services/api/activity";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useActivity } from "@/context/ActivityContext";
import { toast } from "sonner";
import { useEffect, useState } from "react";

interface Props {
  openUpdateTask: boolean;
  setOpenUpdateTask: React.Dispatch<React.SetStateAction<boolean>>;
  task: TaskInterface;
  formData: TaskInterface;
  loading: boolean;
  setFormData: React.Dispatch<React.SetStateAction<TaskInterface>>;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ProgressDialog({
  openUpdateTask,
  setOpenUpdateTask,
  task,
  formData,
  loading,
  setFormData,
  setLoading,
}: Props) {
  const { fetchActivityDetail, activity } = useActivity();
  const [selectedStatus, setSelectedStatus] = useState<TaskStatus>(
    (task.status as TaskStatus) || "pending",
  );

  const isAllFieldsFilled = () => {
    if (!task.report_fields || task.report_fields.length === 0) {
      return true;
    }
    return task.report_fields.every(
      (field) => field.value && field.value.trim() !== "",
    );
  };

  const canSelectCompleted =
    formData.status === "in_progress" && isAllFieldsFilled();

  const handleSubmitStatus = async () => {
    try {
      setLoading(true);

      // Validate completed status
      if (selectedStatus === "completed" && !isAllFieldsFilled()) {
        toast.error("Vui lòng điền đầy đủ báo cáo trước khi hoàn thành");
        return;
      }

      await activityAPI.updateTaskStatus(formData.id, selectedStatus);

      toast.success("Cập nhật trạng thái thành công");
      setOpenUpdateTask(false);
      await fetchActivityDetail(activity.id);
    } catch (err) {
      toast.error("Cập nhật trạng thái thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFormData(task);
    setSelectedStatus((task.status as TaskStatus) || "pending");
  }, [task]);

  return (
    <Dialog open={openUpdateTask} onOpenChange={setOpenUpdateTask}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cập nhật tiến độ</DialogTitle>
          <DialogDescription>
            Chọn trạng thái thực hiện cho nhiệm vụ
          </DialogDescription>
        </DialogHeader>

        {/* Status Select */}
        <div className="flex flex-col space-y-4 py-4">
          <Label htmlFor="status-select" className="text-gray-700">
            Trạng thái
          </Label>
          <Select
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value as TaskStatus)}
          >
            <SelectTrigger id="status-select">
              <SelectValue placeholder="Chọn trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Chờ nhận</SelectItem>
              <SelectItem value="in_progress">Đang thực hiện</SelectItem>
              <SelectItem
                value="completed"
                disabled={!canSelectCompleted}
                className={!canSelectCompleted ? "opacity-50" : ""}
              >
                Hoàn thành
              </SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-yellow-500">
            * Lưu ý: Khi chọn trạng thái <strong>"Hoàn thành"</strong>, vui lòng
            đảm bảo đã điền đầy đủ thông tin báo cáo
          </span>
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenUpdateTask(false)}
            disabled={loading}
          >
            Đóng
          </Button>
          <Button
            onClick={handleSubmitStatus}
            disabled={
              loading || (selectedStatus === "completed" && !isAllFieldsFilled)
            }
          >
            {loading ? "Đang cập nhật..." : "Cập nhật trạng thái"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
