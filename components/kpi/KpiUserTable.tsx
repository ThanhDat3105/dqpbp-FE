"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { KpiUser } from "@/services/api/kpi";

interface KpiUserTableProps {
  users: KpiUser[];
  selectedUserId: number | null;
  onSelect: (userId: number) => void;
  isLoading?: boolean;
}

const getRoleBadgeClass = (role: string) => {
  if (role === "DQTT") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }
  return "bg-orange-100 text-orange-700 border-orange-200";
};

const getProgressTone = (value: number) => {
  if (value >= 70) {
    return "bg-emerald-500";
  }
  if (value >= 40) {
    return "bg-amber-500";
  }
  return "bg-red-500";
};

export function KpiUserTable({
  users,
  selectedUserId,
  onSelect,
  isLoading = false,
}: KpiUserTableProps) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "DQTT" | "DQCD">("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const nameMatched = user.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const roleMatched = roleFilter === "all" || user.role === roleFilter;

      return nameMatched && roleMatched;
    });
  }, [users, search, roleFilter]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Tìm theo tên..."
          className="h-8"
        />

        <Select
          value={roleFilter}
          onValueChange={(value: "all" | "DQTT" | "DQCD") =>
            setRoleFilter(value)
          }
        >
          <SelectTrigger className="h-8 w-27.5">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="DQTT">DQTT</SelectItem>
            <SelectItem value="DQCD">DQCD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-auto">
        <table className="w-full min-w-135 text-sm">
          <thead className="text-xs text-slate-500">
            <tr className="border-b border-slate-200">
              <th className="px-2 py-2 text-left font-medium">#</th>
              <th className="px-2 py-2 text-left font-medium">Tên</th>
              <th className="px-2 py-2 text-left font-medium">Role</th>
              <th className="px-2 py-2 text-left font-medium">Hoàn thành</th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 7 }).map((_, index) => (
                  <tr
                    key={`skeleton-${index}`}
                    className="border-b border-slate-100"
                  >
                    <td className="px-2 py-2">
                      <Skeleton className="h-4 w-6" />
                    </td>
                    <td className="px-2 py-2">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-2 py-2">
                      <Skeleton className="h-5 w-14 rounded-full" />
                    </td>
                    <td className="px-2 py-2">
                      <Skeleton className="h-2 w-32" />
                    </td>
                  </tr>
                ))
              : filteredUsers.map((user, index) => (
                  <tr
                    key={user.user_id}
                    className={cn(
                      "cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50",
                      selectedUserId === user.user_id && "bg-blue-50/70",
                    )}
                    onClick={() => onSelect(user.user_id)}
                  >
                    <td className="px-2 py-2 text-xs text-slate-500">
                      {index + 1}
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                          {user.name
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                        <p className="max-w-45 truncate font-medium text-slate-700">
                          {user.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-2 py-2">
                      <Badge
                        className={cn("border", getRoleBadgeClass(user.role))}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-2">
                        <Progress
                          value={user.completion_rate}
                          indicatorClassName={getProgressTone(
                            user.completion_rate,
                          )}
                          className="h-2"
                        />
                        <span className="w-10 text-xs text-slate-600">
                          {user.completion_rate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      {!isLoading && filteredUsers.length === 0 && (
        <p className="py-6 text-center text-sm text-slate-500">
          Không có dữ liệu phù hợp
        </p>
      )}
    </div>
  );
}
