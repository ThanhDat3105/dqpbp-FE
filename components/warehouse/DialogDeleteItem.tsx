"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  getWarehouseErrorMessage,
  type WarehouseItem,
  warehouseApi,
} from "@/services/api/warehouse";
import { formatNumber } from "./constants";

interface DialogDeleteItemProps {
  open: boolean;
  item: WarehouseItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DialogDeleteItem({
  open,
  item,
  onClose,
  onSuccess,
}: DialogDeleteItemProps) {
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setNote("");
  }, [open]);

  const handleDelete = async () => {
    if (!item || submitting) return;
    setSubmitting(true);
    try {
      await warehouseApi.remove(item.id, note.trim() || undefined);
      toast.success(`Đã xoá "${item.name}" khỏi kho`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getWarehouseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!item) return null;

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xoá &quot;{item.name}&quot;?</AlertDialogTitle>
          <AlertDialogDescription>
            Vật phẩm đang còn{" "}
            <strong>
              {formatNumber(item.quantity)} {item.unit}
            </strong>{" "}
            trong kho. Thao tác này không hoàn tác được, nhưng lịch sử xuất nhập
            của vật phẩm vẫn được giữ lại.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="delete-note">Lý do xoá</Label>
          <textarea
            id="delete-note"
            rows={2}
            placeholder="Tuỳ chọn — sẽ được ghi vào lịch sử"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-[#6B8E23] focus:outline-none"
          />
        </div>

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel disabled={submitting}>Huỷ</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={submitting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {submitting ? "Đang xoá..." : "Xoá vật phẩm"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
