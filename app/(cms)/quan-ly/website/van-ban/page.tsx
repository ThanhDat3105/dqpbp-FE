"use client";

import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import DataTable from "@/components/website/DataTable";
import type { WebsiteDocument } from "@/lib/mock/website";
import { websiteAPI } from "@/services/api/website";
import {
  CATEGORY_TO_SLUG,
  DOCUMENT_CATEGORIES,
  PAGE_SIZE,
  toDateInputValue,
  type DocumentForm,
} from "./document-constants";
import { DocumentDeleteModal } from "./document-delete-modal";
import { DocumentFormModal } from "./document-form-modal";
import AppPagination from "@/components/ui/AppPagination";
import { buildDocumentColumns } from "./document-table-columns";

export default function VanBanCmsPage() {
  const [data, setData] = useState<WebsiteDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WebsiteDocument | null>(null);
  const [form, setForm] = useState<DocumentForm>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<WebsiteDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadDocuments = useCallback(
    async (p: number, kw: string, cat: string, st: string) => {
      try {
        setLoading(true);
        const res = await websiteAPI.getAdminDocuments({
          page: p,
          limit: PAGE_SIZE,
          keyword: kw || undefined,
          category: cat || undefined,
          status: st || undefined,
        } as Parameters<typeof websiteAPI.getAdminDocuments>[0]);
        setData(res.data);
        setTotal(res.total);
      } catch (err) {
        console.error("Failed to load documents", err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadDocuments(page, keyword, filterCategory, filterStatus);
  }, [loadDocuments, page, keyword, filterCategory, filterStatus]);

  const handleKeywordChange = (value: string) => {
    if (searchRef.current) clearTimeout(searchRef.current);
    searchRef.current = setTimeout(() => {
      setKeyword(value);
      setPage(1);
    }, 400);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      docNumber: "",
      issuedBy: "",
      issuedDate: "",
      category: "tsqs" as WebsiteDocument["category"],
      status: "active",
      order: total + 1,
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await websiteAPI.deleteDocument(deleteTarget.id);
      toast.success("Xóa văn bản thành công.");
      setDeleteTarget(null);
      const newPage = data.length === 1 && page > 1 ? page - 1 : page;
      setPage(newPage);
      if (newPage === page)
        loadDocuments(page, keyword, filterCategory, filterStatus);
    } catch {
      toast.error("Xóa thất bại, vui lòng thử lại.");
    } finally {
      setDeleting(false);
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
        await websiteAPI.createDocument({
          title: form.title,
          doc_number: form.docNumber,
          issued_by: form.issuedBy,
          issued_date: form.issuedDate,
          category: String(form.category ?? "tsqs"),
          file: form.file as File,
          status: form.status ?? "active",
          display_order: form.order ?? total + 1,
          is_visible: form.visible ?? true,
        });
        loadDocuments(page, keyword, filterCategory, filterStatus);
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
      loadDocuments(page, keyword, filterCategory, filterStatus);
    }
  };

  const columns = buildDocumentColumns({
    onEdit: openEdit,
    onDelete: setDeleteTarget,
    onOrderBlur: handleOrderBlur,
  });

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

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề, số văn bản..."
            onChange={(e) => handleKeywordChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-[#546a2f]"
        >
          <option value="">Tất cả chuyên mục</option>
          {DOCUMENT_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-[#546a2f]"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hiệu lực</option>
          <option value="expired">Hết hiệu lực</option>
          <option value="new">Mới</option>
        </select>
        <span className="text-sm text-gray-400 ml-auto">{total} văn bản</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-[#546a2f] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <DataTable data={data} columns={columns} />
      )}

      <AppPagination
        page={page}
        limit={PAGE_SIZE}
        total={total}
        onPageChange={setPage}
      />

      <button
        type="button"
        onClick={openCreate}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#546a2f] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#3d5020] transition-colors"
        title="Thêm văn bản"
      >
        <Plus className="w-6 h-6" />
      </button>

      <DocumentDeleteModal
        target={deleteTarget}
        deleting={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <DocumentFormModal
        open={modalOpen}
        editing={editing}
        form={form}
        saving={saving}
        onChange={setForm}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
