'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, CheckCircle, X, FileText, File } from 'lucide-react';
import DataTable, { Column } from '@/components/website/DataTable';
import { WebsiteDocument } from '@/lib/mock/website';
import { websiteAPI } from '@/services/api/website';

const CATEGORIES = ['Nhiệm vụ', 'Hành chính', 'Tuyên truyền', 'Bảo mật', 'Hậu cần'];
const FILE_TYPES = ['PDF', 'DOCX'] as const;
const STATUSES = [
  { value: 'active', label: 'Hiệu lực' },
  { value: 'expired', label: 'Hết hiệu lực' },
  { value: 'new', label: 'Mới' },
] as const;

const categoryBadge: Record<string, string> = {
  'Nhiệm vụ': 'bg-green-100 text-green-700',
  'Hành chính': 'bg-blue-100 text-blue-700',
  'Tuyên truyền': 'bg-yellow-100 text-yellow-700',
  'Bảo mật': 'bg-red-100 text-red-700',
  'Hậu cần': 'bg-emerald-100 text-emerald-700',
};

const statusConfig = {
  active: { label: 'Hiệu lực', color: 'text-green-600' },
  expired: { label: 'Hết hiệu lực', color: 'text-red-500' },
  new: { label: 'Mới', color: 'text-blue-600' },
};

export default function VanBanCmsPage() {
  const [data, setData] = useState<WebsiteDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WebsiteDocument | null>(null);
  const [form, setForm] = useState<Partial<WebsiteDocument>>({});
  const [saving, setSaving] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await websiteAPI.getAdminDocuments();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load documents', err);
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
      title: '',
      docNumber: '',
      issuedBy: '',
      issuedDate: '',
      category: 'Nhiệm vụ',
      fileSize: '',
      fileType: 'PDF',
      status: 'active',
      order: data.length + 1,
      visible: true,
    });
    setModalOpen(true);
  };

  const openEdit = (row: WebsiteDocument) => {
    setEditing(row);
    setForm({ ...row });
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Xác nhận xóa văn bản này?')) return;
    try {
      await websiteAPI.deleteDocument(id);
      setData((prev) => prev.filter((d) => d.id !== id));
    } catch {
      alert('Xóa thất bại, vui lòng thử lại.');
    }
  };

  const handleSave = async () => {
    if (!form.title?.trim()) return;
    setSaving(true);
    try {
      if (editing) {
        const updated = await websiteAPI.updateDocument(editing.id, {
          title: form.title,
          doc_number: form.docNumber,
          issued_by: form.issuedBy,
          issued_date: form.issuedDate,
          category: form.category,
          file_size: form.fileSize,
          file_type: form.fileType,
          status: form.status,
          display_order: form.order ?? editing.order,
          is_visible: form.visible ?? editing.visible,
        });
        setData((prev) => prev.map((d) => (d.id === editing.id ? updated : d)));
      } else {
        const created = await websiteAPI.createDocument({
          title: form.title!,
          doc_number: form.docNumber,
          issued_by: form.issuedBy,
          issued_date: form.issuedDate,
          category: form.category ?? 'Nhiệm vụ',
          file_size: form.fileSize,
          file_type: form.fileType,
          status: form.status ?? 'active',
          display_order: form.order ?? data.length + 1,
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
      await websiteAPI.updateDocument(id, { display_order: order });
    } catch {
      await loadDocuments();
    }
  };

  const columns: Column<WebsiteDocument>[] = [
    {
      key: 'id',
      label: 'Id',
      width: 'w-12',
      render: (row) => <span className="text-gray-400 text-xs">{row.id}</span>,
    },
    {
      key: 'title',
      label: 'Văn bản',
      render: (row) => (
        <div className="flex items-start gap-3">
          <div
            className={`w-8 h-10 rounded flex items-center justify-center shrink-0 ${
              row.fileType === 'PDF' ? 'bg-red-50' : 'bg-blue-50'
            }`}
          >
            {row.fileType === 'PDF' ? (
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
              {row.docNumber} · {row.issuedDate}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Chuyên mục',
      render: (row) => (
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            categoryBadge[row.category] ?? 'bg-gray-100 text-gray-600'
          }`}
        >
          {row.category}
        </span>
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
      key: 'status',
      label: 'Trạng thái',
      render: (row) => {
        const s = statusConfig[row.status];
        return (
          <div className={`flex items-center gap-1.5 text-sm font-medium ${s.color}`}>
            <CheckCircle className="w-4 h-4" />
            {s.label}
          </div>
        );
      },
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
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Văn Bản Pháp Luật</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Quản lý các văn bản và pháp luật trên website
        </p>
      </div>

      <DataTable data={data} columns={columns} />

      {/* FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#546a2f] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#3d5020] transition-colors"
        title="Thêm văn bản"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="font-bold text-gray-800 dark:text-white">
                {editing ? 'Chỉnh Sửa Văn Bản' : 'Thêm Văn Bản Mới'}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Tiêu đề văn bản <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title ?? ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Nhập tên văn bản..."
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                    Số hiệu
                  </label>
                  <input
                    type="text"
                    value={form.docNumber ?? ''}
                    onChange={(e) => setForm({ ...form, docNumber: e.target.value })}
                    placeholder="VD: KH-01/2025"
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                    Ngày ban hành
                  </label>
                  <input
                    type="text"
                    value={form.issuedDate ?? ''}
                    onChange={(e) => setForm({ ...form, issuedDate: e.target.value })}
                    placeholder="DD/MM/YYYY"
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                  Cơ quan ban hành
                </label>
                <input
                  type="text"
                  value={form.issuedBy ?? ''}
                  onChange={(e) => setForm({ ...form, issuedBy: e.target.value })}
                  placeholder="VD: Ban CHQS Phường Bình Phú"
                  className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 outline-none focus:border-[#546a2f] dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                    Chuyên mục
                  </label>
                  <select
                    value={form.category ?? ''}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-[#546a2f]"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                    Loại file
                  </label>
                  <select
                    value={form.fileType ?? 'PDF'}
                    onChange={(e) => setForm({ ...form, fileType: e.target.value as 'PDF' | 'DOCX' })}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-[#546a2f]"
                  >
                    {FILE_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide mb-1 block">
                    Trạng thái
                  </label>
                  <select
                    value={form.status ?? 'active'}
                    onChange={(e) => setForm({ ...form, status: e.target.value as WebsiteDocument['status'] })}
                    className="w-full text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2.5 bg-white dark:bg-gray-800 dark:text-white outline-none focus:border-[#546a2f]"
                  >
                    {STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
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
