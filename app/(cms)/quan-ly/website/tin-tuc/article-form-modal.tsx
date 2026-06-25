import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NewsArticle } from "@/lib/mock/website";
import { CATEGORIES } from "./article-constants";
import { CustomCheckbox } from "./article-checkbox";

type ArticleForm = Partial<NewsArticle> & { thumbnailFile?: File | null };

interface Props {
  open: boolean;
  editing: NewsArticle | null;
  form: ArticleForm;
  saving: boolean;
  onChange: (form: ArticleForm) => void;
  onSave: () => void;
  onClose: () => void;
}

export function ArticleFormModal({
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
            {editing ? "Chỉnh Sửa Bài Viết" : "Thêm Bài Viết Mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className={labelCls}>
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.title ?? ""}
              onChange={(e) => onChange({ ...form, title: e.target.value })}
              placeholder="Nhập tiêu đề bài viết..."
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Chuyên mục</label>
            <select
              value={form.category ?? ""}
              onChange={(e) => onChange({ ...form, category: e.target.value })}
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-[#546a2f]"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Nội dung</label>
            <textarea
              rows={4}
              value={form.content ?? ""}
              onChange={(e) => onChange({ ...form, content: e.target.value })}
              placeholder="Nhập nội dung..."
              className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] resize-none dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className={labelCls}>
              Ảnh đại diện{" "}
              {!editing && <span className="text-red-500">*</span>}
            </label>
            <label
              htmlFor="article-thumbnail"
              className="flex items-center gap-3 w-full text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-3 py-3 cursor-pointer hover:border-[#546a2f] dark:bg-gray-800 dark:text-white transition-colors"
            >
              <Upload className="w-5 h-5 text-[#546a2f]" />
              <span className="min-w-0 flex-1 truncate">
                {form.thumbnailFile?.name ??
                  (editing
                    ? "Chọn ảnh mới để thay thế ảnh hiện tại"
                    : "Chọn ảnh JPG, PNG, GIF hoặc WEBP")}
              </span>
              <input
                id="article-thumbnail"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={(e) =>
                  onChange({ ...form, thumbnailFile: e.target.files?.[0] ?? null })
                }
              />
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Thứ tự</label>
              <input
                type="number"
                value={form.order ?? 1}
                onChange={(e) =>
                  onChange({ ...form, order: Number(e.target.value) })
                }
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Nổi bật
              </label>
              <CustomCheckbox
                checked={form.featured ?? false}
                onChange={(v) => onChange({ ...form, featured: v })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Hiển thị
              </label>
              <CustomCheckbox
                checked={form.visible ?? true}
                onChange={(v) => onChange({ ...form, visible: v })}
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
