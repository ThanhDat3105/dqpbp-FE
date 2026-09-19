"use client";

import { ClipboardCheck, PackageMinus, PackagePlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import {
  getWarehouseErrorMessage,
  type WarehouseItem,
  warehouseApi,
} from "@/services/api/warehouse";
import { formatNumber } from "./constants";
import { WarehouseStatusBadge } from "./WarehouseStatusBadge";

export type StockMovementMode = "import" | "export" | "adjust";

const MODES = {
  import: {
    title: "Nhập thêm hàng",
    description: "Số lượng nhập sẽ được cộng vào tồn kho hiện tại.",
    label: "Số lượng nhập thêm *",
    submit: "Nhập thêm",
    icon: PackagePlus,
    accent: "text-green-700",
    button: "bg-green-600 hover:bg-green-700",
    call: warehouseApi.importStock,
  },
  export: {
    title: "Xuất kho",
    description: "Số lượng xuất sẽ được trừ khỏi tồn kho hiện tại.",
    label: "Số lượng xuất *",
    submit: "Xuất kho",
    icon: PackageMinus,
    accent: "text-orange-700",
    button: "bg-orange-600 hover:bg-orange-700",
    call: warehouseApi.exportStock,
  },
  adjust: {
    title: "Kiểm kê",
    description:
      "Nhập số lượng thực tế đếm được. Tồn kho sẽ được đặt về đúng con số này.",
    label: "Số lượng thực tế *",
    submit: "Xác nhận kiểm kê",
    icon: ClipboardCheck,
    accent: "text-violet-700",
    button: "bg-violet-600 hover:bg-violet-700",
    call: warehouseApi.adjustStock,
  },
} as const;

interface DialogStockMovementProps {
  open: boolean;
  mode: StockMovementMode;
  item: WarehouseItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DialogStockMovement({
  open,
  mode,
  item,
  onClose,
  onSuccess,
}: DialogStockMovementProps) {
  const config = MODES[mode];
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setQuantity(mode === "adjust" ? String(item?.quantity ?? 0) : "");
    setNote("");
  }, [open, mode, item]);

  const parsed = Number(quantity);
  const isValidNumber = quantity !== "" && Number.isInteger(parsed);
  const min = mode === "adjust" ? 0 : 1;

  const { valid, previewQuantity, warning } = useMemo(() => {
    if (!item || !isValidNumber || parsed < min) {
      return {
        valid: false,
        previewQuantity: item?.quantity ?? 0,
        warning: null,
      };
    }

    if (mode === "import") {
      return {
        valid: true,
        previewQuantity: item.quantity + parsed,
        warning: null,
      };
    }

    if (mode === "export") {
      // Chặn ngay trên UI thay vì để BE trả 400
      if (parsed > item.quantity) {
        return {
          valid: false,
          previewQuantity: item.quantity,
          warning: `Tồn kho chỉ còn ${formatNumber(item.quantity)} ${item.unit}`,
        };
      }
      return {
        valid: true,
        previewQuantity: item.quantity - parsed,
        warning: null,
      };
    }

    const diff = parsed - item.quantity;
    return {
      valid: true,
      previewQuantity: parsed,
      warning:
        diff === 0
          ? "Số lượng khớp với sổ sách"
          : `Chênh lệch ${diff > 0 ? "+" : ""}${formatNumber(diff)} ${item.unit}`,
    };
  }, [item, isValidNumber, parsed, min, mode]);

  const handleSubmit = async () => {
    if (!item || !valid || submitting) return;
    setSubmitting(true);
    try {
      const result = await config.call(item.id, {
        quantity: parsed,
        note: note.trim() || undefined,
      });
      toast.success(
        `${config.submit} thành công — "${item.name}" còn ${formatNumber(
          result.item.quantity,
        )} ${result.item.unit}`,
      );
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getWarehouseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!item) return null;

  const Icon = config.icon;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-2", config.accent)}>
            <Icon className="h-5 w-5" />
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-medium text-gray-500">Vật phẩm</p>
                <p className="mt-0.5 text-sm font-bold text-gray-900">
                  {item.name}
                </p>
              </div>
              <WarehouseStatusBadge
                status={item.status}
                label={item.status_label}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Tồn kho hiện tại</span>
              <span className="font-semibold text-gray-900 tabular-nums">
                {formatNumber(item.quantity)} {item.unit}
              </span>
            </div>

            {valid && (
              <div className="flex items-center justify-between border-t border-gray-200 pt-3 text-sm">
                <span className="text-gray-500">Sau thao tác</span>
                <span
                  className={cn(
                    "font-bold tabular-nums",
                    previewQuantity <= item.low_stock_threshold
                      ? "text-red-600"
                      : "text-green-700",
                  )}
                >
                  {formatNumber(previewQuantity)} {item.unit}
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="stock-quantity">{config.label}</Label>
            <Input
              id="stock-quantity"
              type="number"
              min={min}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="0"
            />
            {warning && (
              <p
                className={cn(
                  "text-xs font-medium",
                  valid ? "text-gray-500" : "text-red-600",
                )}
              >
                {warning}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="stock-note">Ghi chú</Label>
            <textarea
              id="stock-note"
              rows={3}
              placeholder="Lý do / nguồn nhập / đơn vị nhận..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-[#6B8E23] focus:outline-none"
            />
            <p className="text-xs text-gray-400">
              Ghi chú và người thực hiện được lưu vào lịch sử kho.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Huỷ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!valid || submitting}
            className={cn("text-white", config.button)}
          >
            {submitting ? "Đang xử lý..." : config.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
