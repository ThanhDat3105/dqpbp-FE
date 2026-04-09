import { TaskInterface } from "@/services/api/activity";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface Props {
  openReportModal: boolean;
  setOpenReportModal: (open: boolean) => void;
  formData: TaskInterface;
  hasEmptyFields: boolean;
  handleReportFieldChange: (index: number, value: string) => void;
  handleSubmitReport: () => Promise<void>;
  loading: boolean;
}

export default function ReportDialog({
  openReportModal,
  setOpenReportModal,
  formData,
  hasEmptyFields,
  handleReportFieldChange,
  handleSubmitReport,
  loading,
}: Props) {
  return (
    <Dialog open={openReportModal} onOpenChange={setOpenReportModal}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Báo cáo</DialogTitle>
          <DialogDescription>
            Điền đầy đủ thông tin báo cáo cho nhiệm vụ này
          </DialogDescription>
        </DialogHeader>

        {/* Report Fields */}
        <div className="space-y-4 py-4">
          {formData.report_fields?.map((field, index) => (
            <div key={index}>
              <Label htmlFor={`field-${index}`} className="text-gray-700">
                {field.name}
              </Label>
              <Input
                id={`field-${index}`}
                type="text"
                placeholder="Nhập câu trả lời"
                value={field.value || ""}
                onChange={(e) => handleReportFieldChange(index, e.target.value)}
                disabled={loading}
                autoFocus={index === 0}
                className="w-full mt-2"
              />
            </div>
          ))}
        </div>

        {/* Dialog Footer */}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpenReportModal(false)}
            disabled={loading}
          >
            Đóng
          </Button>
          <Button
            onClick={handleSubmitReport}
            disabled={loading || hasEmptyFields}
          >
            {loading ? "Đang cập nhật..." : "Cập nhật báo cáo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
