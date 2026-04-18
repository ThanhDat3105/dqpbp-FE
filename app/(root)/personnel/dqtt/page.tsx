"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Edit,
  Eye,
  Shield,
  MapPin,
  User as UserIcon,
} from "lucide-react";
import { User, MOCK_USERS, DEPARTMENT_MAP, UserStatus } from "@/types/user";
import { Button } from "@/components/ui/button";

const ROLE_OPTIONS = ["Tất cả", "DQTT", "DQCD", "CHI_HUY", "TO_TRUONG"];
const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "on_duty", label: "Hoạt động" },
  { value: "training", label: "Huấn luyện" },
  { value: "on_leave", label: "Nghỉ phép" },
  { value: "other", label: "Khác (Giải ngũ)" },
];

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("Tất cả");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredUsers = useMemo(() => {
    return MOCK_USERS.filter((user) => {
      // Name or email/unit code search
      const matchSearch =
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        (user.email &&
          user.email.toLowerCase().includes(search.toLowerCase())) ||
        (user.unit_code &&
          user.unit_code.toLowerCase().includes(search.toLowerCase()));

      const matchRole = roleFilter === "Tất cả" || user.role === roleFilter;
      const matchStatus =
        statusFilter === "all" || user.status === statusFilter;

      return matchSearch && matchRole && matchStatus;
    });
  }, [search, roleFilter, statusFilter]);

  const renderStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "on_duty":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Hoạt động
          </span>
        );
      case "on_leave":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            Nghỉ phép
          </span>
        );
      case "training":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Huấn luyện
          </span>
        );
      case "other":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Đã giải ngũ
          </span>
        );
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Quản lý nhân sự</h1>
        <p className="text-slate-500 mt-1">
          Danh sách cán bộ, chiến sĩ dân quân
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200/60 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, email, mã..."
            className="w-full pl-9 pr-4 h-10 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex w-full sm:w-auto gap-3">
          <select
            className="flex-1 sm:w-40 h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <select
            className="flex-1 sm:w-44 h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredUsers.map((user) => (
            <Link
              href={`/personnel/dqtt/${user.id}`}
              key={user.id}
              className="group bg-white rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="relative">
                    {user.avatar_url ? (
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm">
                        <img
                          src={user.avatar_url}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center">
                        <UserIcon className="w-8 h-8 text-slate-400" />
                      </div>
                    )}
                    {/* Status Dot */}
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        user.is_active ? "bg-emerald-500" : "bg-slate-300"
                      }`}
                    ></span>
                  </div>

                  {/* Role Badge */}
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-bold rounded-lg tracking-wide uppercase">
                    {user.role}
                  </span>
                </div>

                <div className="mb-1">
                  <h3 className="text-lg font-bold text-slate-800 line-clamp-1">
                    {user.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-slate-500 mt-1">
                    <Shield className="w-3.5 h-3.5" />
                    <span className="text-sm line-clamp-1">
                      {DEPARTMENT_MAP[user.department_id] || "Không phân bổ"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium font-mono">
                    {user.unit_code || `#${user.id}`}
                  </span>
                  {renderStatusBadge(user.status)}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-slate-50/50 border-t border-slate-100 flex items-center gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 shadow-sm border-slate-200"
                >
                  <Link href={`/users/${user.id}`}>
                    <Eye className="w-4 h-4 mr-2" />
                    Chi tiết
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white hover:bg-slate-50 text-slate-600 shadow-sm border-slate-200 shrink-0"
                  onClick={() => console.log("Edit user", user.id)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <UserIcon className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-slate-800 font-medium">Không tìm thấy nhân sự</h3>
          <p className="text-slate-500 text-sm mt-1">
            Hãy thử thay đổi điều kiện lọc
          </p>
        </div>
      )}
    </div>
  );
}
