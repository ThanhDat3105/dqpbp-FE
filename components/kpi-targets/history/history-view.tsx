"use client";

import { AlertCircle, History, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import PaginationCustom from "@/components/ui/AppPagination";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  type DepartmentInterface,
  departmentAPI,
} from "@/services/api/department";
import { kpiTargetHistoryApi } from "@/services/api/kpi-target-history";
import type { KpiTargetHistoryItem } from "@/types/kpi-target-history";
import { HistoryTable } from "./history-table";

const PAGE_SIZE = 20;
const ALLOWED_ROLES = ["ADMIN", "CHI_HUY", "TO_TRUONG"];

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error && "message" in error) {
    return String(error.message);
  }
  return "Không thể tải lịch sử chỉnh sửa chỉ tiêu.";
}

export function HistoryView() {
  const { user, isLoadingFetchUser } = useAuth();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [teamId, setTeamId] = useState<number | undefined>();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<KpiTargetHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [departments, setDepartments] = useState<DepartmentInterface[]>([]);
  const [departmentError, setDepartmentError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestSequence = useRef(0);

  const allowed = !!user && ALLOWED_ROLES.includes(user.role);
  const isTeamLeader = user?.role === "TO_TRUONG";

  useEffect(() => {
    if (isTeamLeader && user?.department_id) setTeamId(user.department_id);
  }, [isTeamLeader, user?.department_id]);

  const loadDepartments = useCallback(async () => {
    if (!allowed || isTeamLeader) return;
    setDepartmentError(false);
    try {
      setDepartments(await departmentAPI.getAllDepartment());
    } catch {
      setDepartments([]);
      setDepartmentError(true);
    }
  }, [allowed, isTeamLeader]);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const loadHistory = useCallback(async () => {
    if (!allowed) return;
    const requestId = ++requestSequence.current;
    setLoading(true);
    setError(null);
    try {
      const data = await kpiTargetHistoryApi.getHistory({
        teamId,
        year,
        page,
        size: PAGE_SIZE,
      });
      if (requestId === requestSequence.current) {
        setItems(data.items);
        setTotal(data.total);
      }
    } catch (loadError) {
      if (requestId === requestSequence.current) {
        setItems([]);
        setTotal(0);
        setError(getErrorMessage(loadError));
      }
    } finally {
      if (requestId === requestSequence.current) setLoading(false);
    }
  }, [allowed, page, teamId, year]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(
    () => () => {
      requestSequence.current += 1;
    },
    [],
  );

  if (isLoadingFetchUser) {
    return <HistoryTable items={[]} loading />;
  }
  if (!allowed) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
        Bạn không có quyền xem lịch sử chỉnh sửa chỉ tiêu.
      </div>
    );
  }

  const years = Array.from(
    { length: 5 },
    (_, index) => currentYear + 1 - index,
  );
  const lockedTeamName = user?.department_name ?? "Tổ của tôi";

  return (
    <section className="flex flex-col gap-5">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <History className="h-6 w-6 text-[#6B8E23]" />
          Lịch sử chỉnh sửa chỉ tiêu
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Theo dõi người sửa, nội dung thay đổi và thời điểm thực hiện.
        </p>
      </header>

      <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-2">
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          Tổ
          <select
            value={teamId ?? ""}
            disabled={isTeamLeader}
            onChange={(event) => {
              setTeamId(
                event.target.value ? Number(event.target.value) : undefined,
              );
              setPage(1);
            }}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm disabled:bg-slate-100"
          >
            {isTeamLeader ? (
              <option value={teamId ?? ""}>{lockedTeamName}</option>
            ) : (
              <>
                <option value="">Tất cả</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </>
            )}
          </select>
        </label>
        <label className="space-y-1.5 text-sm font-medium text-slate-700">
          Năm
          <select
            value={year}
            onChange={(event) => {
              setYear(Number(event.target.value));
              setPage(1);
            }}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
          >
            {years.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        {departmentError && (
          <div className="flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 sm:col-span-2">
            <span>Không tải được danh sách tổ. Bạn vẫn có thể xem tất cả.</span>
            <button
              type="button"
              onClick={loadDepartments}
              className="font-semibold underline underline-offset-2"
            >
              Thử lại
            </button>
          </div>
        )}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">Không tải được dữ liệu</p>
              <p className="mt-1 text-sm">{error}</p>
            </div>
            <Button variant="outline" size="sm" onClick={loadHistory}>
              <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
            </Button>
          </div>
        </div>
      ) : !loading && items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <History className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">
            Chưa có lần chỉnh sửa nào
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Các thay đổi chỉ tiêu sẽ xuất hiện tại đây.
          </p>
        </div>
      ) : (
        <>
          <HistoryTable items={items} loading={loading} />
          <PaginationCustom
            page={page}
            limit={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </>
      )}
    </section>
  );
}
