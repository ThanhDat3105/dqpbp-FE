import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import type { Column } from "@/components/website/DataTable";
import type { NewsArticle } from "@/lib/mock/website";
import { CustomCheckbox } from "./article-checkbox";

interface ColumnDeps {
  onEdit: (row: NewsArticle) => void;
  onDelete: (row: NewsArticle) => void;
  onOrderBlur: (id: number, order: number) => void;
  onToggleField: (id: number, field: "featured" | "visible") => void;
}

export function buildArticleColumns({
  onEdit,
  onDelete,
  onOrderBlur,
  onToggleField,
}: ColumnDeps): Column<NewsArticle>[] {
  return [
    {
      key: "id",
      label: "Id",
      width: "w-12",
      render: (row) => <span className="text-gray-400 text-xs">{row.id}</span>,
    },
    {
      key: "title",
      label: "Bài viết",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-[#546a2f]/10 rounded flex items-center justify-center shrink-0 text-[#546a2f]/30 relative overflow-hidden">
            {row.thumbnail ? (
              <Image src={row.thumbnail} alt={row.title} fill className="object-cover" />
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z" />
              </svg>
            )}
          </div>
          <div className="max-w-sm">
            <p className="font-medium text-gray-800 text-sm leading-snug line-clamp-2">
              {row.title}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{row.updatedAt}</p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Chuyên mục",
      render: (row) => (
        <span className="text-xs bg-[#546a2f]/10 text-[#546a2f] px-2 py-0.5 rounded-full font-medium">
          {row.category}
        </span>
      ),
    },
    {
      key: "order",
      label: "Thứ tự",
      width: "w-20",
      render: (row) => (
        <input
          type="number"
          defaultValue={row.order}
          onBlur={(e) => onOrderBlur(row.id, Number(e.target.value))}
          className="w-14 border border-gray-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-[#546a2f]"
        />
      ),
    },
    {
      key: "featured",
      label: "Nổi bật",
      width: "w-20",
      render: (row) => (
        <CustomCheckbox
          checked={row.featured}
          onChange={() => onToggleField(row.id, "featured")}
        />
      ),
    },
    {
      key: "visible",
      label: "Hiển thị",
      width: "w-20",
      render: (row) => (
        <CustomCheckbox
          checked={row.visible}
          onChange={() => onToggleField(row.id, "visible")}
        />
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      width: "w-28",
      render: (row) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors"
            title="Sửa"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(row)}
            className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];
}
