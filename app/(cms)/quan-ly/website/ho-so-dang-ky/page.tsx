"use client";

import { FileCheck2, Phone, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  type AdminRegistration,
  type RegistrationCategory,
  websiteRegistrationAPI,
} from "@/services/api/website-registration";

const categories: Array<{
  value: "all" | RegistrationCategory;
  label: string;
}> = [
  { value: "all", label: "Tất cả" },
  { value: "tsqs", label: "TSQS" },
  { value: "tuoi17", label: "Tuổi 17" },
  { value: "tinhnguyen", label: "Tình nguyện NVQS" },
  { value: "dqtt", label: "DQTT" },
];

export const categoryLabel: Record<RegistrationCategory, string> = {
  tsqs: "TSQS",
  tuoi17: "Tuổi 17",
  tinhnguyen: "Tình nguyện NVQS",
  dqtt: "DQTT",
  doituongchinhsach: "Đối tượng chính sách",
  siquandubi: "Sĩ quan dự bị",
};

const statusLabel = {
  pending: "Mới gửi",
  processing: "Đang xử lý",
  done: "Đã tiếp nhận",
  rejected: "Từ chối",
  approved: "Đã duyệt",
};

const statusClass = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  done: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
  approved: "bg-green-50 text-green-700 border-green-200",
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function RegistrationAdminPage() {
  const [data, setData] = useState<AdminRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<"all" | RegistrationCategory>("all");
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    websiteRegistrationAPI
      .getAdminRegistrations()
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return data.filter((item) => {
      const matchCategory = category === "all" || item.category === category;
      const matchKeyword =
        !normalizedKeyword ||
        item.full_name.toLowerCase().includes(normalizedKeyword) ||
        item.phone.includes(normalizedKeyword) ||
        item.address.toLowerCase().includes(normalizedKeyword);
      return matchCategory && matchKeyword;
    });
  }, [category, data, keyword]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Quản lý hồ sơ đăng ký
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Theo dõi hồ sơ TSQS, Tuổi 17, Tình nguyện NVQS và DQTT gửi từ
            website public.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm tên, SĐT, địa chỉ..."
            className="w-64 bg-transparent text-sm outline-none dark:text-white"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
        {categories.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setCategory(item.value)}
            className={`h-9 rounded-lg px-3 text-sm font-semibold transition-colors ${
              category === item.value
                ? "bg-[#546a2f] text-white"
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="grid grid-cols-[1.1fr_0.8fr_0.9fr_0.8fr_0.8fr] gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3 text-xs font-bold uppercase tracking-wide text-gray-500 dark:border-gray-700 dark:bg-gray-950">
          <span>Người đăng ký</span>
          <span>Danh mục</span>
          <span>Liên hệ</span>
          <span>Trạng thái</span>
          <span>Ngày gửi</span>
        </div>

        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#546a2f] border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center text-gray-400">
            <FileCheck2 className="h-10 w-10" />
            <p className="mt-2 text-sm">Chưa có hồ sơ phù hợp.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1.1fr_0.8fr_0.9fr_0.8fr_0.8fr] gap-4 px-5 py-4 text-sm text-gray-700 dark:text-gray-200"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <UserRound className="h-4 w-4 text-[#546a2f]" />
                    <span className="font-semibold">{item.full_name}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {item.address}
                  </p>
                </div>
                <div>
                  <span className="rounded-full bg-[#546a2f]/10 px-2 py-1 text-xs font-bold text-[#546a2f]">
                    {categoryLabel[item.category]}
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="flex items-center gap-1 font-semibold text-gray-700 dark:text-gray-200">
                    <Phone className="h-3.5 w-3.5" />
                    {item.phone}
                  </p>
                  <p className="text-gray-500">
                    Người thân: {item.guardian_phone}
                  </p>
                </div>
                <div>
                  <span
                    className={`rounded-full border px-2 py-1 text-xs font-bold ${statusClass[item.status]}`}
                  >
                    {statusLabel[item.status]}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(item.created_at)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
