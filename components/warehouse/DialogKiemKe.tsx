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
  current: number;
}

interface KiemKeRow {
  id: number;
  system: number;
  actual: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  inventory: StockItem[];
}

export default function DialogKiemKe({ open, onClose, inventory }: Props) {
  const [rows, setRows] = useState<KiemKeRow[]>(
    inventory.map((i) => ({ id: i.id, system: i.current, actual: "" })),
  );
  const [nguoiKiem, setNguoiKiem] = useState("");
  const [ngayKiem, setNgayKiem] = useState(TODAY);

  const updateActual = (id: number, val: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, actual: val } : r)),
    );
  };

  const hasAnyInput = rows.some((r) => r.actual !== "");
  const valid = hasAnyInput && nguoiKiem && ngayKiem;

  const handleClose = () => {
    setRows(inventory.map((i) => ({ id: i.id, system: i.current, actual: "" })));
    setNguoiKiem("");
    setNgayKiem(TODAY);
    onClose();
  };

  const handleSubmit = () => {
    const payload = rows.map((r) => ({
      id: r.id,
      systemQty: r.system,
      actualQty: r.actual === "" ? null : Number(r.actual),
      diff: r.actual === "" ? null : Number(r.actual) - r.system,
    }));
    console.log("Kiểm kê:", { rows: payload, nguoiKiem, ngayKiem });
    toast.success("Đã lưu kết quả kiểm kê");
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">📋 Kiểm kê kho</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Info fields */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Người kiểm kê *">
              <input
                id="kiem-ke-nguoi"
                className={inputCls}
                placeholder="Họ tên"
                value={nguoiKiem}
                onChange={(e) => setNguoiKiem(e.target.value)}
              />
            </Field>
            <Field label="Ngày kiểm kê *">
              <input
                id="kiem-ke-ngay"
                type="date"
                className={inputCls}
                value={ngayKiem}
                onChange={(e) => setNgayKiem(e.target.value)}
              />
            </Field>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tên vật phẩm
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Tồn hệ thống
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">
                    Thực tế kiểm đếm
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Chênh lệch
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const item = inventory.find((i) => i.id === row.id)!;
                  const diff =
                    row.actual !== "" ? Number(row.actual) - row.system : null;
                  return (
                    <tr
                      key={row.id}
                      className={idx % 2 === 0 ? "bg-white" : "bg-gray-50/50"}
                    >
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-600 font-medium">
                        {row.system}
                      </td>
                      <td className="px-4 py-3">
                        <input
                          id={`kiem-ke-actual-${row.id}`}
                          type="number"
                          min={0}
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-center text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
                          placeholder="–"
                          value={row.actual}
                          onChange={(e) => updateActual(row.id, e.target.value)}
                        />
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-sm">
                        {diff === null ? (
                          <span className="text-gray-300">–</span>
                        ) : diff > 0 ? (
                          <span className="text-green-600">+{diff}</span>
                        ) : diff < 0 ? (
                          <span className="text-red-600">{diff}</span>
                        ) : (
                          <span className="text-gray-500">0</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            id="kiem-ke-huy"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            id="kiem-ke-luu"
            disabled={!valid}
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Lưu kết quả kiểm kê
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
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white";
