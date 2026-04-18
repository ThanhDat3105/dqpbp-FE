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
import clsx from "clsx";

const TODAY = new Date().toISOString().split("T")[0];

const REPORT_TYPES = [
  {
    id: "ton-kho",
    icon: "📦",
    name: "Báo cáo tồn kho",
    desc: "Danh sách tất cả vật phẩm, số lượng, trạng thái",
  },
  {
    id: "xuat-nhap",
    icon: "🔄",
    name: "Báo cáo xuất/nhập",
    desc: "Lịch sử giao dịch theo khoảng thời gian",
  },
  {
    id: "canh-bao",
    icon: "⚠️",
    name: "Báo cáo cảnh báo",
    desc: "Danh sách vật phẩm dưới ngưỡng an toàn",
  },
];

const FORMATS = ["PDF", "Excel", "CSV"];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function DialogBaoCao({ open, onClose }: Props) {
  const [selectedType, setSelectedType] = useState("");
  const [fromDate, setFromDate] = useState(TODAY);
  const [toDate, setToDate] = useState(TODAY);
  const [format, setFormat] = useState("PDF");

  const handleClose = () => {
    setSelectedType("");
    setFromDate(TODAY);
    setToDate(TODAY);
    setFormat("PDF");
    onClose();
  };

  const handleSubmit = () => {
    console.log("Báo cáo:", {
      type: selectedType,
      dateRange: { from: fromDate, to: toDate },
      format,
    });
    toast.success("Đang xuất báo cáo... (mock)");
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">📊 Xuất báo cáo</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2">
          {/* Report type cards */}
          <div>
            <p className="text-xs font-semibold text-gray-600 mb-2">
              Loại báo cáo *
            </p>
            <div className="flex flex-col gap-2">
              {REPORT_TYPES.map((rt) => (
                <button
                  key={rt.id}
                  id={`bao-cao-type-${rt.id}`}
                  onClick={() => setSelectedType(rt.id)}
                  className={clsx(
                    "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-150 cursor-pointer",
                    selectedType === rt.id
                      ? "border-violet-500 bg-violet-50"
                      : "border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/50",
                  )}
                >
                  <span className="text-2xl shrink-0">{rt.icon}</span>
                  <div>
                    <p
                      className={clsx(
                        "text-sm font-bold",
                        selectedType === rt.id
                          ? "text-violet-700"
                          : "text-gray-800",
                      )}
                    >
                      {rt.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{rt.desc}</p>
                  </div>
                  <span
                    className={clsx(
                      "ml-auto shrink-0 w-4 h-4 rounded-full border-2 mt-0.5 transition-colors",
                      selectedType === rt.id
                        ? "border-violet-500 bg-violet-500"
                        : "border-gray-300",
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Từ ngày">
              <input
                id="bao-cao-from"
                type="date"
                className={inputCls}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Field>
            <Field label="Đến ngày">
              <input
                id="bao-cao-to"
                type="date"
                className={inputCls}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Field>
          </div>

          {/* Format */}
          <Field label="Định dạng xuất">
            <div className="flex gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  id={`bao-cao-format-${f}`}
                  onClick={() => setFormat(f)}
                  className={clsx(
                    "flex-1 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer",
                    format === f
                      ? "border-violet-500 bg-violet-500 text-white"
                      : "border-gray-200 text-gray-600 hover:border-violet-300",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <DialogFooter className="gap-2">
          <button
            id="bao-cao-huy"
            onClick={handleClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
          >
            Hủy
          </button>
          <button
            id="bao-cao-xuat"
            disabled={!selectedType}
            onClick={handleSubmit}
            className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            Xuất báo cáo
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
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white";
