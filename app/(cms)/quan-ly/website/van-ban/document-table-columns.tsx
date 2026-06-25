import {
  CheckCircle,
  ExternalLink,
  File,
  FileText,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Column } from "@/components/website/DataTable";
import type { WebsiteDocument } from "@/lib/mock/website";
import { CATEGORY_BADGE, STATUS_CONFIG } from "./document-constants";

interface ColumnDeps {
  onEdit: (row: WebsiteDocument) => void;
  onDelete: (row: WebsiteDocument) => void;
  onOrderBlur: (id: number, order: number) => void;
}

export function buildDocumentColumns({
  onEdit,
  onDelete,
  onOrderBlur,
}: ColumnDeps): Column<WebsiteDocument>[] {
  return [
    {
      key: "id",
      label: "Id",
      width: "w-12",
      render: (row) => <span className="text-gray-400 text-xs">{row.id}</span>,
    },
    {
      key: "title",
      label: "Văn bản",
      render: (row) => (
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-10 rounded flex items-center justify-center shrink-0 ${
              row.fileType === "PDF" ? "bg-red-50" : "bg-blue-50"
            }`}
          >
            {row.fileType === "PDF" ? (
              <FileText className="w-4 h-4 text-red-500" />
            ) : (
              <File className="w-4 h-4 text-blue-500" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm leading-snug line-clamp-2">
              {row.title}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {[row.docNumber, row.issuedDate, row.fileSize]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Chuyên mục",
      render: (row) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            CATEGORY_BADGE[row.category] ?? "bg-gray-100 text-gray-600"
          }`}
        >
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
      key: "status",
      label: "Trạng thái",
      render: (row) => {
        const s = STATUS_CONFIG[row.status] ?? STATUS_CONFIG.active;
        return (
          <div className={`flex items-center gap-1.5 text-sm font-medium ${s.color}`}>
            <CheckCircle className="w-4 h-4" />
            {s.label}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Thao tác",
      width: "w-28",
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.file_url && (
            <a
              href={row.file_url}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"
              title="Mở file"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors"
            title="Chỉnh sửa"
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
