"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  KpiPageLayout,
  type KpiPeriod,
  type KpiRoleFilter,
} from "@/components/kpi/KpiPageLayout";
import { useAuth } from "@/context/AuthContext";
import { getKpiList, getUserIdsByDepartment, KpiUser } from "@/services/api/kpi";

export default function DashboardKpiPage() {
  const { user, isLoadingFetchUser } = useAuth();
  const router = useRouter();

  const [period, setPeriod] = useState<KpiPeriod>("month");
  const [roleFilter, setRoleFilter] = useState<KpiRoleFilter>("all");
  const [users, setUsers] = useState<KpiUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoadingFetchUser || !user) {
      return;
    }

    if (user.role === "DQTT" || user.role === "DQCD") {
      router.replace("/dashboard/kpi/me");
      return;
    }

    const fetchList = async () => {
      setIsLoading(true);

      try {
        const apiRole = roleFilter === "all" ? undefined : roleFilter;
        const kpiResponse = await getKpiList({
          period,
          role: apiRole,
        });

        let nextUsers = [...kpiResponse.data];

        if (user.role === "TO_TRUONG" && user.department) {
          const departmentIds = await getUserIdsByDepartment(user.department);
          nextUsers = nextUsers.filter((item) => departmentIds.has(item.user_id));
        }

        setUsers(nextUsers);
        setSelectedUserId(nextUsers[0]?.user_id ?? null);
      } catch (error) {
        console.error(error);
        toast.error("Không tải được dữ liệu KPI");
      } finally {
        setIsLoading(false);
      }
    };

    fetchList();
  }, [period, roleFilter, user, isLoadingFetchUser, router]);

  return (
    <KpiPageLayout
      users={users}
      selectedUserId={selectedUserId}
      onSelectUser={setSelectedUserId}
      period={period}
      onPeriodChange={setPeriod}
      roleFilter={roleFilter}
      onRoleFilterChange={setRoleFilter}
      isListLoading={isLoading}
    />
  );
}
