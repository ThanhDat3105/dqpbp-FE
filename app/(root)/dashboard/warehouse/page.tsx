"use client";

import { useState } from "react";
import {
  Inventory2Outlined,
  CategoryOutlined,
  WarningAmberRounded,
  ReceiptLongOutlined,
  AddBoxOutlined,
  MoveToInboxOutlined,
  AssignmentOutlined,
  BarChartOutlined,
} from "@mui/icons-material";
import clsx from "clsx";
import DialogNhapKho from "@/components/warehouse/DialogNhapKho";
import DialogXuatKho from "@/components/warehouse/DialogXuatKho";
import DialogNhapThem from "@/components/warehouse/DialogNhapThem";
import DialogKiemKe from "@/components/warehouse/DialogKiemKe";
import DialogBaoCao from "@/components/warehouse/DialogBaoCao";
import type { StockItem } from "@/components/warehouse/DialogXuatKho";

// ─── Mock Data ──────────────────────────────────────────────────────────────────

const STATS = [
  {
    id: "total-items",
    label: "Tổng vật phẩm",
    value: "1,250",
    secondary: "↑ 5% so với tháng trước",
    secondaryColor: "text-green-600",
    icon: Inventory2Outlined,
    iconBg: "bg-indigo-50",
    iconColor: "text-indigo-600",
  },
  {
    id: "categories",
    label: "Danh mục",
    value: "8",
    secondary: "8 loại vật phẩm",
    secondaryColor: "text-gray-500",
    icon: CategoryOutlined,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    id: "stock-alerts",
    label: "Cảnh báo kho",
    value: "12",
    secondary: null,
    badge: "+3 mới · Cần xử lý gấp",
    icon: WarningAmberRounded,
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    highlight: true,
  },
  {
    id: "recent-transactions",
    label: "Giao dịch gần đây",
    value: "45",
    secondary: "trong 24h qua",
    secondaryColor: "text-gray-500",
    icon: ReceiptLongOutlined,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

const LOW_STOCK_ITEMS: StockItem[] = [
  {
    id: 1,
    name: "Áo phao cứu sinh",
    category: "Cứu hộ",
    current: 5,
    max: 100,
    status: "critical",
    statusLabel: "Nguy cấp",
  },
  {
    id: 2,
    name: "Bộ đàm Motorola",
    category: "Liên lạc",
    current: 12,
    max: 50,
    status: "low",
    statusLabel: "Thấp",
  },
  {
    id: 3,
    name: "Giày vải bộ đội",
    category: "Quân trang",
    current: 28,
    max: 200,
    status: "warning",
    statusLabel: "Cần chú ý",
  },
  {
    id: 4,
    name: "Đèn pin chuyên dụng",
    category: "Công cụ",
    current: 8,
    max: 60,
    status: "critical",
    statusLabel: "Nguy cấp",
  },
];

const ACTIVITIES = [
  {
    id: 1,
    dotColor: "bg-gray-500",
    title: "Nhập kho 50 Áo mưa rằn ri",
    time: "09:30 AM",
    by: "Ngô Trương Đình",
  },
  {
    id: 2,
    dotColor: "bg-orange-500",
    title: "Xuất kho 20 Mũ cối cho Tổ 3",
    time: "08:15 AM",
    by: "Lý Triệu An",
  },
  {
    id: 3,
    dotColor: "bg-blue-500",
    title: "Kiểm kê Thiết bị y tế",
    time: "Hôm qua",
    by: "Phan Phong Phú",
  },
  {
    id: 4,
    dotColor: "bg-gray-400",
    title: "Cập nhật thông tin trang thiết bị",
    time: "Hôm qua",
    by: "Hệ thống",
  },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ stat }: { stat: (typeof STATS)[0] }) {
  const Icon = stat.icon;
  return (
    <div
      id={`stat-card-${stat.id}`}
      className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{stat.label}</p>
        <span className={clsx("p-2 rounded-lg", stat.iconBg)}>
          <Icon className={clsx("text-xl", stat.iconColor)} />
        </span>
      </div>
      <div>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">
          {stat.value}
        </p>
        {"badge" in stat && stat.badge ? (
          <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
            {stat.badge}
          </span>
        ) : (
          <p className={clsx("text-xs mt-1", stat.secondaryColor)}>
            {stat.secondary}
          </p>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const map: Record<string, string> = {
    critical: "bg-red-100 text-red-700",
    low: "bg-orange-100 text-orange-700",
    warning: "bg-yellow-100 text-yellow-700",
  };
  const dot: Record<string, string> = {
    critical: "bg-red-500",
    low: "bg-orange-500",
    warning: "bg-yellow-500",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
        map[status],
      )}
    >
      <span className={clsx("w-2 h-2 rounded-full shrink-0", dot[status])} />
      {label}
    </span>
  );
}

function StockProgressBar({ current, max }: { current: number; max: number }) {
  const pct = Math.round((current / max) * 100);
  const color =
    pct <= 10
      ? "bg-red-500"
      : pct <= 25
        ? "bg-orange-500"
        : pct <= 40
          ? "bg-yellow-500"
          : "bg-green-500";
  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
        <div
          className={clsx("h-1.5 rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-14 text-right shrink-0">
        {current} / {max}
      </span>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function WarehouseDashboardPage() {
  // Dialog open states
  const [openNhapKho, setOpenNhapKho] = useState(false);
  const [openXuatKho, setOpenXuatKho] = useState(false);
  const [openKiemKe, setOpenKiemKe] = useState(false);
  const [openBaoCao, setOpenBaoCao] = useState(false);
  const [nhapThemItem, setNhapThemItem] = useState<StockItem | null>(null);

  const handleQuickAction = (id: string) => {
    if (id === "nhap-kho") setOpenNhapKho(true);
    else if (id === "xuat-kho") setOpenXuatKho(true);
    else if (id === "kiem-ke") setOpenKiemKe(true);
    else if (id === "bao-cao") setOpenBaoCao(true);
  };

  const QUICK_ACTIONS = [
    {
      id: "nhap-kho",
      label: "Nhập kho",
      icon: AddBoxOutlined,
      color: "text-indigo-600",
      bg: "bg-indigo-50 hover:bg-indigo-100 border-indigo-100",
    },
    {
      id: "xuat-kho",
      label: "Xuất kho",
      icon: MoveToInboxOutlined,
      color: "text-orange-600",
      bg: "bg-orange-50 hover:bg-orange-100 border-orange-100",
    },
    {
      id: "kiem-ke",
      label: "Kiểm kê",
      icon: AssignmentOutlined,
      color: "text-green-600",
      bg: "bg-green-50 hover:bg-green-100 border-green-100",
    },
    {
      id: "bao-cao",
      label: "Báo cáo",
      icon: BarChartOutlined,
      color: "text-violet-600",
      bg: "bg-violet-50 hover:bg-violet-100 border-violet-100",
    },
  ];

  return (
    <>
      {/* ── Dialogs ── */}
      <DialogNhapKho open={openNhapKho} onClose={() => setOpenNhapKho(false)} />
      <DialogXuatKho
        open={openXuatKho}
        onClose={() => setOpenXuatKho(false)}
        inventory={LOW_STOCK_ITEMS}
      />
      <DialogNhapThem
        open={nhapThemItem !== null}
        onClose={() => setNhapThemItem(null)}
        item={nhapThemItem}
      />
      <DialogKiemKe
        open={openKiemKe}
        onClose={() => setOpenKiemKe(false)}
        inventory={LOW_STOCK_ITEMS}
      />
      <DialogBaoCao open={openBaoCao} onClose={() => setOpenBaoCao(false)} />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* ── Page Header ── */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Quản lý Kho
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tổng quan tình trạng kho vật tư và trang thiết bị
          </p>
        </header>

        {/* ── Two-column layout ── */}
        <div className="flex flex-col md:flex-row gap-6 flex-1 overflow-auto">
          {/* ══ LEFT COLUMN (70%) ══ */}
          <div className="flex flex-col gap-6 md:w-[70%] w-full min-w-0">
            {/* Stats Row */}
            <section
              id="stats-row"
              className="grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {STATS.map((stat) => (
                <StatCard key={stat.id} stat={stat} />
              ))}
            </section>

            {/* Alert Banner */}
            <section
              id="alert-banner"
              className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3"
            >
              <WarningAmberRounded className="text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-red-800 text-sm">
                  Cảnh báo: 3 loại vật phẩm dưới mức an toàn nghiêm trọng
                </p>
                <p className="text-red-600 text-xs mt-1">
                  Áo phao cứu sinh &middot; Đèn pin chuyên dụng &middot; Bộ đàm
                  Motorola
                </p>
              </div>
              <a
                href="#"
                className="shrink-0 text-xs font-semibold text-red-700 hover:text-red-900 underline underline-offset-2 whitespace-nowrap transition-colors"
              >
                Xem chi tiết →
              </a>
            </section>

            {/* Low Stock Table */}
            <section
              id="low-stock-table"
              className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-800 text-sm">
                  Vật phẩm sắp hết{" "}
                  <span className="text-gray-400 font-normal">(Top 5)</span>
                </h2>
                <button
                  id="btn-view-all-stock"
                  className="text-xs font-semibold text-[#6B8E23] hover:text-[#556b2f] transition-colors cursor-pointer"
                >
                  Xem tất cả →
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {[
                        "Tên vật phẩm",
                        "Danh mục",
                        "Số lượng",
                        "Trạng thái",
                        "Hành động",
                      ].map((h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LOW_STOCK_ITEMS.map((item, idx) => (
                      <tr
                        key={item.id}
                        className={clsx(
                          "border-b border-gray-50 transition-colors hover:bg-gray-50/70",
                          idx % 2 === 0 ? "bg-white" : "bg-gray-50/40",
                        )}
                      >
                        <td className="px-5 py-3.5">
                          <span className="font-semibold text-gray-800 text-sm">
                            {item.name}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full font-semibold">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StockProgressBar
                            current={item.current}
                            max={item.max}
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge
                            status={item.status}
                            label={item.statusLabel}
                          />
                        </td>
                        <td className="px-5 py-3.5">
                          <button
                            id={`btn-nhap-them-${item.id}`}
                            onClick={() => setNhapThemItem(item)}
                            className="px-3 py-1.5 rounded-lg border border-[#6B8E23] text-[#6B8E23] text-xs font-semibold hover:bg-[#6B8E23] hover:text-white transition-all duration-150 cursor-pointer"
                          >
                            Nhập thêm
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* ══ RIGHT COLUMN (30%) ══ */}
          <div className="flex flex-col gap-6 md:w-[30%] w-full">
            {/* Quick Actions */}
            <section
              id="quick-actions"
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5"
            >
              <h2 className="font-bold text-gray-800 text-sm mb-4">
                Thao tác nhanh
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button
                      key={action.id}
                      id={`btn-quick-${action.id}`}
                      onClick={() => handleQuickAction(action.id)}
                      className={clsx(
                        "flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-150 cursor-pointer group",
                        action.bg,
                      )}
                    >
                      <Icon
                        className={clsx(
                          "text-2xl transition-transform duration-150 group-hover:scale-110",
                          action.color,
                        )}
                      />
                      <span
                        className={clsx("text-xs font-semibold", action.color)}
                      >
                        {action.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Recent Activity Log */}
            <section
              id="recent-activity-log"
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col"
            >
              <h2 className="font-bold text-gray-800 text-sm mb-4">
                Hoạt động gần đây
              </h2>
              <div className="flex flex-col gap-0">
                {ACTIVITIES.map((activity, idx) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span
                        className={clsx(
                          "w-2.5 h-2.5 rounded-full shrink-0 mt-1",
                          activity.dotColor,
                        )}
                      />
                      {idx < ACTIVITIES.length - 1 && (
                        <div className="w-px flex-1 bg-gray-100 my-1" />
                      )}
                    </div>
                    <div className="pb-4 flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 leading-snug">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {activity.time} &middot; Bởi{" "}
                        <span className="text-gray-500 font-medium">
                          {activity.by}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                id="btn-view-all-history"
                className="mt-2 w-full py-2 rounded-lg border border-gray-200 text-xs font-semibold text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors cursor-pointer"
              >
                Xem toàn bộ lịch sử
              </button>
            </section>
          </div>
        </div>
      </main>
    </>
  );
}
