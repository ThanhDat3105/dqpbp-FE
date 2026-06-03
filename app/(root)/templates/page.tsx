"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, FileText, Pencil, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  activityTemplateAPI,
  ActivityTemplateInterface,
} from "@/services/api/activity-template";
import { departments } from "@/services/api/activity";
import AppPagination from "@/components/ui/AppPagination";

const WORK_TYPE_LABEL: Record<string, string> = {
  suddenly: "Đột xuất",
  annual: "Theo năm",
};

const STATUS_STYLE: Record<string, { bg: string; dot: string; text: string; label: string }> = {
  active: { bg: "bg-green-100", dot: "bg-green-500", text: "text-green-700", label: "Đang dùng" },
  inactive: { bg: "bg-gray-100", dot: "bg-gray-400", text: "text-gray-500", label: "Tạm ẩn" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? STATUS_STYLE.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold whitespace-nowrap ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${s.dot}`} />
      {s.label}
    </span>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ActivityTemplateInterface[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const limit = 10;

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const data = await activityTemplateAPI.getTemplates({
        page,
        limit,
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setTemplates(data.results);
      setTotal(data.total);
    } catch {
      toast.error("Không thể tải danh sách mẫu kế hoạch");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa mẫu này?")) return;
    setDeletingId(id);
    try {
      await activityTemplateAPI.deleteTemplate(id);
      toast.success("Đã xóa mẫu kế hoạch");
      fetchTemplates();
    } catch {
      toast.error("Xóa thất bại");
    } finally {
      setDeletingId(null);
    }
  };

  const getDepartmentLabel = (value: string | null) => {
    if (!value) return "—";
    return departments.find((d) => d.value === value)?.label ?? value;
  };

  return (
    <main className="flex-1 flex flex-col">
      {/* Header */}
      <header>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mẫu Kế Hoạch</h1>
            <p className="text-sm text-gray-500 mt-1">
              Tái sử dụng cấu trúc nhiệm vụ để tạo kế hoạch nhanh hơn
            </p>
          </div>
          <Button onClick={() => router.push("/create-template")}>
            <Plus className="h-4 w-4 mr-2" />
            Tạo Mẫu Mới
          </Button>
        </div>
      </header>

      <div className="pt-4 flex-1 flex flex-col overflow-hidden">
        {/* Filter bar */}
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Tìm kiếm theo tên mẫu..."
              className="pl-9"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full sm:w-auto text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6B8E23] cursor-pointer"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang dùng</option>
            <option value="inactive">Tạm ẩn</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 w-10">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Tên mẫu</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Loại</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Bộ phận</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Nhiệm vụ</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Trạng thái</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    {Array.from({ length: 7 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-gray-100 animate-pulse rounded" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : templates.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-24">
            <FileText className="h-12 w-12 mb-3 opacity-30" />
            <p className="font-medium">Chưa có mẫu kế hoạch nào</p>
            <p className="text-sm mt-1">Tạo mẫu đầu tiên để bắt đầu</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 w-10">#</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 min-w-50">Tên mẫu</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Loại</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600 hidden md:table-cell">Bộ phận</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Nhiệm vụ</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Trạng thái</th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-600">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((tpl, idx) => (
                    <tr
                      key={tpl.id}
                      onClick={() => router.push(`/templates/${tpl.id}`)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors hover:bg-[#556B2F]/5 ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                      }`}
                    >
                      <td className="px-4 py-3 text-gray-400 font-medium">
                        {(page - 1) * limit + idx + 1}
                      </td>
                      <td className="px-4 py-3 max-w-80">
                        <span className="font-semibold text-gray-900 truncate block max-w-75">
                          {tpl.name}
                        </span>
                        {tpl.description && (
                          <span className="text-xs text-gray-400 truncate block max-w-75 mt-0.5">
                            {tpl.description}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {tpl.work_type ? (
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-semibold whitespace-nowrap">
                            {WORK_TYPE_LABEL[tpl.work_type] ?? tpl.work_type}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {tpl.department ? (
                          <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded-full font-semibold whitespace-nowrap">
                            {getDepartmentLabel(tpl.department)}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs font-medium">
                        {tpl.task_count ?? 0} nhiệm vụ
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={tpl.status} />
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs gap-1"
                            onClick={() => router.push(`/templates/${tpl.id}`)}
                          >
                            <Copy className="h-3 w-3" />
                            Dùng mẫu
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-gray-500 hover:text-blue-600"
                            onClick={() => router.push(`/templates/${tpl.id}/edit`)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-gray-500 hover:text-red-500"
                            disabled={deletingId === tpl.id}
                            onClick={() => handleDelete(tpl.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <AppPagination
              page={page}
              limit={limit}
              total={total}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </main>
  );
}
