"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getActivitySummary,
  getKpiTrend,
  getKpiDepartments,
} from "@/services/api/kpi-dashboard";
import { getKpiHotTasks } from "@/services/api/kpi-hot-tasks";
import { getKpiList, getKpiSummary } from "@/services/api/kpi-user";
import type {
  ActivitySummary,
  KpiTrendPoint,
  KpiDeptOverview,
  KpiDeptStat,
  HotTask,
  HotTaskFilter,
  KpiUser,
  KpiSummaryResponse,
} from "@/services/api/kpi-types";
import type { Period } from "@/components/force/PeriodTabs";
import type { User } from "@/services/api/auth";

type AppRole = "CHI_HUY" | "TO_TRUONG" | "DQTT" | "DQCD" | "ADMIN";

const ALLOWED_ROLES: AppRole[] = ["CHI_HUY", "TO_TRUONG", "DQTT", "ADMIN"];

function isAllowed(user: User | null | undefined): boolean {
  return !!user && ALLOWED_ROLES.includes(user.role as AppRole);
}

export interface PerformanceData {
  summary: ActivitySummary | null;
  personalSummary: KpiSummaryResponse | null;
  trend: KpiTrendPoint[];
  overview: KpiDeptOverview | null;
  departments: KpiDeptStat[];
  hotTasks: HotTask[];
  hotTotal: number;
  members: KpiUser[];
  loadingMain: boolean;
  loadingHot: boolean;
  loadingMembers: boolean;
}

export function usePerformanceData(
  user: User | null | undefined,
  isLoadingFetchUser: boolean,
  period: Period,
  hotFilter: HotTaskFilter,
  overrideDeptId?: number | null,
  overrideUserId?: number | null,
  isAdminOverride?: boolean,
): PerformanceData {
  const role = user?.role as AppRole | undefined;
  const isTruong = !isAdminOverride && role === "TO_TRUONG";
  const isDqtt = !isAdminOverride && role === "DQTT";
  const isAdmin = isAdminOverride ?? false;

  // Effective scope: admin overrides > role-based defaults
  const effectiveDeptId = isAdmin
    ? (overrideDeptId ?? null)
    : isTruong
      ? (user?.department_id ?? null)
      : null;

  const effectiveUserId = isAdmin
    ? (overrideUserId ?? null)
    : isDqtt
      ? (user?.id ?? null)
      : null;

  const [summary, setSummary] = useState<ActivitySummary | null>(null);
  const [personalSummary, setPersonalSummary] = useState<KpiSummaryResponse | null>(null);
  const [trend, setTrend] = useState<KpiTrendPoint[]>([]);
  const [overview, setOverview] = useState<KpiDeptOverview | null>(null);
  const [departments, setDepartments] = useState<KpiDeptStat[]>([]);
  const [hotTasks, setHotTasks] = useState<HotTask[]>([]);
  const [hotTotal, setHotTotal] = useState(0);
  const [members, setMembers] = useState<KpiUser[]>([]);

  const [loadingMain, setLoadingMain] = useState(true);
  const [loadingHot, setLoadingHot] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const fetchMain = useCallback(async () => {
    if (!isAllowed(user)) return;
    setLoadingMain(true);
    try {
      const summaryParams: Parameters<typeof getActivitySummary>[0] = { period };
      if (effectiveDeptId) summaryParams.department_id = effectiveDeptId;

      const trendParams: Parameters<typeof getKpiTrend>[0] = { period };
      if (effectiveUserId) trendParams.user_id = effectiveUserId;

      const [summaryRes, trendRes, deptRes] = await Promise.all([
        getActivitySummary(summaryParams),
        getKpiTrend(trendParams),
        getKpiDepartments({ period }),
      ]);
      setSummary(summaryRes);
      setTrend(trendRes.trend);
      setOverview(deptRes.overview);
      setDepartments(deptRes.departments);
    } catch {
      // components show empty state
    } finally {
      setLoadingMain(false);
    }
  }, [user, period, effectiveDeptId, effectiveUserId]);

  const fetchHot = useCallback(async () => {
    if (!isAllowed(user)) return;
    setLoadingHot(true);
    try {
      const params: Parameters<typeof getKpiHotTasks>[0] = { filter: hotFilter, limit: 20 };
      if (effectiveDeptId) params.department_id = effectiveDeptId;
      if (effectiveUserId) params.user_id = effectiveUserId;
      const res = await getKpiHotTasks(params);
      setHotTasks(res.data);
      setHotTotal(res.total);
    } catch {
      setHotTasks([]);
      setHotTotal(0);
    } finally {
      setLoadingHot(false);
    }
  }, [user, hotFilter, effectiveDeptId, effectiveUserId]);

  const fetchMembers = useCallback(async () => {
    const needsMembers = isTruong || (isAdmin && effectiveDeptId != null);
    if (!user || !needsMembers) return;
    setLoadingMembers(true);
    try {
      const params: Parameters<typeof getKpiList>[0] = { period };
      if (effectiveDeptId) params.department_id = effectiveDeptId;
      const res = await getKpiList(params);
      setMembers(res.data);
    } catch {
      setMembers([]);
    } finally {
      setLoadingMembers(false);
    }
  }, [user, period, isTruong, isAdmin, effectiveDeptId]);

  const fetchPersonalSummary = useCallback(async () => {
    const targetUserId = effectiveUserId;
    if (!user || !targetUserId) return;
    try {
      const res = await getKpiSummary({ period, user_id: targetUserId });
      setPersonalSummary(res);
    } catch {
      setPersonalSummary(null);
    }
  }, [user, period, effectiveUserId]);

  useEffect(() => {
    if (isLoadingFetchUser) return;
    fetchMain();
  }, [fetchMain, isLoadingFetchUser]);

  useEffect(() => {
    if (isLoadingFetchUser) return;
    fetchHot();
  }, [fetchHot, isLoadingFetchUser]);

  useEffect(() => {
    if (isLoadingFetchUser) return;
    fetchMembers();
  }, [fetchMembers, isLoadingFetchUser]);

  useEffect(() => {
    if (isLoadingFetchUser) return;
    fetchPersonalSummary();
  }, [fetchPersonalSummary, isLoadingFetchUser]);

  return {
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
  };
}
