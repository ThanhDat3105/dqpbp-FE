import { TaskInterface, TaskStatus } from "@/services/api/activity";
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

interface Props {
  formData: TaskInterface;
  openProgressModal: boolean;
  setOpenProgressModal: (open: boolean) => void;
  selectedStatus: TaskStatus;
  setSelectedStatus: React.Dispatch<React.SetStateAction<TaskStatus>>;
  isAllFieldsFilled: boolean;
  loading: boolean;
  handleSubmitStatus: () => Promise<void>;
}

export default function ProgressDialog({
  formData,
  handleSubmitStatus,
  isAllFieldsFilled,
  loading,
  openProgressModal,
  selectedStatus,
  setOpenProgressModal,
  setSelectedStatus,
}: Props) {
  const canSelectCompleted =
    formData.status === "in_progress" && isAllFieldsFilled;

  return (
    <Dialog open={openProgressModal} onOpenChange={setOpenProgressModal}>
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
              <SelectItem value="pending">Chưa bắt đầu</SelectItem>
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
            onClick={() => setOpenProgressModal(false)}
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
