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
const CATEGORIES = ["Cứu hộ", "Liên lạc", "Quân trang", "Công cụ", "Y tế", "Khác"];

const EMPTY = {
  tenVatPham: "",
  danhMuc: "",
  soLuongNhap: "",
  nguongToiDa: "",
  ngayNhap: TODAY,
  nguoiNhap: "",
  nhaCungCap: "",
  ghiChu: "",
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DialogNhapKho({ open, onClose }: Props) {
  const [form, setForm] = useState(EMPTY);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = () => {
    console.log("Nhập kho:", form);
    toast.success("Đã nhập kho thành công");
    setForm(EMPTY);
    onClose();
  };

  const valid =
    form.tenVatPham && form.danhMuc && form.soLuongNhap &&
    form.nguongToiDa && form.ngayNhap && form.nguoiNhap;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">➕ Nhập kho</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <Field label="Tên vật phẩm *">
            <input
              id="nhap-ten"
              className={inputCls}
              placeholder="VD: Áo phao cứu sinh"
              value={form.tenVatPham}
              onChange={(e) => set("tenVatPham", e.target.value)}
            />
          </Field>

          <Field label="Danh mục *">
            <select
              id="nhap-danhmuc"
              className={inputCls}
              value={form.danhMuc}
              onChange={(e) => set("danhMuc", e.target.value)}
            >
              <option value="">-- Chọn danh mục --</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Số lượng nhập *">
              <input
                id="nhap-soluong"
                type="number" min={1} className={inputCls}
                placeholder="0"
                value={form.soLuongNhap}
                onChange={(e) => set("soLuongNhap", e.target.value)}
              />
            </Field>
            <Field label="Ngưỡng tối đa *">
              <input
                id="nhap-nguong"
                type="number" min={1} className={inputCls}
                placeholder="0"
                value={form.nguongToiDa}
                onChange={(e) => set("nguongToiDa", e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày nhập *">
              <input
                id="nhap-ngay"
                type="date" className={inputCls}
                value={form.ngayNhap}
                onChange={(e) => set("ngayNhap", e.target.value)}
              />
            </Field>
            <Field label="Người nhập *">
              <input
                id="nhap-nguoi"
                className={inputCls}
                placeholder="Họ tên người thực hiện"
                value={form.nguoiNhap}
                onChange={(e) => set("nguoiNhap", e.target.value)}
              />
            </Field>
          </div>

          <Field label="Nhà cung cấp">
            <input
              id="nhap-ncc"
              className={inputCls}
              placeholder="Tùy chọn"
              value={form.nhaCungCap}
              onChange={(e) => set("nhaCungCap", e.target.value)}
            />
          </Field>

          <Field label="Ghi chú">
            <textarea
              id="nhap-ghichu"
              className={inputCls + " resize-none h-20"}
              placeholder="Tùy chọn"
              value={form.ghiChu}
              onChange={(e) => set("ghiChu", e.target.value)}
            />
          </Field>
        </div>

        <DialogFooter className="gap-2">
          <button
            id="nhap-huy"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            id="nhap-xacnhan"
            disabled={!valid}
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Xác nhận nhập kho
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
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white";
