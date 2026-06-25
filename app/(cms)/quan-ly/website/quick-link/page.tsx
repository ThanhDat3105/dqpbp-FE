"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import DataTable from "@/components/website/DataTable";
import { QuickLink } from "@/lib/mock/website";
import { websiteAPI } from "@/services/api/website";
import QuickLinkModal from "./quick-link-modal";
import { buildQuickLinkColumns } from "./quick-link-columns";

export default function QuickLinkCmsPage() {
  const [data, setData] = useState<QuickLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<QuickLink | null>(null);
  const [form, setForm] = useState<Partial<QuickLink>>({});
  const [saving, setSaving] = useState(false);

  const loadLinks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteAPI.getAdminQuickLinks();
      setData(res.data);
    } catch (err) {
      console.error("Failed to load quick links", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLinks();
  }, [loadLinks]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      url: "",
      order: data.length + 1,
      visible: true,
    });
    setModalOpen(true);
  };

  const openEdit = (row: QuickLink) => {
    setEditing(row);
    setForm({ ...row });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Xác nhận xóa liên kết này?")) return;
    try {
      await websiteAPI.deleteQuickLink(id);
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert("Xóa thất bại, vui lòng thử lại.");
    }
  };

  const handleSave = async () => {
    if (!form.title?.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await websiteAPI.updateQuickLink(editing.id, {
          title: form.title,
          url: form.url || undefined,
          display_order: form.order ?? editing.order,
          is_visible: form.visible ?? editing.visible,
        });
        setData((prev) => prev.map((d) => (d.id === editing.id ? updated : d)));
      } else {
        const created = await websiteAPI.createQuickLink({
          title: form.title!,
          url: form.url || "",
          display_order: form.order ?? data.length + 1,
          is_visible: form.visible ?? true,
        });
        setData((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch {
      alert("Lưu thất bại, vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleOrderBlur = async (id: number, order: number) => {
    try {
      await websiteAPI.updateQuickLink(id, { display_order: order });
    } catch {
      await loadLinks();
    }
  };

  const toggleVisible = async (id: number) => {
    const row = data.find((d) => d.id === id);
    if (!row) return;
    setData((prev) =>
      prev.map((d) => (d.id === id ? { ...d, visible: !d.visible } : d)),
    );
    try {
      await websiteAPI.updateQuickLink(id, { is_visible: !row.visible });
    } catch {
      setData((prev) => prev.map((d) => (d.id === id ? row : d)));
    }
  };

  const columns = buildQuickLinkColumns({
    setData,
    onEdit: openEdit,
    onDelete: handleDelete,
    onOrderBlur: handleOrderBlur,
    onToggleVisible: toggleVisible,
  });

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
          Quản Lý Liên Kết Nhanh
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Quản lý các liên kết nhanh hiển thị trên trang chủ
        </p>
      </div>

      <DataTable data={data} columns={columns} />

      <button
        onClick={openCreate}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#546a2f] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#3d5020] transition-colors"
        title="Thêm liên kết"
      >
        <Plus className="w-6 h-6" />
      </button>

      {modalOpen && (
        <QuickLinkModal
          editing={editing}
          form={form}
          saving={saving}
          onChange={(patch) => setForm((prev) => ({ ...prev, ...patch }))}
          onSave={handleSave}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
