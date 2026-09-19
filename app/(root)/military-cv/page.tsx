"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Download,
  Eye,
  FileText,
  Loader2,
  Search,
  UserCircle2,
} from "lucide-react";
import { toast } from "sonner";
import {
  militaryCvApi,
  type MilitaryCvListItem,
} from "@/services/api/military-cv";
import AppPagination from "@/components/ui/AppPagination";

const PAGE_SIZE = 10;

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("vi-VN") : "—";

export default function MilitaryCvListPage() {
  const router = useRouter();

  const [items, setItems] = useState<MilitaryCvListItem[]>([]);
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // ID của hồ sơ đang export
  const [exportingId, setExportingId] = useState<number | null>(null);

  // Trạng thái export tất cả
  const [exportingAll, setExportingAll] = useState(false);

  useEffect(() => {
    let active = true;

    setLoading(true);

    militaryCvApi
      .getList({
        page,
        limit: PAGE_SIZE,
        search: appliedSearch,
      })
      .then((result) => {
        if (!active) return;

        setItems(result.data);
        setTotal(result.total);
      })
      .catch(() => {
        if (active) {
          toast.error("Không thể tải danh sách hồ sơ NVQS.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [appliedSearch, page]);

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();

    setPage(1);
    setAppliedSearch(search.trim());
  };

  /**
   * Download Blob thành file
   */
  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    link.remove();
    URL.revokeObjectURL(url);
  };

  /**
   * Export DOCX của một hồ sơ
   */
  const handleExportDocx = async (id: number) => {
    try {
      setExportingId(id);

      const result = await militaryCvApi.exportDocx(id);

      downloadBlob(result.blob, result.filename);

      toast.success("Đã tải file DOCX.");
    } catch (error) {
      console.error("Export DOCX error:", error);

      toast.error("Không thể tải file DOCX.");
    } finally {
      setExportingId(null);
    }
  };

  /**
   * Export tất cả hồ sơ
   */
  const handleExportAll = async () => {
    try {
      setExportingAll(true);

      const blob = await militaryCvApi.exportAllDocx();

      downloadBlob(blob, "ly-lich-nghia-vu-quan-su.zip");

      toast.success("Đã tải toàn bộ hồ sơ.");
    } catch (error) {
      console.error("Export all DOCX error:", error);

      toast.error("Không thể tải toàn bộ hồ sơ.");
    } finally {
      setExportingAll(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-900">
        Danh sách hồ sơ KSK NVQS
      </h1>

      <div className="mx-auto w-full max-w-[1500px] space-y-4 pb-8">
        {/* Search + Export all */}
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <form
            onSubmit={submitSearch}
            className="flex w-full flex-col gap-2 sm:flex-row sm:flex-1"
          >
            <div className="relative max-w-xs flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm kiếm theo họ tên hoặc CCCD..."
                className="h-9 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            <button
              type="submit"
              className="h-9 rounded-md bg-[#556B2F] px-4 text-sm font-medium text-white hover:bg-[#455A1A]"
            >
              Tìm kiếm
            </button>
          </form>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">
              Tổng hồ sơ: <strong className="text-slate-800">{total}</strong>
            </span>

            {/* Export all */}
            <button
              type="button"
              onClick={handleExportAll}
              disabled={exportingAll || total === 0}
              className="flex h-9 items-center gap-2 rounded-md bg-[#556B2F] px-4 text-sm font-medium text-white transition-colors hover:bg-[#455A1A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {exportingAll ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}

              {exportingAll ? "Đang tải..." : "Tải tất cả DOCX"}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left font-semibold">
                    Họ tên &amp; Năm sinh
                  </th>

                  <th className="px-4 py-3 text-left font-semibold">Số CCCD</th>

                  <th className="px-4 py-3 text-left font-semibold">
                    Cập nhật
                  </th>

                  <th className="px-4 py-3 text-center font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-16 text-center text-sm text-slate-400"
                    >
                      <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />

                      <p className="mt-2">Đang tải...</p>
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-16 text-center">
                      <FileText className="mx-auto mb-2 h-10 w-10 text-slate-200" />

                      <p className="text-sm text-slate-400">
                        Chưa có hồ sơ KSK nào
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const isExporting = exportingId === item.id;

                    return (
                      <tr
                        key={item.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                              <UserCircle2 className="h-5 w-5 text-slate-400" />
                            </div>

                            <div>
                              <p className="font-medium text-slate-800">
                                {item.full_name || "Chưa cập nhật"}
                              </p>

                              <p className="mt-0.5 text-xs text-slate-400">
                                {formatDate(item.dob)}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {item.id_no || "---"}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(item.updated_at)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-center gap-1">
                            {/* Xem chi tiết */}
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/military-cv/${item.id}`)
                              }
                              title="Xem chi tiết"
                              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Download DOCX */}
                            <button
                              type="button"
                              onClick={() => handleExportDocx(item.id)}
                              disabled={exportingAll || exportingId !== null}
                              title="Tải DOCX"
                              className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-green-50 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              {isExporting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex justify-end">
            <AppPagination
              page={page}
              limit={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </>
  );
}
