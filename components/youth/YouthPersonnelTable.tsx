"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  Search,
  UserCircle2,
  FileText,
  ArrowRightCircle,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  youthApi,
  YouthPersonnel,
  YouthPersonnelDetail,
  YouthCreatePayload,
  YouthUpdatePayload,
} from "@/services/api/youth";
import { useAuth } from "@/context/AuthContext";
import AppPagination from "../ui/AppPagination";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (iso: string | null | undefined) => {
  if (!iso) return "---";
  const d = new Date(iso);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const EDUCATION_OPTIONS = [
  "THCS",
  "THPT",
  "Trung cấp",
  "Cao đẳng",
  "Đại học",
  "Khác",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2 border-b border-slate-100 last:border-0">
      <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
        {label}
      </span>
      <span className="text-sm text-slate-800">{value || "---"}</span>
    </div>
  );
}

// ─── Form Modal (Create / Edit) ───────────────────────────────────────────────

interface FormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initial?: YouthPersonnelDetail | null;
  onClose: () => void;
  onSuccess: () => void;
}

function FormModal({
  open,
  mode,
  initial,
  onClose,
  onSuccess,
}: FormModalProps) {
  const empty: YouthCreatePayload = {
    full_name: "",
    date_of_birth: "",
    permanent_address: "",
    temporary_address: "",
    phone: "",
    education_level: "",
    is_registered: false,
  };

  const [form, setForm] = useState<YouthCreatePayload>(empty);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      if (mode === "edit" && initial) {
        setForm({
          full_name: initial.full_name,
          date_of_birth: initial.date_of_birth?.split("T")[0] ?? "",
          permanent_address: initial.permanent_address ?? "",
          temporary_address: initial.temporary_address ?? "",
          phone: initial.phone ?? "",
          education_level: initial.education_level ?? "",
          is_registered: initial.is_registered,
        });
      } else {
        setForm(empty);
      }
    }
  }, [open, mode, initial]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        permanent_address: form.permanent_address || undefined,
        temporary_address: form.temporary_address || undefined,
        phone: form.phone || undefined,
        education_level: form.education_level || undefined,
      };

      if (mode === "create") {
        await youthApi.create(payload);
        toast.success("Tạo hồ sơ thành công");
      } else if (initial) {
        const updatePayload: YouthUpdatePayload = {};
        if (form.full_name !== initial.full_name)
          updatePayload.full_name = form.full_name;
        if (form.date_of_birth !== initial.date_of_birth?.split("T")[0])
          updatePayload.date_of_birth = form.date_of_birth;
        if (
          (form.permanent_address || "") !== (initial.permanent_address || "")
        )
          updatePayload.permanent_address = form.permanent_address;
        if (
          (form.temporary_address || "") !== (initial.temporary_address || "")
        )
          updatePayload.temporary_address = form.temporary_address;
        if ((form.phone || "") !== (initial.phone || ""))
          updatePayload.phone = form.phone;
        if ((form.education_level || "") !== (initial.education_level || ""))
          updatePayload.education_level = form.education_level;
        if (form.is_registered !== initial.is_registered)
          updatePayload.is_registered = form.is_registered;

        await youthApi.update(initial.id, updatePayload);
        toast.success("Cập nhật hồ sơ thành công");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <FileText className="w-5 h-5 text-olive-600" />
            {mode === "create" ? "Thêm hồ sơ tuổi 17" : "Chỉnh sửa hồ sơ"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Họ tên */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Họ và tên <span className="text-red-500">*</span>
            </label>
            <Input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Nguyễn Văn An"
              required
            />
          </div>

          {/* Ngày sinh */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Ngày sinh <span className="text-red-500">*</span>
              <span className="text-slate-400 font-normal ml-1">
                (15–19 tuổi)
              </span>
            </label>
            <Input
              name="date_of_birth"
              type="date"
              value={form.date_of_birth}
              onChange={handleChange}
              required
            />
          </div>

          {/* 2 cột: địa chỉ */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Địa chỉ thường trú
              </label>
              <Input
                name="permanent_address"
                value={form.permanent_address}
                onChange={handleChange}
                placeholder="123 Đường ABC..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Địa chỉ tạm trú
              </label>
              <Input
                name="temporary_address"
                value={form.temporary_address}
                onChange={handleChange}
                placeholder="456 Đường XYZ..."
              />
            </div>
          </div>

          {/* 2 cột: phone + education */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Số điện thoại
              </label>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="0901234567"
                maxLength={10}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Trình độ văn hóa
              </label>
              <select
                name="education_level"
                value={form.education_level}
                onChange={handleChange}
                className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                <option value="">-- Chọn trình độ --</option>
                {EDUCATION_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Đã làm hồ sơ */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              name="is_registered"
              type="checkbox"
              checked={form.is_registered}
              onChange={handleChange}
              className="w-4 h-4 accent-emerald-600"
            />
            <span className="text-sm text-slate-700">
              Đã làm hồ sơ chính thức
            </span>
          </label>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-slate-800 hover:bg-slate-700 text-white"
            >
              {loading
                ? "Đang lưu..."
                : mode === "create"
                  ? "Tạo hồ sơ"
                  : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Detail Dialog ────────────────────────────────────────────────────────────

interface DetailDialogProps {
  id: number | null;
  onClose: () => void;
}

function DetailDialog({ id, onClose }: DetailDialogProps) {
  const [data, setData] = useState<YouthPersonnelDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    youthApi
      .getById(id)
      .then(setData)
      .catch(() => toast.error("Không thể tải chi tiết hồ sơ"))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Dialog open={!!id} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCircle2 className="w-5 h-5 text-slate-500" />
            Chi tiết hồ sơ
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Đang tải...
          </div>
        ) : data ? (
          <div className="mt-1">
            <DetailRow label="Họ và tên" value={data.full_name} />
            <DetailRow
              label="Ngày sinh"
              value={formatDate(data.date_of_birth)}
            />
            <DetailRow
              label="Địa chỉ thường trú"
              value={data.permanent_address ?? ""}
            />
            <DetailRow
              label="Địa chỉ tạm trú"
              value={data.temporary_address ?? ""}
            />
            <DetailRow label="Số điện thoại" value={data.phone ?? ""} />
            <DetailRow
              label="Trình độ văn hóa"
              value={data.education_level ?? ""}
            />
            <DetailRow
              label="Trạng thái hồ sơ"
              value={
                data.is_registered ? "✅ Đã làm hồ sơ" : "⏳ Chưa làm hồ sơ"
              }
            />
            <DetailRow label="Ngày tạo" value={formatDate(data.created_at)} />
            <DetailRow
              label="Cập nhật lần cuối"
              value={formatDate(data.updated_at)}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

interface DeleteDialogProps {
  target: YouthPersonnel | null;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

function DeleteDialog({
  target,
  onClose,
  onConfirm,
  loading,
}: DeleteDialogProps) {
  return (
    <Dialog open={!!target} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-red-600">Xác nhận xóa hồ sơ</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600 mt-1">
          Bạn có chắc muốn xóa hồ sơ của <strong>{target?.full_name}</strong>?
          Hành động này không thể hoàn tác.
        </p>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700"
          >
            {loading ? "Đang xóa..." : "Xóa hồ sơ"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Table Component ─────────────────────────────────────────────────────

const getErrorMessage = (err: unknown, fallback: string) => {
  if (
    err &&
    typeof err === "object" &&
    "data" in err &&
    err.data &&
    typeof err.data === "object" &&
    "message" in err.data &&
    typeof err.data.message === "string"
  ) {
    return err.data.message;
  }
  return fallback;
};

export default function YouthPersonnelTable() {
  const { user } = useAuth();
  const isReadOnly = user?.role === "DQCD";

  // ── State ──
  const [rows, setRows] = useState<YouthPersonnel[]>([]);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [isRegisteredFilter, setIsRegisteredFilter] = useState<boolean | "">(
    "",
  );

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Dialogs
  const [detailId, setDetailId] = useState<number | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState<YouthPersonnelDetail | null>(
    null,
  );
  const [deleteTarget, setDeleteTarget] = useState<YouthPersonnel | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const [promoteTarget, setPromoteTarget] = useState<YouthPersonnel | null>(null);
  const [promoteLoading, setPromoteLoading] = useState(false);

  const searchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // ── Debounce search ──
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(val);
      setParams((p) => ({ ...p, page: 1 }));
    }, 400);
  };

  // ── Fetch ──
  const fetchData = useCallback(async () => {
    setLoading(true);
    setSelectedIds(new Set());
    try {
      const res = await youthApi.getList({
        page: params.page,
        limit: params.limit,
        search: debouncedSearch || undefined,
        is_registered:
          isRegisteredFilter === "" ? undefined : isRegisteredFilter,
      });
      setRows(res.data);
      setParams((p) => ({ ...p, total: res.total }));
    } catch {
      toast.error("Không thể tải danh sách hồ sơ");
    } finally {
      setLoading(false);
    }
  }, [params.page, params.limit, debouncedSearch, isRegisteredFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Filter change → reset page ──
  const handleFilterChange = (val: boolean | "") => {
    setIsRegisteredFilter(val);
    setParams((p) => ({ ...p, page: 1 }));
  };

  // ── Open edit dialog ──
  const handleEdit = async (row: YouthPersonnel) => {
    try {
      const detail = await youthApi.getById(row.id);
      setFormInitial(detail);
      setFormMode("edit");
      setFormOpen(true);
    } catch {
      toast.error("Không thể tải chi tiết hồ sơ");
    }
  };

  // ── Delete ──
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await youthApi.remove(deleteTarget.id);
      toast.success(`Đã xóa hồ sơ của ${deleteTarget.full_name}`);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Xóa hồ sơ thất bại");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePromoteConfirm = async () => {
    if (!promoteTarget) return;
    setPromoteLoading(true);
    try {
      await youthApi.promoteToNguon(promoteTarget.id);
      toast.success(`Đã chuyển ${promoteTarget.full_name} thành Nguồn`);
      setPromoteTarget(null);
      fetchData();
    } catch (err: any) {
      toast.error(err?.data?.message ?? "Chuyển thất bại. Vui lòng thử lại.");
    } finally {
      setPromoteLoading(false);
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setImportLoading(true);
    try {
      const result = await youthApi.importExcel(file);
      toast.success(
        `Da import ${result.imported} dong${
          result.failed ? `, ${result.failed} dong loi` : ""
        }`,
      );
      fetchData();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Import Excel that bai"));
    } finally {
      setImportLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-4">
      {/* ── Toolbar ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="youth-search"
              type="text"
              value={search}
              onChange={handleSearchChange}
              placeholder="Tìm kiếm theo họ tên..."
              className="w-full pl-9 pr-3 h-9 rounded-md border border-slate-200 bg-white text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* Filter trạng thái */}
          <select
            id="youth-filter-registered"
            value={isRegisteredFilter === "" ? "" : String(isRegisteredFilter)}
            onChange={(e) => {
              const v = e.target.value;
              handleFilterChange(v === "" ? "" : v === "true");
            }}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            <option value="">Trạng thái</option>
            <option value="true">Đã làm hồ sơ</option>
            <option value="false">Chưa làm hồ sơ</option>
          </select>
        </div>

        {/* Nút Thêm mới */}
        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              className="hidden"
            />
            <Button
              id="youth-import-excel-btn"
              type="button"
              variant="outline"
              onClick={() => importInputRef.current?.click()}
              disabled={importLoading}
              className="h-9 px-4 flex items-center gap-1.5"
            >
              <Upload className="w-4 h-4" />
              {importLoading ? "Đang Nhập" : "Nhập Excel"}
            </Button>
            <Button
              id="youth-add-btn"
              type="button"
              onClick={() => {
                setFormMode("create");
                setFormInitial(null);
                setFormOpen(true);
              }}
              className="bg-[#556B2F] hover:bg-[#455A1A] text-white h-9 px-4 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Thêm mới
            </Button>
          </div>
        )}
      </div>

      {/* ── Table ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto rounded-lg border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold">
                  Họ tên & Năm sinh
                </th>
                <th className="px-4 py-3 text-left font-semibold">Địa chỉ</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Điện thoại
                </th>
                <th className="px-4 py-3 text-left font-semibold">Trình độ</th>
                <th className="px-4 py-3 text-center font-semibold">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-center font-semibold">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <FileText className="w-10 h-10 text-slate-200" />
                      <p className="text-sm">
                        {debouncedSearch || isRegisteredFilter !== ""
                          ? "Không tìm thấy hồ sơ nào khớp với từ khóa"
                          : "Chưa có hồ sơ nhân sự tuổi 17 nào"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      selectedIds.has(row.id) ? "bg-slate-50" : ""
                    }`}
                  >
                    {/* Họ tên + năm sinh */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          <UserCircle2 className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {row.full_name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {formatDate(row.date_of_birth)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Địa chỉ */}
                    <td className="px-4 py-3">
                      <p
                        className="text-slate-600 max-w-45 truncate"
                        title={row.permanent_address ?? ""}
                      >
                        {row.permanent_address || "---"}
                      </p>
                    </td>

                    {/* Điện thoại */}
                    <td className="px-4 py-3 text-slate-600">
                      {row.phone || "---"}
                    </td>

                    {/* Trình độ */}
                    <td className="px-4 py-3 text-slate-600">
                      {row.education_level || "---"}
                    </td>

                    {/* Trạng thái */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${
                          row.is_registered
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {row.is_registered ? "Đã làm hồ sơ" : "Chưa làm hồ sơ"}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {/* Xem */}
                        <button
                          id={`youth-view-${row.id}`}
                          onClick={() => setDetailId(row.id)}
                          title="Xem chi tiết"
                          className="p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Sửa — ẩn với DQCD */}
                        {!isReadOnly && (
                          <button
                            id={`youth-edit-${row.id}`}
                            onClick={() => handleEdit(row)}
                            title="Chỉnh sửa"
                            className="p-1.5 rounded-md hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        )}

                        {/* Chuyển thành Nguồn — ẩn với DQCD */}
                        {!isReadOnly && (
                          <button
                            id={`youth-promote-${row.id}`}
                            onClick={() => setPromoteTarget(row)}
                            title="Chuyển thành Nguồn"
                            className="p-1.5 rounded-md hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                          >
                            <ArrowRightCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* Xóa — ẩn với DQCD */}
                        {!isReadOnly && (
                          <button
                            id={`youth-delete-${row.id}`}
                            onClick={() => setDeleteTarget(row)}
                            title="Xóa hồ sơ"
                            className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {params.total > 0 && (
        <div className="flex flex-col sm:flex-row items-center gap-3 justify-end">
          <AppPagination
            page={params.page}
            limit={params.limit}
            total={params.total}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* ── Dialogs ───────────────────────────────────────────── */}
      <DetailDialog id={detailId} onClose={() => setDetailId(null)} />

      <FormModal
        open={formOpen}
        mode={formMode}
        initial={formInitial}
        onClose={() => setFormOpen(false)}
        onSuccess={fetchData}
      />

      <DeleteDialog
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
      />

      {/* Promote to Nguon confirm dialog */}
      <Dialog open={!!promoteTarget} onOpenChange={(v) => !v && setPromoteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-700">
              <ArrowRightCircle className="w-5 h-5" />
              Chuyển thành Nguồn
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 mt-1">
            Chuyển hồ sơ của <strong>{promoteTarget?.full_name}</strong> sang danh sách
            Nguồn? Hồ sơ sẽ được xóa khỏi danh sách Tuổi 17.
          </p>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setPromoteTarget(null)}
              disabled={promoteLoading}
            >
              Hủy
            </Button>
            <Button
              onClick={handlePromoteConfirm}
              disabled={promoteLoading}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              {promoteLoading ? "Đang chuyển..." : "Xác nhận"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
