"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { MessageSquare, Inbox, CheckCircle2, Clock, XCircle } from "lucide-react";
import DataTable from "@/components/website/DataTable";
import { contactAPI } from "@/services/api/contact";
import { buildContactColumns } from "./contact-columns";
import ContactDetailModal from "./contact-detail-modal";
import { WebsiteContact } from "./types";

type FilterStatus = "all" | "pending" | "approved" | "rejected";
type FilterRead = "all" | "unread" | "read";

const STATUS_TABS: { key: FilterStatus; label: string; icon: React.ElementType }[] = [
  { key: "all", label: "Tất cả", icon: Inbox },
  { key: "pending", label: "Chờ xử lý", icon: Clock },
  { key: "approved", label: "Đã duyệt", icon: CheckCircle2 },
  { key: "rejected", label: "Từ chối", icon: XCircle },
];

export default function ContactCmsPage() {
  const [data, setData] = useState<WebsiteContact[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("all");
  const [readFilter, setReadFilter] = useState<FilterRead>("all");
  const [selected, setSelected] = useState<WebsiteContact | null>(null);
  const LIMIT = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (statusFilter !== "all") params.status = statusFilter;
      if (readFilter === "unread") params.is_read = "false";
      if (readFilter === "read") params.is_read = "true";
      const res = await contactAPI.listAdmin(params);
      setData(res.data);
      setTotal(res.total);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, readFilter]);

  useEffect(() => { load(); }, [load]);

  const handleView = async (row: WebsiteContact) => {
    setSelected(row);
    if (!row.is_read) {
      try {
        await contactAPI.markRead(row.id);
        setData((prev) => prev.map((c) => c.id === row.id ? { ...c, is_read: true } : c));
      } catch { /* non-critical */ }
    }
  };

  const handleStatusChange = async (id: number, status: WebsiteContact["status"]) => {
    try {
      await contactAPI.updateStatus(id, status);
      setData((prev) => prev.map((c) => c.id === id ? { ...c, status } : c));
      if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : prev);
      toast.success("Cập nhật trạng thái thành công");
    } catch {
      toast.error("Cập nhật trạng thái thất bại, vui lòng thử lại.");
    }
  };

  const unreadCount = data.filter((c) => !c.is_read).length;
  const totalPages = Math.ceil(total / LIMIT);

  const columns = buildContactColumns({ onView: handleView, onStatusChange: handleStatusChange });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-[#546a2f]" />
            Quản Lý Liên Hệ
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Danh sách liên hệ từ người dân qua website
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-500 text-white px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            {unreadCount} chưa đọc
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {STATUS_TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => { setStatusFilter(key); setPage(1); }}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === key
                  ? "bg-white dark:bg-gray-700 text-[#546a2f] shadow-sm"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Read filter */}
        <select
          value={readFilter}
          onChange={(e) => { setReadFilter(e.target.value as FilterRead); setPage(1); }}
          className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#546a2f]/30 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
        >
          <option value="all">Tất cả (đã đọc / chưa đọc)</option>
          <option value="unread">Chưa đọc</option>
          <option value="read">Đã đọc</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#546a2f] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-gray-400 gap-2">
          <Inbox className="w-10 h-10 opacity-40" />
          <p className="text-sm">Không có liên hệ nào</p>
        </div>
      ) : (
        <>
          <DataTable
            data={data}
            columns={columns}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Hiển thị {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} / {total} liên hệ</span>
              <div className="flex gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                >
                  ← Trước
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span key={`ellipsis-${i}`} className="px-2 py-1 text-gray-400">…</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p as number)}
                        className={`px-3 py-1 rounded-lg border transition-colors ${
                          page === p
                            ? "bg-[#546a2f] text-white border-[#546a2f]"
                            : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
                >
                  Sau →
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ContactDetailModal
        contact={selected}
        onClose={() => setSelected(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}
