"use client";

import { Eye, Pencil, Plus, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import DataTable, { type Column } from "@/components/website/DataTable";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NewsArticle } from "@/lib/mock/website";
import { websiteAPI } from "@/services/api/website";

const CATEGORIES = ["Hoạt động", "Tin tức", "Thông báo", "Văn bản pháp quy"];

type ArticleForm = Partial<NewsArticle> & {
  thumbnailFile?: File | null;
};

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

export default function TinTucCmsPage() {
  const [data, setData] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState<ArticleForm>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NewsArticle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadArticles = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteAPI.getAdminArticles();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load articles", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      category: "Hoạt động",
      order: data.length + 1,
      featured: false,
      visible: true,
      excerpt: "",
      thumbnailFile: null,
    });
    setModalOpen(true);
  };

  const openEdit = (row: NewsArticle) => {
    setEditing(row);
    setForm({ ...row, thumbnailFile: null });
    setModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await websiteAPI.deleteArticle(deleteTarget.id);
      setData((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast.success("Xóa bài viết thành công");
      setDeleteTarget(null);
    } catch {
      toast.error("Xóa thất bại, vui lòng thử lại.");
    } finally {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    const title = form.title?.trim();
    if (!title) return;
    if (!editing && !form.thumbnailFile) {
      toast.error("Vui lòng chọn ảnh đại diện.");
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await websiteAPI.updateArticle(editing.id, {
          title: form.title,
          category: form.category,
          excerpt: form.title,
          thumbnail: form.thumbnailFile || undefined,
          display_order: form.order ?? editing.order,
          is_featured: form.featured ?? editing.featured,
          is_visible: form.visible ?? editing.visible,
          content: form.content ?? editing.content,
        });
        setData((prev) => prev.map((d) => (d.id === editing.id ? updated : d)));
        toast.success("Cập nhật bài viết thành công");
      } else {
        const created = await websiteAPI.createArticle({
          title,
          category: form.category ?? "Hoạt động",
          excerpt: form.title,
          thumbnail: form.thumbnailFile as File,
          display_order: form.order ?? data.length + 1,
          is_featured: form.featured ?? false,
          is_visible: form.visible ?? true,
          content: form.content ?? "",
        });
        setData((prev) => [...prev, created]);
        toast.success("Thêm bài viết thành công");
      }
      setModalOpen(false);
    } catch {
      toast.error("Lưu thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleOrderBlur = async (id: number, order: number) => {
    try {
      await websiteAPI.updateArticle(id, { display_order: order });
    } catch {
      await loadArticles();
    }
  };

  const toggleField = async (id: number, field: "featured" | "visible") => {
    const row = data.find((d) => d.id === id);
    if (!row) return;
    const newValue = !row[field];
    setData((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: newValue } : d)),
    );
    try {
      await websiteAPI.updateArticle(id, {
        ...(field === "featured"
          ? { is_featured: newValue }
          : { is_visible: newValue }),
      });
      const label = field === "featured" ? "Nổi bật" : "Hiển thị";
      const state = newValue ? "bật" : "tắt";
      toast.success(`${label} đã ${state}`);
    } catch {
      setData((prev) => prev.map((d) => (d.id === id ? row : d)));
      toast.error("Cập nhật thất bại, vui lòng thử lại.");
    }
  };

  const columns: Column<NewsArticle>[] = [
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
          <div className="w-14 h-14 bg-[#546a2f]/10 rounded flex items-center justify-center shrink-0 text-[#546a2f]/30 relative">
            {row.thumbnail ? (
              <Image
                src={row.thumbnail}
                alt={row.title}
                fill
                className="object-cover"
              />
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
      key: "featured",
      label: "Nổi bật",
      width: "w-20",
      render: (row) => (
        <CustomCheckbox
          checked={row.featured}
          onChange={() => toggleField(row.id, "featured")}
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
          onChange={() => toggleField(row.id, "visible")}
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
            onClick={() => openEdit(row)}
            className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors"
            title="Sửa"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Quản Lý Tin Tức
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Quản lý bài viết và thông báo trên website
          </p>
        </div>
      </div>

      {/* Table */}
      <DataTable data={data} columns={columns} />

      {/* FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#546a2f] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#3d5020] transition-colors"
        title="Thêm bài viết"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Delete Confirm Modal */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
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
                  {deleteTarget?.title}
                </p>
                <p className="text-xs text-red-500 mt-2">
                  Hành động này không thể hoàn tác.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
              className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              onClick={handleDelete}
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

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 text-left">
            <DialogTitle className="font-bold text-gray-800 dark:text-white">
              {editing ? "Chỉnh Sửa Bài Viết" : "Thêm Bài Viết Mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title ?? ""}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Nhập tiêu đề bài viết..."
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                Chuyên mục
              </label>
              <select
                value={form.category ?? ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-[#546a2f]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                Nội dung
              </label>
              <textarea
                rows={4}
                value={form.content ?? ""}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Nhập nội dung..."
                className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] resize-none dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                URL Ảnh đại diện
              </label>
              <label
                htmlFor="article-thumbnail"
                className="flex items-center gap-3 w-full text-sm border border-dashed border-gray-300 dark:border-gray-600 rounded-lg px-3 py-3 cursor-pointer hover:border-[#546a2f] dark:bg-gray-800 dark:text-white transition-colors"
              >
                <Upload className="w-5 h-5 text-[#546a2f]" />
                <span className="min-w-0 flex-1 truncate">
                  {form.thumbnailFile?.name ??
                    (editing
                      ? "Chon anh moi de thay the anh hien tai"
                      : "Chon anh JPG, PNG, GIF hoac WEBP")}
                </span>
                <input
                  id="article-thumbnail"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) =>
                    setForm({
                      ...form,
                      thumbnailFile: e.target.files?.[0] ?? null,
                    })
                  }
                />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Thứ tự
                </label>
                <input
                  type="number"
                  value={form.order ?? 1}
                  onChange={(e) =>
                    setForm({ ...form, order: Number(e.target.value) })
                  }
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Nổi bật
                </label>
                <CustomCheckbox
                  checked={form.featured ?? false}
                  onChange={(v) => setForm({ ...form, featured: v })}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Hiển thị
                </label>
                <CustomCheckbox
                  checked={form.visible ?? true}
                  onChange={(v) => setForm({ ...form, visible: v })}
                />
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-end gap-3">
            <button
              onClick={() => setModalOpen(false)}
              disabled={saving}
              className="px-5 py-2 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
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
