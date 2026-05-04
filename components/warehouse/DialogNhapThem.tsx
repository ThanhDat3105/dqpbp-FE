"use client";

import { useState, useEffect } from "react";
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
  item: StockItem | null;
}

export default function DialogNhapThem({ open, onClose, item }: Props) {
  const [soLuong, setSoLuong] = useState("");
  const [ngayNhap, setNgayNhap] = useState(TODAY);
  const [nguoiNhap, setNguoiNhap] = useState("");
  const [ghiChu, setGhiChu] = useState("");

  // Reset form when item changes
  useEffect(() => {
    setSoLuong("");
    setNgayNhap(TODAY);
    setNguoiNhap("");
    setGhiChu("");
  }, [item]);

  const handleClose = () => {
    setSoLuong("");
    setNgayNhap(TODAY);
    setNguoiNhap("");
    setGhiChu("");
    onClose();
  };

  const valid = soLuong && ngayNhap && nguoiNhap;

  const handleSubmit = () => {
    console.log("Nhập thêm:", {
      item,
      soLuongNhapThem: soLuong,
      ngayNhap,
      nguoiNhap,
      ghiChu,
    });
    toast.success(`Đã cập nhật tồn kho cho ${item?.name}`);
    handleClose();
  };

  if (!item) return null;

  const pct = Math.round((item.current / item.max) * 100);
  const barColor =
    pct <= 10
      ? "bg-red-500"
      : pct <= 25
        ? "bg-orange-500"
        : pct <= 40
          ? "bg-yellow-500"
          : "bg-green-500";

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) handleClose();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            📦 Nhập thêm hàng
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Read-only info */}
          <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-gray-500 font-medium">Vật phẩm</p>
                <p className="font-bold text-gray-900 text-sm mt-0.5">
                  {item.name}
                </p>
              </div>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-semibold shrink-0">
                {item.category}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium mb-1.5">
                Tồn kho hiện tại:{" "}
                <span className="font-bold text-gray-800">
                  {item.current} / {item.max}
                </span>
              </p>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">{pct}% còn lại</p>
            </div>
          </div>

          {/* Editable fields */}
          <Field label="Số lượng nhập thêm *">
            <input
              id="nhap-them-soluong"
              type="number"
              min={1}
              className={inputCls}
              placeholder="0"
              value={soLuong}
              onChange={(e) => setSoLuong(e.target.value)}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày nhập *">
              <input
                id="nhap-them-ngay"
                type="date"
                className={inputCls}
                value={ngayNhap}
                onChange={(e) => setNgayNhap(e.target.value)}
              />
            </Field>
            <Field label="Người nhập *">
              <input
                id="nhap-them-nguoi"
                className={inputCls}
                placeholder="Họ tên"
                value={nguoiNhap}
                onChange={(e) => setNguoiNhap(e.target.value)}
              />
            </Field>
          </div>

          <Field label="Ghi chú">
            <textarea
              id="nhap-them-ghichu"
              className={inputCls + " resize-none h-16"}
              placeholder="Tùy chọn"
              value={ghiChu}
              onChange={(e) => setGhiChu(e.target.value)}
            />
          </Field>
        </div>

        <DialogFooter className="gap-2">
          <button
            id="nhap-them-huy"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            id="nhap-them-xacnhan"
            disabled={!valid}
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-[#556B2F] text-white text-sm font-semibold hover:bg-[#556b2f] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Nhập thêm
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6B8E23] bg-white";
