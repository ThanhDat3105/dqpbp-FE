"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MOCK_USERS, DEPARTMENT_MAP } from "@/types/user";
import {
  ArrowLeft,
  Edit,
  FileDown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Hash,
  Shield,
  Award,
  Clock,
  History,
  Box,
  GraduationCap,
  FileText,
  CheckCircle2,
  AlertCircle,
  UserCircle2,
} from "lucide-react";

const MOCK_ACTIVITIES = [
  {
    id: 1,
    name: "Tuần tra an ninh trật tự Lễ 30/4",
    date: "2024-04-30T20:00:00Z",
    status: "completed",
  },
  {
    id: 2,
    name: "Họp giao ban định kỳ tháng",
    date: "2024-04-15T08:30:00Z",
    status: "attended",
  },
  {
    id: 3,
    name: "Hỗ trợ điều tiết giao thông",
    date: "2024-04-10T17:00:00Z",
    status: "completed",
  },
];

const MOCK_INVENTORY = [
  { id: 1, name: "Bộ đàm Motorola", code: "BD-001", status: "good" },
  {
    id: 2,
    name: "Công cụ hỗ trợ (Gậy cao su)",
    code: "GCS-005",
    status: "good",
  },
  { id: 3, name: "Đèn pin siêu sáng", code: "DP-012", status: "needs_check" },
];

