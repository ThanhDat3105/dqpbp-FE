"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import clsx from "clsx";

import { PeriodTabs, type Period } from "@/components/force/PeriodTabs";
import { PerformanceStatCards } from "@/components/force/PerformanceStatCards";
import { TrendChart } from "@/components/force/TrendChart";
import { TaskStatusDonut } from "@/components/force/TaskStatusDonut";
import { MemberDistributionChart } from "@/components/force/MemberDistributionChart";
import { DeptRankingTable } from "@/components/force/DeptRankingTable";
import { HotTasksTable } from "@/components/force/HotTasksTable";
import { MemberKpiTable } from "@/components/force/MemberKpiTable";
import { PersonalDashboard } from "@/components/force/PersonalDashboard";
import { getKpiHotTasksExportUrl } from "@/services/api/kpi-hot-tasks";
import { fetchUsers, type UserWithKpi } from "@/services/api/user";
import type { HotTaskFilter, KpiDeptStat } from "@/services/api/kpi-types";

import { usePerformanceData } from "./use-performance-data";
import { getPageMeta, ALLOWED_ROLES } from "./page-meta";

type AppRole = "CHI_HUY" | "TO_TRUONG" | "DQTT" | "DQCD" | "ADMIN";
type AdminView = "chiHuy" | "toTruong" | "dqtt";

// ─── Admin view tab strip ─────────────────────────────────────────────────────

const ADMIN_TABS: { label: string; value: AdminView }[] = [
  { label: "Chỉ huy", value: "chiHuy" },
  { label: "Tổ trưởng", value: "toTruong" },
  { label: "Cá nhân", value: "dqtt" },
];

