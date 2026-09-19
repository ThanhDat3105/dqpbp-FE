"use client";

import {
  AlertCircle,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useDebounce from "@/hooks/useDebounce";
import {
  getRoleErrorMessage,
  isForbiddenError,
  type Role,
  roleApi,
} from "@/services/api/role";
import { CreateRoleDialog } from "./CreateRoleDialog";
import { RolePermissionSheet } from "./RolePermissionSheet";

const COLUMN_COUNT = 3;
const SKELETON_ROWS = ["r1", "r2", "r3", "r4"];
const SKELETON_CELLS = ["c1", "c2", "c3"];

export function RolePermissionPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState<Role | null>(null);

  const debouncedSearch = useDebounce(search, 400);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    setForbidden(false);
    try {
      setRoles(await roleApi.getAll(debouncedSearch));
    } catch (err) {
      setRoles([]);
      setForbidden(isForbiddenError(err));
      setError(getRoleErrorMessage(err, "Không tải được danh sách vai trò"));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const openSheet = (role: Role) => {
    setSelectedRole(role);
    setSheetOpen(true);
  };

  /** Vừa tạo xong thì nạp lại danh sách và xếp hàng mở bảng phân quyền cho role mới */
  const handleCreated = (role: Role) => {
    fetchRoles();
    setPendingRole(role);
  };

  /**
   * Dialog và Sheet đều là modal của Radix — mở chồng ngay trong cùng một tick
   * làm kẹt scroll-lock, nên đợi dialog đóng hẳn rồi mới mở sheet.
   */
  useEffect(() => {
    if (createOpen || !pendingRole) return;

    const timer = setTimeout(() => {
      setSelectedRole(pendingRole);
      setSheetOpen(true);
      setPendingRole(null);
    }, 220);

    return () => clearTimeout(timer);
  }, [createOpen, pendingRole]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phân quyền</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Chọn một vai trò để bật/tắt quyền truy cập cho vai trò đó
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={fetchRoles}
            disabled={loading}
          >
            <RefreshCw className={loading ? "animate-spin" : undefined} />
            Làm mới
          </Button>

          <Button
            size="lg"
            className="bg-[#556B2F] text-white hover:bg-[#465e17]"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Tạo vai trò
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm vai trò theo tên hoặc mô tả..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div
          className={
            forbidden
              ? "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white py-16"
              : "flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700"
          }
        >
          {forbidden ? (
            <>
              <Lock className="h-12 w-12 text-gray-300" />
              <p className="font-medium text-gray-500">
                Tài khoản của bạn không có quyền xem danh sách vai trò
              </p>
              <p className="text-xs text-gray-400">Cần quyền role::read</p>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="flex-1">{error}</span>
              <Button variant="ghost" size="sm" onClick={fetchRoles}>
                Thử lại
              </Button>
            </>
          )}
        </div>
      )}

      {!error && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                <TableHead>Vai trò</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead className="w-40 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading &&
                SKELETON_ROWS.map((rowKey) => (
                  <TableRow key={rowKey} className="hover:bg-transparent">
                    {SKELETON_CELLS.map((cellKey) => (
                      <TableCell key={`${rowKey}-${cellKey}`}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}

              {!loading && roles.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="py-16 text-center text-sm text-gray-400"
                  >
                    {search.trim() ? (
                      "Không tìm thấy vai trò phù hợp"
                    ) : (
                      <span className="flex flex-col items-center gap-3">
                        Chưa có vai trò nào
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCreateOpen(true)}
                        >
                          <Plus className="h-4 w-4" />
                          Tạo vai trò đầu tiên
                        </Button>
                      </span>
                    )}
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <span className="font-semibold text-gray-900">
                        {role.name}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {role.description || (
                        <span className="text-gray-300">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="bg-[#556B2F] text-white hover:bg-[#465e17]"
                        onClick={() => openSheet(role)}
                      >
                        <ShieldCheck className="h-4 w-4" />
                        Phân quyền
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateRoleDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />

      <RolePermissionSheet
        open={sheetOpen}
        role={selectedRole}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}
