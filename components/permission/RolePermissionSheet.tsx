"use client";

import { AlertCircle, Loader2, Lock, Search, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  getRoleErrorMessage,
  isForbiddenError,
  type Permission,
  type PermissionGroup,
  type Role,
  roleApi,
} from "@/services/api/role";
import { getGroupLabel, getPermissionLabel } from "./constants";

interface RolePermissionSheetProps {
  open: boolean;
  role: Role | null;
  onClose: () => void;
}

export function RolePermissionSheet({
  open,
  role,
  onClose,
}: RolePermissionSheetProps) {
  const [groups, setGroups] = useState<PermissionGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [search, setSearch] = useState("");
  /** Id các quyền đang chờ BE phản hồi — dùng để khoá checkbox tương ứng */
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());

  const roleId = role?.id;

  const setPending = useCallback((ids: number[], adding: boolean) => {
    setPendingIds((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (adding) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }, []);

  /** Cập nhật cờ active tại chỗ, không đụng tới thứ tự nhóm của BE */
  const applyActive = useCallback((ids: number[], active: boolean) => {
    const idSet = new Set(ids);
    setGroups((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          idSet.has(item.id) ? { ...item, active } : item,
        ),
      })),
    );
  }, []);

  useEffect(() => {
    if (!open || !roleId) return;

    let active = true;
    setLoading(true);
    setError(null);
    setForbidden(false);
    setSearch("");
    setPendingIds(new Set());

    roleApi
      .getById(roleId)
      .then((detail) => {
        if (active) setGroups(detail.permissions ?? []);
      })
      .catch((err) => {
        if (!active) return;
        setGroups([]);
        setForbidden(isForbiddenError(err));
        setError(getRoleErrorMessage(err, "Không tải được danh sách quyền"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [open, roleId]);

  /**
   * Bật/tắt quyền: cập nhật lạc quan trước cho phản hồi tức thì,
   * lỗi thì revert lại đúng trạng thái cũ.
   */
  const toggle = async (ids: number[], nextActive: boolean) => {
    if (!roleId || ids.length === 0) return;

    applyActive(ids, nextActive);
    setPending(ids, true);

    try {
      if (nextActive) {
        await roleApi.addPermissions(roleId, ids);
      } else {
        await roleApi.removePermissions(roleId, ids);
      }
    } catch (err) {
      applyActive(ids, !nextActive);
      toast.error(getRoleErrorMessage(err, "Cập nhật quyền thất bại"));
    } finally {
      setPending(ids, false);
    }
  };

  const handleTogglePermission = (permission: Permission) =>
    toggle([permission.id], !permission.active);

  const handleToggleGroup = (items: Permission[]) => {
    const allActive = items.every((item) => item.active);
    const targets = allActive ? items : items.filter((item) => !item.active);
    toggle(
      targets.map((item) => item.id),
      !allActive,
    );
  };

  const keyword = search.trim().toLowerCase();
  const filteredGroups = useMemo(() => {
    if (!keyword) return groups;
    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.code.toLowerCase().includes(keyword) ||
            (item.description ?? "").toLowerCase().includes(keyword) ||
            getGroupLabel(group.group).toLowerCase().includes(keyword),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [groups, keyword]);

  const { activeCount, totalCount } = useMemo(() => {
    const all = groups.flatMap((group) => group.items);
    return {
      activeCount: all.filter((item) => item.active).length,
      totalCount: all.length,
    };
  }, [groups]);

  return (
    <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-xl">
        <SheetHeader className="border-b border-gray-100 px-6 py-4">
          <SheetTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#556B2F]" />
            Phân quyền · {role?.name ?? ""}
          </SheetTitle>
          <SheetDescription>
            {loading
              ? "Đang tải danh sách quyền..."
              : error
                ? "Không tải được danh sách quyền"
                : `Đang bật ${activeCount}/${totalCount} quyền. Tick vào ô là lưu ngay.`}
          </SheetDescription>
        </SheetHeader>

        {!loading && !error && totalCount > 0 && (
          <div className="border-b border-gray-100 px-6 py-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Tìm theo mã quyền hoặc mô tả..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex flex-col gap-4">
              {["g1", "g2", "g3"].map((key) => (
                <div key={key} className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-9 w-full" />
                  <Skeleton className="h-9 w-full" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div
              className={cn(
                "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center",
                forbidden
                  ? "border-gray-200 bg-gray-50"
                  : "border-red-200 bg-red-50",
              )}
            >
              {forbidden ? (
                <Lock className="h-10 w-10 text-gray-300" />
              ) : (
                <AlertCircle className="h-10 w-10 text-red-300" />
              )}
              <p
                className={cn(
                  "px-6 text-sm font-medium",
                  forbidden ? "text-gray-500" : "text-red-700",
                )}
              >
                {error}
              </p>
            </div>
          )}

          {!loading && !error && filteredGroups.length === 0 && (
            <p className="py-16 text-center text-sm text-gray-400">
              {totalCount === 0
                ? "Hệ thống chưa khai báo quyền nào"
                : "Không tìm thấy quyền phù hợp"}
            </p>
          )}

          {!loading && !error && filteredGroups.length > 0 && (
            <div className="flex flex-col gap-5">
              {filteredGroups.map((group) => {
                const groupActive = group.items.filter(
                  (item) => item.active,
                ).length;
                const allActive = groupActive === group.items.length;
                const groupPending = group.items.some((item) =>
                  pendingIds.has(item.id),
                );

                return (
                  <section key={group.group}>
                    <div className="mb-2 flex items-center gap-2.5">
                      <Checkbox
                        id={`group-${group.group}`}
                        checked={
                          allActive
                            ? true
                            : groupActive > 0
                              ? "indeterminate"
                              : false
                        }
                        disabled={groupPending}
                        onCheckedChange={() => handleToggleGroup(group.items)}
                        className="data-[state=indeterminate]:border-blue-600 data-[state=indeterminate]:bg-blue-600/40 data-[state=indeterminate]:text-white"
                      />
                      <label
                        htmlFor={`group-${group.group}`}
                        className="cursor-pointer text-sm font-bold text-gray-800"
                      >
                        {getGroupLabel(group.group)}
                      </label>
                      <Badge variant="outline" className="text-gray-500">
                        {groupActive}/{group.items.length}
                      </Badge>
                    </div>

                    <div className="flex flex-col divide-y divide-gray-50 rounded-xl border border-gray-100">
                      {group.items.map((item) => {
                        const isPending = pendingIds.has(item.id);

                        return (
                          <label
                            key={item.id}
                            htmlFor={`permission-${item.id}`}
                            // description của BE để ở tooltip, tránh lặp tên nhóm
                            title={item.description ?? undefined}
                            className={cn(
                              "flex cursor-pointer items-start gap-3 px-3 py-2.5 transition-colors hover:bg-gray-50",
                              isPending && "opacity-60",
                            )}
                          >
                            <Checkbox
                              id={`permission-${item.id}`}
                              checked={item.active}
                              disabled={isPending}
                              onCheckedChange={() =>
                                handleTogglePermission(item)
                              }
                              className="mt-0.5"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-gray-800">
                                {getPermissionLabel(
                                  item.code,
                                  item.description,
                                )}
                              </span>
                              <code className="mt-0.5 block font-mono text-xs text-gray-400">
                                {item.code}
                              </code>
                            </span>
                            {isPending && (
                              <Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-gray-400" />
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
