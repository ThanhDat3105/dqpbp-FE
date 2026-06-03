'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, ZoomIn } from 'lucide-react';
import DataTable, { Column } from '@/components/website/DataTable';
import ImageUploadZone from '@/components/website/ImageUploadZone';
import { Slide } from '@/lib/mock/website';
import { websiteAPI } from '@/services/api/website';

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
        checked ? 'bg-[#546a2f] border-[#546a2f]' : 'border-gray-300 hover:border-[#546a2f]'
      }`}
    >
      {checked && (
        <svg viewBox="0 0 12 10" className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="1,5 4,9 11,1" />
        </svg>
      )}
    </div>
  );
}

export default function SlideCmsPage() {
  const [data, setData] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Slide | null>(null);
  const [form, setForm] = useState<Partial<Slide>>({});
  const [saving, setSaving] = useState(false);

  const loadSlides = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteAPI.getAdminSlides();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load slides', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSlides();
  }, [loadSlides]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', order: data.length + 1, featured: false, visible: true });
    setModalOpen(true);
  };

  const openEdit = (row: Slide) => {
    setEditing(row);
    setForm({ ...row });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xác nhận xóa slide này?')) return;
    try {
      await websiteAPI.deleteSlide(id);
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert('Xóa thất bại, vui lòng thử lại.');
    }
  };

  const handleSave = async () => {
    if (!form.name?.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await websiteAPI.updateSlide(editing.id, {
          name: form.name,
          image_url: form.imageUrl,
          display_order: form.order ?? editing.order,
          is_featured: form.featured ?? editing.featured,
          is_visible: form.visible ?? editing.visible,
        });
        setData((prev) => prev.map((d) => (d.id === editing.id ? updated : d)));
      } else {
        const created = await websiteAPI.createSlide({
          name: form.name!,
          image_url: form.imageUrl,
          display_order: form.order ?? data.length + 1,
          is_featured: form.featured ?? false,
          is_visible: form.visible ?? true,
        });
        setData((prev) => [...prev, created]);
      }
      setModalOpen(false);
    } catch {
      alert('Lưu thất bại, vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const handleOrderBlur = async (id: number, order: number) => {
    try {
      await websiteAPI.updateSlide(id, { display_order: order });
    } catch {
      await loadSlides();
    }
  };

  const toggleField = async (id: number, field: 'featured' | 'visible') => {
    const row = data.find((d) => d.id === id);
    if (!row) return;
    setData((prev) => prev.map((d) => (d.id === id ? { ...d, [field]: !d[field] } : d)));
    try {
      await websiteAPI.updateSlide(id, {
        ...(field === 'featured' ? { is_featured: !row.featured } : { is_visible: !row.visible }),
      });
    } catch {
      setData((prev) => prev.map((d) => (d.id === id ? row : d)));
    }
  };

  const columns: Column<Slide>[] = [
    {
      key: 'id',
      label: 'Id',
      width: 'w-12',
      render: (row) => <span className="text-gray-400 text-xs">{row.id}</span>,
    },
    {
      key: 'image',
      label: 'Hình ảnh',
      width: 'w-28',
      render: (row) => (
        <div className="relative group w-16 h-24 bg-[#546a2f]/10 rounded-lg overflow-hidden flex items-center justify-center text-[#546a2f]/20 cursor-pointer">
          {row.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={row.imageUrl}
              alt={row.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <ZoomIn className="w-5 h-5 text-white" />
          </div>
        </div>
      ),
    },
    {
      key: 'name',
      label: 'Tên slide / Mô tả',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-white text-sm leading-snug">{row.name}</p>
          {row.description && (
            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{row.description}</p>
          )}
          <p className="text-xs text-gray-400 mt-1">{row.updatedAt}</p>
        </div>
      ),
    },
    {
      key: 'order',
      label: 'Thứ tự',
      width: 'w-20',
      render: (row) => (
        <input
          type="number"
          value={row.order}
          onChange={(e) =>
            setData((prev) =>
              prev.map((d) => (d.id === row.id ? { ...d, order: Number(e.target.value) } : d)),
            )
          }
          onBlur={(e) => handleOrderBlur(row.id, Number(e.target.value))}
          className="w-14 border border-gray-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-[#546a2f]"
        />
      ),
    },
    {
      key: 'featured',
      label: 'Nổi bật',
      width: 'w-20',
      render: (row) => (
        <CustomCheckbox
          checked={row.featured}
          onChange={() => toggleField(row.id, 'featured')}
        />
      ),
    },
    {
      key: 'visible',
      label: 'Hiển thị',
      width: 'w-20',
      render: (row) => (
        <CustomCheckbox
          checked={row.visible}
          onChange={() => toggleField(row.id, 'visible')}
        />
      ),
    },
    {
      key: 'actions',
      label: 'Thao tác',
      width: 'w-24',
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Quản Lý Slide Ảnh</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Quản lý banner và slide ảnh hiển thị trên trang chủ
        </p>
      </div>

      {/* Upload zone */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="font-semibold text-gray-700 dark:text-gray-300 text-sm mb-3">
          Tải Lên Ảnh Mới
        </h2>
        <ImageUploadZone onFilesSelected={() => {}} />
      </div>

      {/* Table */}
      <DataTable data={data} columns={columns} searchKeys={['name', 'description']} />

      {/* FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#546a2f] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#3d5020] transition-colors"
        title="Thêm slide"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-800 dark:text-white">
                {editing ? 'Chỉnh Sửa Slide' : 'Thêm Slide Mới'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Tên slide <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.name ?? ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nhập tên slide..."
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Mô tả
                </label>
                <textarea
                  rows={2}
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Mô tả ngắn về slide..."
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] resize-none dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  URL Hình ảnh
                </label>
                <input
                  type="text"
                  value={form.imageUrl ?? ''}
                  onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                    Thứ tự
                  </label>
                  <input
                    type="number"
                    value={form.order ?? 1}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
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
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
