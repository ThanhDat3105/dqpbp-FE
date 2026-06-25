"use client";

import { Plus, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import AppPagination from "@/components/ui/AppPagination";
import DataTable from "@/components/website/DataTable";
import type { NewsArticle } from "@/lib/mock/website";
import { mapArticleAdmin, websiteAPI } from "@/services/api/website";
import { CATEGORIES, PAGE_SIZE } from "./article-constants";
import { ArticleDeleteModal } from "./article-delete-modal";
import { ArticleFormModal } from "./article-form-modal";
import { buildArticleColumns } from "./article-table-columns";

type ArticleForm = Partial<NewsArticle> & { thumbnailFile?: File | null };

export default function TinTucCmsPage() {
  const [data, setData] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NewsArticle | null>(null);
  const [form, setForm] = useState<ArticleForm>({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<NewsArticle | null>(null);
  const [deleting, setDeleting] = useState(false);

  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadArticles = useCallback(
    async (p: number, kw: string, cat: string) => {
      try {
        setLoading(true);
        const res = await websiteAPI.getAdminArticles({
          page: p,
          limit: PAGE_SIZE,
          keyword: kw || undefined,
          category: cat || undefined,
        });

        setData(res.data.map(mapArticleAdmin));
        setTotal(res.total);
      } catch (err) {
        console.error("Failed to load articles", err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadArticles(page, keyword, filterCategory);
  }, [loadArticles, page, keyword, filterCategory]);

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
      category: "Hoạt động",
      order: total + 1,
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
      toast.success("Xóa bài viết thành công");
      setDeleteTarget(null);
      const newPage = data.length === 1 && page > 1 ? page - 1 : page;
      setPage(newPage);
      if (newPage === page) loadArticles(page, keyword, filterCategory);
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
        await websiteAPI.createArticle({
          title,
          category: form.category ?? "Hoạt động",
          excerpt: form.title,
          thumbnail: form.thumbnailFile as File,
          display_order: form.order ?? total + 1,
          is_featured: form.featured ?? false,
          is_visible: form.visible ?? true,
          content: form.content ?? "",
        });
        loadArticles(page, keyword, filterCategory);
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
      loadArticles(page, keyword, filterCategory);
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
      toast.success(`${label} đã ${newValue ? "bật" : "tắt"}`);
    } catch {
      setData((prev) => prev.map((d) => (d.id === id ? row : d)));
      toast.error("Cập nhật thất bại, vui lòng thử lại.");
    }
  };

  const columns = buildArticleColumns({
    onEdit: openEdit,
    onDelete: setDeleteTarget,
    onOrderBlur: handleOrderBlur,
    onToggleField: toggleField,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Quản Lý Tin Tức
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Quản lý bài viết và thông báo trên website
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-50 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm tiêu đề..."
            onChange={(e) => handleKeywordChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setPage(1);
          }}
          className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-[#546a2f]"
        >
          <option value="">Tất cả chuyên mục</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <span className="text-sm text-gray-400 ml-auto">{total} bài viết</span>
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
        title="Thêm bài viết"
      >
        <Plus className="w-6 h-6" />
      </button>

      <ArticleDeleteModal
        target={deleteTarget}
        deleting={deleting}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
      />

      <ArticleFormModal
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
