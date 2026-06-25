import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NewsArticle } from "@/lib/mock/website";

interface Props {
  target: NewsArticle | null;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ArticleDeleteModal({ target, deleting, onConfirm, onClose }: Props) {
  return (
    <Dialog open={!!target} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-sm p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 text-left">
          <DialogTitle className="font-bold text-gray-800 dark:text-white">
            Xác nhận xóa
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Bạn có chắc muốn xóa bài viết này?
              </p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2">
                {target?.title}
              </p>
              <p className="text-xs text-red-500 mt-2">
                Hành động này không thể hoàn tác.
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleting}
            className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="px-5 py-2 text-sm font-semibold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {deleting && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {deleting ? "Đang xóa..." : "Xóa"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
