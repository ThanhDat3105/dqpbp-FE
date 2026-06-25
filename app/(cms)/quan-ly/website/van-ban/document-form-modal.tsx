import { ExternalLink, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WebsiteDocument } from "@/lib/mock/website";
import { DOCUMENT_CATEGORIES } from "./document-constants";
import type { DocumentForm } from "./document-constants";

interface Props {
  open: boolean;
  editing: WebsiteDocument | null;
  form: DocumentForm;
  saving: boolean;
  onChange: (form: DocumentForm) => void;
  onSave: () => void;
  onClose: () => void;
}

export function DocumentFormModal({
  open,
  editing,
  form,
  saving,
  onChange,
  onSave,
  onClose,
}: Props) {
  const inputCls =
    "w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white";
  const labelCls =
    "text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block";

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 text-left">
          <DialogTitle className="font-bold text-gray-800 dark:text-white">
            {editing ? "Chỉnh sửa văn bản" : "Thêm văn bản mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label htmlFor="doc-title" className={labelCls}>
              Tiêu đề văn bản <span className="text-red-500">*</span>
            </label>
            <input
              id="doc-title"
              type="text"
              value={form.title ?? ""}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
              placeholder="Nhập tên văn bản..."
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="doc-file" className={labelCls}>
              File đính kèm{" "}
              {!editing && <span className="text-red-500">*</span>}
            </label>
            <label
              htmlFor="doc-file"
              className="flex items-center gap-3 w-full text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-3 py-3 cursor-pointer hover:border-[#546a2f] dark:bg-gray-800 dark:text-white transition-colors"
            >
              <Upload className="w-5 h-5 text-[#546a2f]" />
              <span className="min-w-0 flex-1 truncate">
                {form.file?.name ??
                  (editing
                    ? "Chọn file mới để thay thế file hiện tại"
                    : "Chọn file PDF, Word hoặc Excel")}
              </span>
              <input
                id="doc-file"
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                className="hidden"
                onChange={(e) =>
                  onChange({ ...form, file: e.target.files?.[0] ?? null })
                }
              />
            </label>
          </div>

          {editing?.file_url && (
            <a
              href={editing.file_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="w-4 h-4" />
              Xem file hiện tại
            </a>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="doc-number" className={labelCls}>
                Số văn bản
              </label>
              <input
                id="doc-number"
                type="text"
                value={form.docNumber ?? ""}
                onChange={(e) => onChange({ ...form, docNumber: e.target.value })}
                placeholder="VD: KH-01/2025"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="doc-issued-date" className={labelCls}>
                Ngày ban hành
              </label>
              <input
                id="doc-issued-date"
                type="date"
                value={form.issuedDate ?? ""}
                onChange={(e) => onChange({ ...form, issuedDate: e.target.value })}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label htmlFor="doc-issued-by" className={labelCls}>
              Cơ quan ban hành
            </label>
            <input
              id="doc-issued-by"
              type="text"
              value={form.issuedBy ?? ""}
              onChange={(e) => onChange({ ...form, issuedBy: e.target.value })}
              placeholder="VD: Ban CHQS Phuong Binh Phu"
              className={inputCls}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="doc-category" className={labelCls}>
                Chuyên mục
              </label>
              <select
                id="doc-category"
                value={String(form.category ?? "tsqs")}
                onChange={(e) =>
                  onChange({
                    ...form,
                    category: e.target.value as WebsiteDocument["category"],
                  })
                }
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-[#546a2f]"
              >
                {DOCUMENT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="doc-status" className={labelCls}>
                Trạng thái
              </label>
              <select
                id="doc-status"
                value={form.status ?? "active"}
                onChange={(e) =>
                  onChange({
                    ...form,
                    status: e.target.value as WebsiteDocument["status"],
                  })
                }
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-[#546a2f]"
              >
                <option value="active">Hiệu lực</option>
                <option value="new">Mới</option>
                <option value="expired">Hết hiệu lực</option>
              </select>
            </div>
            <div>
              <label htmlFor="doc-order" className={labelCls}>
                Thứ tự
              </label>
              <input
                id="doc-order"
                type="number"
                value={form.order ?? 0}
                onChange={(e) =>
                  onChange({ ...form, order: Number(e.target.value) })
                }
                className={inputCls}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold bg-[#546a2f] text-white rounded-lg hover:bg-[#3d5020] transition-colors disabled:opacity-50"
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