const MOCK_TRAINING = [
  { id: 1, subject: "Điều lệnh đội ngũ", score: 9.5 },
  { id: 2, subject: "Bắn súng AR-15", score: 8.0 },
  { id: 3, subject: "Võ thuật cận chiến", score: 8.5 },
];

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idStr = params.id as string;
  const user = MOCK_USERS.find((u) => u.id === Number(idStr)) || MOCK_USERS[0]; // fallback cho preview

  const [activeTab, setActiveTab] = useState("history");
  const [isActive, setIsActive] = useState(user.is_active);

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return "---";
    return new Date(isoStr).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTimeInfo = (isoStr: string) => {
    return new Date(isoStr).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/users")}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            Chi tiết nhân sự
          </h1>
          <p className="text-sm text-slate-500 flex items-center gap-2">
            Danh sách nhân sự <span className="text-slate-300">/</span>{" "}
            {user.name}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* SIDEBAR (Left) */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {/* Cover */}
            <div className="h-28 bg-linear-to-r from-blue-600 to-indigo-700 relative">
              {/* Optional background pattern/image here */}
            </div>

            <div className="px-5 pb-5 -mt-12 text-center">
              <div className="relative inline-block">
                <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-slate-100 mx-auto shadow-md">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-12 h-12 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>

              <div className="mt-3">
                <h2 className="text-xl font-bold text-slate-800">
                  {user.name}
                </h2>
                <p className="text-blue-600 font-medium text-sm mt-0.5">
                  {user.military_rank || user.role}
                </p>
              </div>

              {/* Status Toggle */}
              <div className="mt-5 flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-sm font-medium text-slate-700">
                  Trạng thái HĐ
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>

              <div className="mt-5 flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-lg transition-colors">
                  <Edit className="w-4 h-4" /> Sửa
                </button>
                <button className="flex items-center justify-center gap-2 py-2 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium rounded-lg transition-colors">
                  <FileDown className="w-4 h-4" /> PDF
                </button>
              </div>
            </div>
          </div>

          {/* Personal Info Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-slate-400" />
              Thông tin cá nhân
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <Hash className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Mã định danh
                  </p>
                  <p className="text-sm text-slate-800 font-mono mt-0.5">
                    {user.unit_code || `${user.role}-${user.id}`}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Ngày sinh
                  </p>
                  <p className="text-sm text-slate-800 mt-0.5">
                    {formatDate(user.date_of_birth)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Số điện thoại
                  </p>
                  <p className="text-sm text-slate-800 mt-0.5">
                    {user.phone || "---"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Email</p>
                  <p className="text-sm text-slate-800 mt-0.5 break-all">
                    {user.email || "---"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Địa chỉ</p>
                  <p className="text-sm text-slate-800 mt-0.5 leading-snug">
                    {user.address || "---"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Management Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              Đơn vị quản lý
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Tên đơn vị
                  </p>
                  <p className="text-sm text-slate-800 font-medium mt-0.5">
                    {DEPARTMENT_MAP[user.department_id] || "Chưa phân bổ"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Ngày nhập ngũ / Tham gia
                  </p>
                  <p className="text-sm text-slate-800 mt-0.5">
                    {formatDate(user.enlistment_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Award className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Cấp bậc</p>
                  <p className="text-sm text-slate-800 mt-0.5">
                    {user.military_rank || "---"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT (Right) */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full overflow-hidden flex flex-col">
            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-slate-200 hide-scrollbar px-2 pt-2">
              {[
                { id: "history", label: "Lịch sử hoạt động", icon: History },
                { id: "inventory", label: "Thiết bị được giao", icon: Box },
                {
                  id: "training",
                  label: "Hồ sơ huấn luyện",
                  icon: GraduationCap,
                },
                { id: "documents", label: "Tài liệu", icon: FileText },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-lg"
                      : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-t-lg"
                  }`}
                >
                  <tab.icon
                    className={`w-4 h-4 ${activeTab === tab.id ? "text-blue-600" : "text-slate-400"}`}
                  />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 flex-1 bg-slate-50/30">
              {/* Lịch sử hoạt động */}
              {activeTab === "history" && (
                <div className="max-w-2xl">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">
                    Timeline hoạt động gần đây
                  </h3>
                  <div className="relative pl-6 border-l-2 border-slate-200 space-y-8">
                    {MOCK_ACTIVITIES.map((acc, index) => (
                      <div key={acc.id} className="relative">
                        {/* Bullet */}
                        <div className="absolute -left-[31px] bg-white p-1 rounded-full">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              acc.status === "completed"
                                ? "bg-emerald-500"
                                : "bg-blue-500"
                            }`}
                          ></div>
                        </div>

                        <div className="bg-white border text-sm border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                            <span className="font-semibold text-slate-800">
                              {acc.name}
                            </span>
                            <span
                              className={`self-start inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                acc.status === "completed"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-blue-50 text-blue-700"
                              }`}
                            >
                              {acc.status === "completed"
                                ? "Hoàn thành"
                                : "Đã điểm danh"}
                            </span>
                          </div>
                          <p className="text-slate-500 text-xs flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTimeInfo(acc.date)}
                          </p>
                        </div>
                      </div>
                    ))}

                    <div className="relative">
                      <div className="absolute -left-[31px] bg-slate-50 p-1 rounded-full">
                        <div className="w-3 h-3 rounded-full border-2 border-slate-300 bg-white"></div>
                      </div>
                      <p className="text-sm text-slate-400 font-medium">
                        Xem thêm lịch sử cũ...
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Thiết bị được giao */}
              {activeTab === "inventory" && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-800">
                      Danh sách thiết bị đang quản lý
                    </h3>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                          <tr>
                            <th className="px-4 py-3">Mã số</th>
                            <th className="px-4 py-3">Tên thiết bị</th>
                            <th className="px-4 py-3 text-center">
                              Trạng thái
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {MOCK_INVENTORY.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-50/50">
                              <td className="px-4 py-3 font-mono text-slate-600">
                                {item.code}
                              </td>
                              <td className="px-4 py-3 font-medium text-slate-800">
                                {item.name}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {item.status === "good" ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs font-medium">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Tốt
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full text-xs font-medium">
                                    <AlertCircle className="w-3.5 h-3.5" /> Cần
                                    kiểm tra
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Hồ sơ huấn luyện */}
              {activeTab === "training" && (
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4">
                    Kết quả huấn luyện gần nhất
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {MOCK_TRAINING.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-500 mb-1">
                            Môn huấn luyện
                          </p>
                          <p className="font-bold text-slate-800 line-clamp-1">
                            {item.subject}
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 border-4 border-blue-50 bg-blue-100 text-blue-700 font-bold text-lg">
                          {item.score}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tài liệu */}
              {activeTab === "documents" && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-800">
                    Chưa có tài liệu đính kèm
                  </h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-sm">
                    Hiện chưa có tài liệu, scan hồ sơ nào được số hóa và gán cho
                    nhân sự này.
                  </p>
                  <button className="mt-6 px-4 py-2 border border-slate-300 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                    Tải lên tài liệu
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Dummy Icon since it's used inside the cover image fallback
function UserIcon({ className }: { className?: string }) {
  return <UserCircle2 className={className} />;
}