function AdminViewTabs({
  value,
  onChange,
}: {
  value: AdminView;
  onChange: (v: AdminView) => void;
}) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
      {ADMIN_TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={clsx(
            "px-3 py-1.5 text-sm font-medium rounded-md transition-colors cursor-pointer",
            value === tab.value
              ? "bg-[#6B8E23] text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── Dept dropdown ────────────────────────────────────────────────────────────

function DeptDropdown({
  departments,
  value,
  onChange,
}: {
  departments: KpiDeptStat[];
  value: number | null;
  onChange: (id: number) => void;
}) {
  if (departments.length === 0) return null;
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/40 cursor-pointer"
    >
      {departments.map((d) => (
        <option key={d.department_id ?? d.department_name} value={d.department_id ?? ""}>
          {d.department_name}
        </option>
      ))}
    </select>
  );
}

// ─── DQTT user dropdown ───────────────────────────────────────────────────────

function UserDropdown({
  users,
  value,
  onChange,
}: {
  users: UserWithKpi[];
  value: number | null;
  onChange: (id: number) => void;
}) {
  if (users.length === 0) return null;
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(Number(e.target.value))}
      className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#6B8E23]/40 cursor-pointer"
    >
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name}
          {u.department_name ? ` · ${u.department_name}` : ""}
        </option>
      ))}
    </select>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PerformanceDashboardPage() {
  const { user, isLoadingFetchUser } = useAuth();
  const router = useRouter();

  const [period, setPeriod] = useState<Period>("month");
  const [hotFilter, setHotFilter] = useState<HotTaskFilter>("all");

  // Admin impersonation state
  const [adminView, setAdminView] = useState<AdminView>("chiHuy");
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [dqttUsers, setDqttUsers] = useState<UserWithKpi[]>([]);

  const role = user?.role as AppRole | undefined;

  // isAdmin: only CHI_HUY whose name is exactly "admin" (case-insensitive)
  const isAdmin =
    role === "CHI_HUY" && user?.name?.toLowerCase() === "admin";

  const effectiveRole: AppRole | undefined = isAdmin
    ? adminView === "chiHuy"
      ? "CHI_HUY"
      : adminView === "toTruong"
        ? "TO_TRUONG"
        : "DQTT"
    : role;

  const isChiHuy = effectiveRole === "CHI_HUY" || effectiveRole === "ADMIN";
  const isTruong = effectiveRole === "TO_TRUONG";
  const isDqtt = effectiveRole === "DQTT";

  // Overrides forwarded to the data hook (admin only)
  const overrideDeptId = isAdmin && adminView === "toTruong" ? selectedDeptId : null;
  const overrideUserId = isAdmin && adminView === "dqtt" ? selectedUserId : null;

  useEffect(() => {
    if (isLoadingFetchUser) return;
    if (user && !ALLOWED_ROLES.includes(user.role as AppRole)) {
      router.replace("/");
    }
  }, [user, isLoadingFetchUser, router]);

  // Fetch DQTT users once for admin dropdown
  useEffect(() => {
    if (!isAdmin) return;
    fetchUsers({ role: ["DQTT"] })
      .then((list) => {
        setDqttUsers(list);
        if (list.length > 0) setSelectedUserId(list[0].id);
      })
      .catch(() => setDqttUsers([]));
  }, [isAdmin]);

  const {
    summary,
    personalSummary,
    trend,
    overview,
    departments,
    hotTasks,
    hotTotal,
    members,
    loadingMain,
    loadingHot,
    loadingMembers,
  } = usePerformanceData(
    user,
    isLoadingFetchUser,
    period,
    hotFilter,
    overrideDeptId,
    overrideUserId,
    isAdmin,
  );

  // Set default dept when departments load (admin toTruong view)
  useEffect(() => {
    if (isAdmin && adminView === "toTruong" && departments.length > 0 && selectedDeptId === null) {
      const firstId = departments[0].department_id;
      if (firstId != null) setSelectedDeptId(firstId);
    }
  }, [isAdmin, adminView, departments, selectedDeptId]);

  if (isLoadingFetchUser) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500 text-sm">
        Đang kiểm tra quyền truy cập...
      </div>
    );
  }

  if (user && !ALLOWED_ROLES.includes(user.role as AppRole)) return null;

  const { title, subtitle } = getPageMeta(
    effectiveRole,
    isAdmin && adminView === "toTruong"
      ? (departments.find((d) => d.department_id === selectedDeptId)?.department_name ?? null)
      : user?.department_name,
    members.length,
    departments.length,
  );

  const exportUrl = getKpiHotTasksExportUrl({ filter: hotFilter });

  // For PersonalDashboard: admin sees selected DQTT user's info, others see self
  const personalUser =
    isAdmin && adminView === "dqtt"
      ? (dqttUsers.find((u) => u.id === selectedUserId) ?? null)
      : user;

  return (
    <main className="flex-1 flex flex-col gap-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          {subtitle && (
            <p className="text-xs text-[#6B8E23] mt-0.5 font-medium">{subtitle}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Admin-only: view switcher */}
          {isAdmin && (
            <AdminViewTabs
              value={adminView}
              onChange={(v) => {
                setAdminView(v);
                if (v === "toTruong") setSelectedDeptId(null);
              }}
            />
          )}

          {/* Admin toTruong: dept picker */}
          {isAdmin && adminView === "toTruong" && (
            <DeptDropdown
              departments={departments}
              value={selectedDeptId}
              onChange={setSelectedDeptId}
            />
          )}

          {/* Admin dqtt: user picker */}
          {isAdmin && adminView === "dqtt" && (
            <UserDropdown
              users={dqttUsers}
              value={selectedUserId}
              onChange={setSelectedUserId}
            />
          )}

          <PeriodTabs value={period} onChange={setPeriod} />
        </div>
      </header>

      {/* Stat Cards — not shown in personal view */}
      {!isDqtt && (
        <PerformanceStatCards summary={summary} loading={loadingMain} period={period} />
      )}

      {/* Charts */}
      <section className="flex flex-col md:flex-row gap-5">
        {!isDqtt && <TrendChart trend={trend} loading={loadingMain} />}
        {isChiHuy ? (
          <TaskStatusDonut overview={overview} loading={loadingMain} />
        ) : isTruong ? (
          <MemberDistributionChart members={members} loading={loadingMembers} />
        ) : null}
      </section>

      {/* CHI_HUY: dept ranking + hot tasks */}
      {isChiHuy && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <DeptRankingTable departments={departments} loading={loadingMain} />
          <HotTasksTable
            tasks={hotTasks}
            total={hotTotal}
            loading={loadingHot}
            filter={hotFilter}
            onFilterChange={setHotFilter}
            exportUrl={exportUrl}
          />
        </section>
      )}

      {/* TO_TRUONG: member table */}
      {isTruong && (
        <section>
          <MemberKpiTable
            members={members}
            loading={loadingMembers}
            showExport={!isAdmin}
          />
        </section>
      )}

      {/* DQTT: personal dashboard */}
      {isDqtt && personalUser && (
        <PersonalDashboard
          user={personalUser as NonNullable<typeof user>}
          summaryRes={personalSummary}
          trend={trend}
          hotTasks={hotTasks}
          loadingMain={loadingMain}
          loadingHot={loadingHot}
        />
      )}
    </main>
  );
}
