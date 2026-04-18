"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const TODAY = new Date().toISOString().split("T")[0];

export interface StockItem {
  id: number;
  name: string;
  category: string;
  current: number;
  max: number;
  status: string;
  statusLabel: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  inventory: StockItem[];
}

const EMPTY_FORM = {
  vatPhamId: "",
  soLuongXuat: "",
  nguoiNhan: "",
  donVi: "",
  ngayXuat: TODAY,
  ghiChu: "",
};

export default function DialogXuatKho({ open, onClose, inventory }: Props) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [qtyError, setQtyError] = useState("");

  const set = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    if (k === "soLuongXuat" || k === "vatPhamId") setQtyError("");
  };

  const selectedItem = inventory.find((i) => String(i.id) === form.vatPhamId);

  const handleQtyBlur = () => {
    if (!selectedItem || !form.soLuongXuat) return;
    const qty = Number(form.soLuongXuat);
    if (qty > selectedItem.current) {
      setQtyError(
        `Số lượng xuất vượt quá tồn kho hiện tại (${selectedItem.current} còn lại)`,
      );
    } else {
      setQtyError("");
    }
  };

  const valid =
    form.vatPhamId &&
    form.soLuongXuat &&
    !qtyError &&
    form.nguoiNhan &&
    form.donVi &&
    form.ngayXuat;

  const handleSubmit = () => {
    console.log("Xuất kho:", { ...form, item: selectedItem });
    toast.success("Đã xuất kho thành công");
    setForm(EMPTY_FORM);
    setQtyError("");
    onClose();
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setQtyError("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">➖ Xuất kho</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <Field label="Vật phẩm *">
            <select
              id="xuat-vatpham"
              className={inputCls}
              value={form.vatPhamId}
              onChange={(e) => set("vatPhamId", e.target.value)}
            >
              <option value="">-- Chọn vật phẩm --</option>
              {inventory.map((i) => (
                <option key={i.id} value={String(i.id)}>
                  {i.name} (Tồn: {i.current})
                </option>
              ))}
            </select>
          </Field>

          <Field label="Số lượng xuất *">
            <input
              id="xuat-soluong"
              type="number"
              min={1}
              className={inputCls + (qtyError ? " border-red-400 ring-1 ring-red-400" : "")}
              placeholder="0"
              value={form.soLuongXuat}
              onChange={(e) => set("soLuongXuat", e.target.value)}
              onBlur={handleQtyBlur}
            />
            {qtyError && (
              <p className="text-xs text-red-600 mt-0.5">{qtyError}</p>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Người nhận *">
              <input
                id="xuat-nguoinhan"
                className={inputCls}
                placeholder="Họ tên người nhận"
                value={form.nguoiNhan}
                onChange={(e) => set("nguoiNhan", e.target.value)}
              />
            </Field>
            <Field label="Đơn vị / Tổ *">
              <input
                id="xuat-donvi"
                className={inputCls}
                placeholder="VD: Tổ 3, DQCĐ Tổ 1…"
                value={form.donVi}
                onChange={(e) => set("donVi", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Ngày xuất *">
            <input
              id="xuat-ngay"
              type="date"
              className={inputCls}
              value={form.ngayXuat}
              onChange={(e) => set("ngayXuat", e.target.value)}
            />
          </Field>

          <Field label="Ghi chú">
            <textarea
              id="xuat-ghichu"
              className={inputCls + " resize-none h-20"}
              placeholder="Tùy chọn"
              value={form.ghiChu}
              onChange={(e) => set("ghiChu", e.target.value)}
            />
          </Field>
        </div>

        <DialogFooter className="gap-2">
          <button
            id="xuat-huy"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            id="xuat-xacnhan"
            disabled={!valid}
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Xác nhận xuất kho
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white";
