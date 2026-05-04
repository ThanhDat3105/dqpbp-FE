import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "../ui/multi-select";
import { TaskInterface } from "@/services/api/activity";
import { useCallback, useEffect, useState } from "react";
import { UserOption, usersAPI } from "@/services/api/user";
import { toast } from "sonner";

interface Props {
  task: TaskInterface;
  openMobilizeModal: boolean;
  setOpenMobilizeModal: (open: boolean) => void;
  loading: boolean;
  onSuccess?: () => void;
}

export default function MobilizeDialog({
  task,
  loading,
  openMobilizeModal,
  setOpenMobilizeModal,
  onSuccess,
}: Props) {
  const [selectedUser, setSelectedUser] = useState<string[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleGetUsers = useCallback(async () => {
    try {
      const data = await usersAPI.getAvailableUsers({
        start_date: task.start_date,
        end_date: task.due_date,
      });

      setUsers(data);
    } catch (error) {}
  }, [task.id]);

  useEffect(() => {
    handleGetUsers();
  }, [handleGetUsers]);

  const handleConfirm = async () => {
    if (selectedUser.length === 0) return;

    try {
      setSubmitting(true);
      await usersAPI.assignDQCD(task.id, selectedUser);
      setOpenMobilizeModal(false);
      onSuccess?.();
      toast.success("Điều động DQCĐ thành công");
    } catch (error) {
      console.error("Assign DQCD failed:", error);
      toast.error("Điều động DQCĐ thất bại");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={openMobilizeModal} onOpenChange={setOpenMobilizeModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Điều động DQCĐ</DialogTitle>
          <DialogDescription>Chọn DQCĐ để điều động</DialogDescription>
        </DialogHeader>

        {/* Status Select */}
        <div className="flex flex-col space-y-4 py-4">
          <Label htmlFor="status-select" className="text-gray-700">
            Chọn DQCĐ
          </Label>
          <MultiSelect
            options={users.map((u) => ({
              value: u.id.toString(),
              label: u.name,
            }))}
            value={selectedUser}
            onValueChange={(value) => {
              setSelectedUser(value);
            }}
            placeholder="Chọn người thực hiện..."
          />
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenMobilizeModal(false)}
            disabled={loading}
          >
            Đóng
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || submitting || selectedUser.length === 0}
          >
            {submitting ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
