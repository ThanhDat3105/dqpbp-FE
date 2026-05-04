"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, Eye, User as UserIcon } from "lucide-react";
import { DEPARTMENT_MAP, UserStatus } from "@/types/user";
import { useAuth } from "@/context/AuthContext";
import { fetchUsers, UserWithKpi } from "@/services/api/user";

export default function UsersPage() {
  const { token } = useAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("Tất cả");
  const [users, setUsers] = useState<UserWithKpi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retrySeed, setRetrySeed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchUsers(
          {
            role: roleFilter,
            search: debouncedSearch,
            status: statusFilter,
            // department: departmentFilter, // Truyền vào API nếu backend hỗ trợ
            includeKpi: true,
          },
          token ?? undefined,
        );

        setUsers(data);
      } catch {
        setError("Không tải được danh sách nhân sự");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [
    roleFilter,
    statusFilter,
    departmentFilter,
    debouncedSearch,
    token,
    retrySeed,
  ]);

  // Helper function lấy màu cho trạng thái
  const getStatusConfig = (status: UserStatus) => {
    switch (status) {
      case "on_duty":
        return {
          dot: "bg-emerald-500",
          text: "text-slate-600",
          label: "Hoạt động",
        };
      case "on_leave":
        return {
          dot: "bg-amber-400",
          text: "text-slate-600",
          label: "Nghỉ phép",
        };
      case "training":
        return {
          dot: "bg-blue-500",
          text: "text-slate-600",
          label: "Huấn luyện",
        };
      case "other":
      default:
        return {
          dot: "bg-slate-400",
          text: "text-slate-500",
          label: "Đã giải ngũ",
        };
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Filters Area - Giống thiết kế hình ảnh */}
      <div className="relative flex-1 min-w-62.5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên, mã hồ sơ..."
          className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-50"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Content Area */}
      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-600 text-sm font-medium">{error}</p>
          <button
            onClick={() => setRetrySeed((prev) => prev + 1)}
            className="mt-3 text-sm text-red-600 hover:text-red-700 underline font-medium"
          >
            Thử lại
          </button>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center animate-pulse shadow-sm"
            >
              <div className="w-20 h-20 rounded-full bg-slate-100 mb-4" />
              <div className="h-5 bg-slate-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-slate-100 rounded w-1/2 mb-4" />
              <div className="flex gap-2 w-full justify-center">
                <div className="h-6 w-16 bg-slate-100 rounded-full" />
                <div className="h-6 w-20 bg-slate-100 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => {
            const statusConfig = getStatusConfig(user.status);

            return (
              <Link
                href={`/personnel/dqtt/${user.id}`}
                key={user.id}
                className="bg-white rounded-2xl border border-slate-100/80 shadow hover:shadow-lg hover:cursor-pointer transition-all duration-300 p-5 relative flex flex-col items-center"
              >
                {/* Avatar */}
                <div className="relative mt-2">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-21 h-21 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="w-21 h-21 rounded-full bg-[#556B2F] flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-slate-300" />
                    </div>
                  )}
                  <span
                    className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-[2.5px] border-white ${statusConfig.dot}`}
                  />
                </div>

                {/* Info */}
                <h3 className="text-lg font-bold text-slate-800 mt-4 text-center line-clamp-1 w-full px-4">
                  {user.name}
                </h3>
                <p className="text-sm font-medium text-slate-500 mt-0.5 text-center line-clamp-1 w-full px-2">
                  {user.department_name ||
                    DEPARTMENT_MAP[user.department_id] ||
                    "Chưa phân bổ"}
                </p>

                {/* Badges */}
                <div className="flex items-center justify-center gap-2 mt-3.5">
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full uppercase tracking-wider">
                    {user.role}
                  </span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 text-xs font-medium rounded-full flex items-center gap-1.5 border border-slate-100/50">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}
                    />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Actions (Chi tiết & Sửa) */}
                <div className="w-full mt-6 flex gap-2">
                  <Link
                    href={`/personnel/dqtt/${user.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl text-sm font-semibold text-slate-700 transition-all shadow-sm"
                  >
                    <Eye className="w-4 h-4 text-slate-400" /> Chi tiết
                  </Link>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-6 h-6 text-slate-300" />
          </div>
          <h3 className="text-slate-800 font-bold text-lg">
            Không tìm thấy nhân sự
          </h3>
          <p className="text-slate-500 mt-1 text-sm">
            Thử thay đổi từ khóa hoặc bộ lọc để xem kết quả khác.
          </p>
        </div>
      )}
    </div>
  );
}
