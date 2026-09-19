"use client";

import { useEffect, useState } from "react";
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
import { useWarehouseCategories } from "@/hooks/useWarehouseCategories";
import {
  getWarehouseErrorMessage,
  type WarehouseCategory,
  type WarehouseItem,
  warehouseApi,
} from "@/services/api/warehouse";

interface DialogItemFormProps {
  open: boolean;
  /** null = thêm mới, có giá trị = sửa */
  item: WarehouseItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormState {
  name: string;
  category: WarehouseCategory;
  quantity: string;
  unit: string;
  low_stock_threshold: string;
  note: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  category: "Khác",
  quantity: "0",
  unit: "cái",
  low_stock_threshold: "0",
  note: "",
};

export function DialogItemForm({
  open,
  item,
  onClose,
  onSuccess,
}: DialogItemFormProps) {
  const isEdit = Boolean(item);
  const { categories } = useWarehouseCategories();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(
      item
        ? {
            name: item.name,
            category: item.category,
            quantity: String(item.quantity),
            unit: item.unit,
            low_stock_threshold: String(item.low_stock_threshold),
            note: item.note ?? "",
          }
        : EMPTY_FORM,
    );
  }, [open, item]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const threshold = Number(form.low_stock_threshold);
  const quantity = Number(form.quantity);
  const valid =
    form.name.trim().length > 0 &&
    form.category.trim().length > 0 &&
    form.unit.trim().length > 0 &&
    Number.isInteger(threshold) &&
    threshold >= 0 &&
    (isEdit || (Number.isInteger(quantity) && quantity >= 0));

  const handleSubmit = async () => {
    if (!valid || submitting) return;
    setSubmitting(true);
    try {
      if (item) {
        // BE cấm sửa quantity ở endpoint này — đổi tồn kho phải qua nhập/xuất/kiểm kê
        await warehouseApi.update(item.id, {
          name: form.name.trim(),
          category: form.category.trim(),
          unit: form.unit.trim(),
          low_stock_threshold: threshold,
          note: form.note.trim(),
        });
        toast.success(`Đã cập nhật "${form.name.trim()}"`);
      } else {
        await warehouseApi.create({
          name: form.name.trim(),
          category: form.category.trim(),
          quantity,
          unit: form.unit.trim(),
          low_stock_threshold: threshold,
          note: form.note.trim() || undefined,
        });
        toast.success(`Đã thêm "${form.name.trim()}" vào kho`);
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getWarehouseErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Sửa thông tin vật phẩm" : "Thêm vật phẩm"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Số lượng không sửa ở đây — dùng Nhập thêm, Xuất kho hoặc Kiểm kê để có nhật ký."
              : "Trạng thái được hệ thống tự tính từ số lượng và ngưỡng cảnh báo."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="warehouse-name">Tên vật phẩm *</Label>
            <Input
              id="warehouse-name"
              placeholder="VD: Áo phao cứu sinh"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="warehouse-category">Danh mục *</Label>
              {/* Chọn danh mục có sẵn hoặc gõ danh mục mới */}
              <Input
                id="warehouse-category"
                list="warehouse-category-options"
                placeholder="VD: Quân trang"
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
              />
              <datalist id="warehouse-category-options">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="warehouse-unit">Đơn vị tính *</Label>
              <Input
                id="warehouse-unit"
                placeholder="cái / bộ / hộp"
                value={form.unit}
                onChange={(e) => set("unit", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {!isEdit && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="warehouse-quantity">Số lượng ban đầu *</Label>
                <Input
                  id="warehouse-quantity"
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={(e) => set("quantity", e.target.value)}
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="warehouse-threshold">Ngưỡng sắp hết *</Label>
              <Input
                id="warehouse-threshold"
                type="number"
                min={0}
                value={form.low_stock_threshold}
                onChange={(e) => set("low_stock_threshold", e.target.value)}
              />
              <p className="text-xs text-gray-400">
                Tồn kho ≤ ngưỡng này sẽ báo &quot;Sắp hết&quot;
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="warehouse-note">Ghi chú</Label>
            <textarea
              id="warehouse-note"
              rows={3}
              placeholder="Tuỳ chọn"
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:ring-2 focus:ring-[#6B8E23] focus:outline-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Huỷ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!valid || submitting}
            className="bg-[#556B2F] text-white hover:bg-[#465e17]"
          >
            {submitting
              ? "Đang lưu..."
              : isEdit
                ? "Lưu thay đổi"
                : "Thêm vật phẩm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
