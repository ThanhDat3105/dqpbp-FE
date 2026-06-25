"use client";

import { X } from "lucide-react";
import { QuickLink } from "@/lib/mock/website";

function CustomCheckbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
        checked
          ? "bg-[#546a2f] border-[#546a2f]"
          : "border-gray-300 hover:border-[#546a2f]"
      }`}
    >
      {checked && (
        <svg
          viewBox="0 0 12 10"
          className="w-3 h-3 text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="1,5 4,9 11,1" />
        </svg>
      )}
    </div>
  );
}

interface Props {
  editing: QuickLink | null;
  form: Partial<QuickLink>;
  saving: boolean;
  onChange: (patch: Partial<QuickLink>) => void;
  onSave: () => void;
  onClose: () => void;
}

export default function QuickLinkModal({
  editing,
  form,
  saving,
  onChange,
  onSave,
  onClose,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-gray-800 dark:text-white">
            {editing ? "Chỉnh Sửa Liên Kết" : "Thêm Liên Kết Mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title ?? ""}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="Nhập tiêu đề..."
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
              URL
            </label>
            <input
              type="text"
              value={form.url ?? ""}
              onChange={(e) => onChange({ url: e.target.value })}
              placeholder="https://..."
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                Thứ tự
              </label>
              <input
                type="number"
                value={form.order ?? 1}
                onChange={(e) => onChange({ order: Number(e.target.value) })}
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Hiển thị
              </label>
              <CustomCheckbox
                checked={form.visible ?? true}
                onChange={(v) => onChange({ visible: v })}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onSave}
            disabled={saving || !form.title?.trim()}
            className="px-5 py-2 text-sm font-semibold bg-[#546a2f] text-white rounded-lg hover:bg-[#3d5020] transition-colors disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
