"use client";

import {
  CheckCircle,
  ExternalLink,
  File,
  FileText,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DataTable, { type Column } from "@/components/website/DataTable";
import type { WebsiteDocument } from "@/lib/mock/website";
import { websiteAPI } from "@/services/api/website";

const DOCUMENT_CATEGORIES = [
  { value: "tsqs", label: "Tuyển sinh quân sự" },
  { value: "tuoi17", label: "Tuổi 17" },
  { value: "tinhnguyen", label: "Tình nguyện" },
  { value: "dqtt", label: "Dân quân tự vệ" },
  { value: "doituongchinhsach", label: "Đối tượng chính sách" },
  { value: "siquandubi", label: "Sĩ quan dự bị" },
] as const;

const CATEGORY_TO_SLUG: Record<string, string> = Object.fromEntries(
  DOCUMENT_CATEGORIES.map((category) => [category.label, category.value]),
);

const categoryBadge: Record<string, string> = {
  "Tuyển sinh quân sự": "bg-green-100 text-green-700",
  "Tuổi 17": "bg-blue-100 text-blue-700",
  "Tình nguyện": "bg-yellow-100 text-yellow-700",
  "Dân quân tự vệ": "bg-emerald-100 text-emerald-700",
  tsqs: "bg-green-100 text-green-700",
  tuoi17: "bg-blue-100 text-blue-700",
  tinhnguyen: "bg-yellow-100 text-yellow-700",
  dqtt: "bg-emerald-100 text-emerald-700",
};

const statusConfig = {
  active: { label: "Hiệu lực", color: "text-green-600" },
  expired: { label: "Hết hiệu lực", color: "text-red-500" },
  new: { label: "Mới", color: "text-blue-600" },
};

type DocumentForm = Partial<WebsiteDocument> & {
  file?: File | null;
};

const toDateInputValue = (value?: string) => {
  if (!value) return "";
  const parts = value.split("/");
  if (parts.length !== 3) return value;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

export default function VanBanCmsPage() {
  const [data, setData] = useState<WebsiteDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WebsiteDocument | null>(null);
  const [form, setForm] = useState<DocumentForm>({});
  const [saving, setSaving] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteAPI.getAdminDocuments();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      docNumber: "",
      issuedBy: "",
      issuedDate: "",
      category: "tsqs" as WebsiteDocument["category"],
      status: "active",
      order: data.length + 1,
      visible: true,
      file: null,
    });
    setModalOpen(true);
  };

  const openEdit = (row: WebsiteDocument) => {
    setEditing(row);
    setForm({
      ...row,
      category: (CATEGORY_TO_SLUG[row.category] ??
        row.category) as WebsiteDocument["category"],
      issuedDate: toDateInputValue(row.issuedDate),
      file: null,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xác nhận xóa văn bản này?")) return;
    try {
      await websiteAPI.deleteDocument(id);
      setData((prev) => prev.filter((d) => d.id !== id));
      toast.success("Xóa văn bản thành công.");
    } catch {
      toast.error("Xóa thất bại, vui lòng thử lại.");
    }
  };

  const handleSave = async () => {
    if (!form.title?.trim()) {
      toast.error("Vui lòng nhập tiêu đề văn bản.");
      return;
    }

    if (!editing && !form.file) {
      toast.error("Vui lòng chọn file trước khi lưu.");
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        const updated = await websiteAPI.updateDocument(editing.id, {
          title: form.title,
          doc_number: form.docNumber,
          issued_by: form.issuedBy,
          issued_date: form.issuedDate,
          category: form.category,
          status: form.status,
          display_order: form.order ?? editing.order,
          is_visible: form.visible ?? editing.visible,
          file: form.file || undefined,
        });
        setData((prev) => prev.map((d) => (d.id === editing.id ? updated : d)));
      } else {
        const created = await websiteAPI.createDocument({
          title: form.title,
          doc_number: form.docNumber,
          issued_by: form.issuedBy,
          issued_date: form.issuedDate,
          category: String(form.category ?? "tsqs"),
          file: form.file as File,
          status: form.status ?? "active",
          display_order: form.order ?? data.length + 1,
          is_visible: form.visible ?? true,
        });
        setData((prev) => [...prev, created]);
      }
      setModalOpen(false);
      toast.success(
        editing ? "Cập nhật văn bản thành công." : "Thêm văn bản thành công.",
      );
    } catch {
      toast.error("Lưu thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleOrderBlur = async (id: number, order: number) => {
    try {
      await websiteAPI.updateDocument(id, { display_order: order });
      toast.success("Cập nhật thứ tự thành công.");
    } catch {
      toast.error("Cập nhật thứ tự thất bại.");
      await loadDocuments();
    }
  };

  const columns: Column<WebsiteDocument>[] = [
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
            categoryBadge[row.category] ?? "bg-gray-100 text-gray-600"
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
          value={row.order}
          onChange={(e) =>
            setData((prev) =>
              prev.map((d) =>
                d.id === row.id ? { ...d, order: Number(e.target.value) } : d,
              ),
            )
          }
          onBlur={(e) => handleOrderBlur(row.id, Number(e.target.value))}
          className="w-14 border border-gray-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-[#546a2f]"
        />
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (row) => {
        const s = statusConfig[row.status];
        return (
          <div
            className={`flex items-center gap-1.5 text-sm font-medium ${s.color}`}
          >
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
            onClick={() => openEdit(row)}
            className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors"
            title="Chỉnh sửa"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleDelete(row.id)}
            className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[#546a2f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Quản Lý Văn Bản
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Quản lý các văn bản trên website
        </p>
      </div>

      <DataTable data={data} columns={columns} />

      <button
        type="button"
        onClick={openCreate}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#546a2f] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#3d5020] transition-colors"
        title="Thêm văn bản"
      >
        <Plus className="w-6 h-6" />
      </button>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 text-left">
            <DialogTitle className="font-bold text-gray-800 dark:text-white">
              {editing ? "Chỉnh sửa văn bản" : "Thêm văn bản mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label
                htmlFor="document-title"
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block"
              >
                Tiêu đề văn bản <span className="text-red-500">*</span>
              </label>
              <input
                id="document-title"
                type="text"
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Nhập tên văn bản..."
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label
                htmlFor="document-file"
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block"
              >
                File đính kèm <span className="text-red-500">*</span>
              </label>
              <label
                htmlFor="document-file"
                className="flex items-center gap-3 w-full text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-3 py-3 cursor-pointer hover:border-[#546a2f] dark:bg-gray-800 dark:text-white transition-colors"
              >
                <Upload className="w-5 h-5 text-[#546a2f]" />
                <span className="min-w-0 flex-1 truncate">
                  {form.file?.name ?? "Chọn file PDF, Word hoặc Excel"}
                </span>
                <input
                  id="document-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  className="hidden"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      file: e.target.files?.[0] ?? null,
                    })
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
                <label
                  htmlFor="document-number"
                  className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block"
                >
                  Số văn bản
                </label>
                <input
                  id="document-number"
                  type="text"
                  value={form.docNumber ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, docNumber: e.target.value })
                  }
                  placeholder="VD: KH-01/2025"
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div>
                <label
                  htmlFor="document-issued-date"
                  className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block"
                >
                  Ngày ban hành
                </label>
                <input
                  id="document-issued-date"
                  type="date"
                  value={form.issuedDate ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, issuedDate: e.target.value })
                  }
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="document-issued-by"
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block"
              >
                Cơ quan ban hành
              </label>
              <input
                id="document-issued-by"
                type="text"
                value={form.issuedBy ?? ""}
                onChange={(e) => setForm({ ...form, issuedBy: e.target.value })}
                placeholder="VD: Ban CHQS Phuong Binh Phu"
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="document-category"
                  className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block"
                >
                  Chuyên mục
                </label>
                <select
                  id="document-category"
                  value={String(form.category ?? "tsqs")}
                  onChange={(e) => {
                    setForm({
                      ...form,
                      category: e.target.value as WebsiteDocument["category"],
                    });
                  }}
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-[#546a2f]"
                >
                  {DOCUMENT_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="document-order"
                  className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block"
                >
                  Thứ tự
                </label>
                <input
                  id="document-order"
                  type="number"
                  value={form.order ?? 0}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) })
                  }
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm font-semibold bg-[#546a2f] text-white rounded-lg hover:bg-[#3d5020] transition-colors disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
