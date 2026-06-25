"use client";

import { RegistrationCategory } from "@/services/api/website-registration";
import { useRegistrations } from "@/hooks/useRegistrations";
import { RegistrationTable } from "@/components/registration/RegistrationTable";
import { RegistrationMobileList } from "@/components/registration/RegistrationMobileList";
import Loading from "@/components/Loaing";

const CATEGORY_OPTIONS: { value: RegistrationCategory | ""; label: string }[] =
  [
    { value: "", label: "Tất cả" },
    { value: "tsqs", label: "Tuyển sinh quân sự" },
    { value: "tuoi17", label: "Tuổi 17" },
    { value: "tinhnguyen", label: "Tình nguyện" },
    { value: "dqtt", label: "Dân quân tự vệ" },
  ];

export default function HoSoDangKyPage() {
  const { registrations, loading, filters, handleFilterChange } =
    useRegistrations();

  return (
    <main className="flex-1 flex flex-col">
      <header>
        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ đăng ký</h1>
        <p className="text-sm text-gray-500 mt-1">
          Danh sách đơn đăng ký từ cổng thông tin
        </p>
      </header>

      <div className="pt-4 flex-1 flex flex-col overflow-hidden">
        {/* Filter bar */}
        <div className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 mb-4 flex-wrap">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Loại đăng ký
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                handleFilterChange("category", e.target.value as RegistrationCategory | "")
              }
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6B8E23] cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Họ tên
            </label>
            <input
              type="text"
              value={filters.full_name}
              onChange={(e) => handleFilterChange("full_name", e.target.value)}
              placeholder="Tìm theo tên..."
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6B8E23] w-44"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Số điện thoại
            </label>
            <input
              type="text"
              value={filters.phone}
              onChange={(e) => handleFilterChange("phone", e.target.value)}
              placeholder="Tìm theo SĐT..."
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6B8E23] w-40"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
              Địa chỉ
            </label>
            <input
              type="text"
              value={filters.address}
              onChange={(e) => handleFilterChange("address", e.target.value)}
              placeholder="Tìm theo địa chỉ..."
              className="text-sm border border-gray-300 rounded-md px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#6B8E23] w-44"
            />
          </div>

          {!loading && (
            <span className="sm:ml-auto text-sm text-gray-500">
              {registrations.length} kết quả
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loading />
          </div>
        ) : registrations.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Không có hồ sơ nào phù hợp.
          </div>
        ) : (
          <>
            <RegistrationMobileList registrations={registrations} />
            <RegistrationTable registrations={registrations} />
          </>
        )}
      </div>
    </main>
  );
}
