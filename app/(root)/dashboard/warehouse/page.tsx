"use client";

import {
  CategoryOutlined,
  Inventory2Outlined,
  OpenInNewOutlined,
  ReceiptLongOutlined,
  RefreshOutlined,
  WarningAmberRounded,
} from "@mui/icons-material";
import clsx from "clsx";
import Link from "next/link";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatDateTime,
  formatNumber,
  getActionOption,
} from "@/components/warehouse/constants";
import { TableSkeletonRows } from "@/components/warehouse/TableSkeletonRows";
import { WarehouseStatusBadge } from "@/components/warehouse/WarehouseStatusBadge";
import { useWarehouseDashboard } from "@/hooks/useWarehouseDashboard";
import type { WarehouseItem } from "@/services/api/warehouse";

const STATUS_COLORS = {
  IN_STOCK: "#16a34a",
  LOW_STOCK: "#f59e0b",
  OUT_OF_STOCK: "#dc2626",
} as const;

const CHART_BAR_COLOR = "#6B8E23";
const ALERT_COLUMN_COUNT = 4;

/** Timeline chỉ hiện 5 thao tác mới nhất, xem thêm thì sang tab Lịch sử */
const RECENT_LIMIT = 5;
const HISTORY_HREF = "/warehouse?tab=history";

// ─── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  iconBg,
  iconColor,
  loading,
  danger,
}: {
  label: string;
  value: number;
  hint: string;
  icon: typeof Inventory2Outlined;
  iconBg: string;
  iconColor: string;
  loading: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex flex-col gap-3 rounded-xl border bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md",
        danger ? "border-red-200" : "border-gray-200",
      )}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={clsx("rounded-lg p-2", iconBg)}>
          <Icon className={clsx("text-xl", iconColor)} />
        </span>
      </div>
      <div>
        {loading ? (
          <Skeleton className="h-9 w-20" />
        ) : (
          <p
            className={clsx(
              "text-3xl font-bold tracking-tight",
              danger ? "text-red-600" : "text-gray-900",
            )}
          >
            {formatNumber(value)}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      </div>
    </div>
  );
}

/** Tồn kho so với ngưỡng cảnh báo — bar càng ngắn càng gấp */
function StockLevelBar({ item }: { item: WarehouseItem }) {
  const threshold = item.low_stock_threshold;
  const pct =
    threshold > 0
      ? Math.min(100, Math.round((item.quantity / threshold) * 100))
      : item.quantity > 0
        ? 100
        : 0;

  const color =
    item.quantity === 0
      ? "bg-red-500"
      : pct <= 50
        ? "bg-orange-500"
        : "bg-yellow-500";

  return (
    <div className="flex min-w-30 items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-gray-200">
        <div
          className={clsx("h-1.5 rounded-full transition-all", color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-20 shrink-0 text-right text-xs whitespace-nowrap text-gray-500 tabular-nums">
        {formatNumber(item.quantity)} / {formatNumber(threshold)}
      </span>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────

export default function WarehouseDashboardPage() {
  const {
    stats,
    alertItems,
    outOfStockItems,
    transactions24h,
    loading,
    error,
    refetch,
  } = useWarehouseDashboard();

  const summary = stats?.summary;
  const alertCount = (summary?.low_stock ?? 0) + (summary?.out_of_stock ?? 0);

  const statusData = [
    {
      name: "Còn hàng",
      value: summary?.in_stock ?? 0,
      color: STATUS_COLORS.IN_STOCK,
    },
    {
      name: "Sắp hết",
      value: summary?.low_stock ?? 0,
      color: STATUS_COLORS.LOW_STOCK,
    },
    {
      name: "Hết hàng",
      value: summary?.out_of_stock ?? 0,
      color: STATUS_COLORS.OUT_OF_STOCK,
    },
  ].filter((entry) => entry.value > 0);

  const categoryData =
    stats?.by_category.map((row) => ({
      name: row.category,
      value: row.total_quantity,
      items: row.item_count,
    })) ?? [];

  const allRecent = stats?.recent_transactions ?? [];
  const recent = allRecent.slice(0, RECENT_LIMIT);
  const hasMoreRecent = allRecent.length > RECENT_LIMIT;

  return (
    <main className="flex flex-1 flex-col overflow-hidden">
      {/* ── Page Header ── */}
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Dashboard Quản lý Kho
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Tổng quan tình trạng kho vật tư và trang thiết bị
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={refetch}
            disabled={loading}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshOutlined
              className={clsx("text-base", loading && "animate-spin")}
            />
            Làm mới
          </button>
          <Link
            href="/warehouse"
            className="flex items-center gap-1.5 rounded-lg bg-[#556B2F] px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#465e17]"
          >
            <OpenInNewOutlined className="text-base" />
            Quản lý kho
          </Link>
        </div>
      </header>

      {error && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <WarningAmberRounded className="shrink-0 text-red-500" />
          <span className="flex-1">{error}</span>
          <button
            type="button"
            onClick={refetch}
            className="cursor-pointer text-xs font-semibold underline underline-offset-2"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── Two-column layout ── */}
      <div className="flex flex-1 flex-col gap-6 overflow-auto md:flex-row">
        {/* ══ LEFT COLUMN (70%) ══ */}
        <div className="flex w-full min-w-0 flex-col gap-6 md:w-[70%]">
          {/* Stats Row */}
          <section className="grid grid-cols-2 gap-2 md:gap-4 lg:grid-cols-4">
            <StatCard
              label="Tổng vật phẩm"
              value={summary?.total_items ?? 0}
              hint={`${formatNumber(summary?.total_quantity ?? 0)} đơn vị tồn kho`}
              icon={Inventory2Outlined}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              loading={loading}
            />
            <StatCard
              label="Danh mục"
              value={categoryData.length}
              hint="Loại vật phẩm đang quản lý"
              icon={CategoryOutlined}
              iconBg="bg-violet-50"
              iconColor="text-violet-600"
              loading={loading}
            />
            <StatCard
              label="Cảnh báo kho"
              value={alertCount}
              hint={`${formatNumber(summary?.out_of_stock ?? 0)} hết hàng · ${formatNumber(
                summary?.low_stock ?? 0,
              )} sắp hết`}
              icon={WarningAmberRounded}
              iconBg="bg-red-50"
              iconColor="text-red-500"
              loading={loading}
              danger={alertCount > 0}
            />
            <StatCard
              label="Giao dịch gần đây"
              value={transactions24h}
              hint="Trong 24h qua"
              icon={ReceiptLongOutlined}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              loading={loading}
            />
          </section>

          {/* Alert Banner — chỉ hiện khi thực sự có vật phẩm hết hàng */}
          {!loading && outOfStockItems.length > 0 && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <WarningAmberRounded className="mt-0.5 shrink-0 text-red-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-red-800">
                    Cảnh báo: {formatNumber(summary?.out_of_stock ?? 0)} vật
                    phẩm đã hết hàng
                  </p>
                  <p className="mt-1 text-xs text-red-600">
                    {outOfStockItems.map((item) => item.name).join(" · ")}
                  </p>
                </div>
                <Link
                  href="/warehouse"
                  className="shrink-0 text-xs font-semibold whitespace-nowrap text-red-700 underline underline-offset-2 transition-colors hover:text-red-900"
                >
                  Xử lý →
                </Link>
              </div>
            </section>
          )}

          {/* Bảng vật phẩm cần chú ý */}
          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <h2 className="text-sm font-bold text-gray-800">
                Vật phẩm cần nhập thêm{" "}
                <span className="font-normal text-gray-400">
                  (Top {alertItems.length || 5})
                </span>
              </h2>
              <Link
                href="/warehouse"
                className="cursor-pointer text-xs font-semibold text-[#6B8E23] transition-colors hover:text-[#556b2f]"
              >
                Xem tất cả →
              </Link>
            </div>

            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-100 bg-gray-50 hover:bg-gray-50">
                  <TableHead className="px-5">Tên vật phẩm</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Tồn / Ngưỡng</TableHead>
                  <TableHead className="px-5">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && (
                  <TableSkeletonRows rows={4} columns={ALERT_COLUMN_COUNT} />
                )}

                {!loading && alertItems.length === 0 && (
                  <TableRow className="hover:bg-transparent">
                    <TableCell
                      colSpan={ALERT_COLUMN_COUNT}
                      className="py-12 text-center text-sm text-gray-400"
                    >
                      Tất cả vật phẩm đều trên ngưỡng an toàn
                    </TableCell>
                  </TableRow>
                )}

                {!loading &&
                  alertItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="px-5">
                        <span className="text-sm font-semibold text-gray-800">
                          {item.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                          {item.category}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StockLevelBar item={item} />
                      </TableCell>
                      <TableCell className="px-5">
                        <WarehouseStatusBadge
                          status={item.status}
                          label={item.status_label}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </section>

          {/* Tồn kho theo danh mục */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-gray-800">
              Tồn kho theo danh mục
            </h2>

            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : categoryData.length === 0 ? (
              <p className="py-12 text-center text-sm text-gray-400">
                Kho chưa có vật phẩm nào
              </p>
            ) : (
              <ResponsiveContainer
                width="100%"
                height={Math.max(180, categoryData.length * 42)}
              >
                <BarChart
                  data={categoryData}
                  layout="vertical"
                  margin={{ top: 0, right: 24, bottom: 0, left: 8 }}
                >
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                    contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    formatter={(value, _name, entry) => [
                      `${formatNumber(Number(value))} đơn vị · ${
                        (entry?.payload as { items?: number })?.items ?? 0
                      } vật phẩm`,
                      "Tồn kho",
                    ]}
                  />
                  <Bar
                    dataKey="value"
                    fill={CHART_BAR_COLOR}
                    radius={[0, 4, 4, 0]}
                    barSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>
        </div>

        {/* ══ RIGHT COLUMN (30%) ══ */}
        <div className="flex w-full flex-col gap-6 md:w-[30%]">
          {/* Tình trạng tồn kho */}
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-gray-800">
              Tình trạng tồn kho
            </h2>

            {loading ? (
              <Skeleton className="mx-auto h-37.5 w-37.5 rounded-full" />
            ) : statusData.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                Chưa có dữ liệu
              </p>
            ) : (
              <>
                <div className="flex justify-center">
                  <PieChart width={150} height={150}>
                    <Pie
                      data={statusData}
                      cx={75}
                      cy={75}
                      innerRadius={42}
                      outerRadius={70}
                      dataKey="value"
                      strokeWidth={1}
                      stroke="#fff"
                    >
                      {statusData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [
                        `${formatNumber(Number(value))} vật phẩm`,
                        name,
                      ]}
                      contentStyle={{ borderRadius: 8, fontSize: 12 }}
                    />
                  </PieChart>
                </div>

                <div className="mt-3 flex flex-col gap-2">
                  {statusData.map((entry) => (
                    <div
                      key={entry.name}
                      className="flex items-center gap-2 text-xs"
                    >
                      <span
                        className="h-2.5 w-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="flex-1 text-gray-500">{entry.name}</span>
                      <span className="font-bold text-gray-800 tabular-nums">
                        {formatNumber(entry.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Hoạt động gần đây */}
          <section className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-gray-800">
              Hoạt động gần đây{" "}
              {!loading && recent.length > 0 && (
                <span className="font-normal text-gray-400">
                  ({recent.length} thao tác mới nhất)
                </span>
              )}
            </h2>

            {loading && (
              <div className="flex flex-col gap-3">
                {["s1", "s2", "s3", "s4", "s5"].map((key) => (
                  <Skeleton key={key} className="h-12 w-full" />
                ))}
              </div>
            )}

            {!loading && recent.length === 0 && (
              <p className="py-8 text-center text-sm text-gray-400">
                Chưa có thao tác nào
              </p>
            )}

            {!loading && recent.length > 0 && (
              <div className="flex flex-col">
                {recent.map((transaction, idx) => {
                  const option = getActionOption(transaction.action);
                  const change = transaction.quantity_change;

                  return (
                    <div key={transaction.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <span
                          className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              change > 0
                                ? STATUS_COLORS.IN_STOCK
                                : change < 0
                                  ? "#ea580c"
                                  : "#9ca3af",
                          }}
                        />
                        {idx < recent.length - 1 && (
                          <div className="my-1 w-px flex-1 bg-gray-100" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pb-4">
                        <p className="text-sm leading-snug font-semibold text-gray-800">
                          {transaction.action_label || option?.label}
                          {change !== 0 && (
                            <span
                              className={clsx(
                                "ml-1 tabular-nums",
                                change > 0
                                  ? "text-green-600"
                                  : "text-orange-600",
                              )}
                            >
                              {change > 0 ? "+" : ""}
                              {formatNumber(change)}
                            </span>
                          )}{" "}
                          <span className="font-normal text-gray-600">
                            {transaction.item_name}
                          </span>
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">
                          {formatDateTime(transaction.created_at)}
                          {transaction.performed_by_name && (
                            <>
                              {" · Bởi "}
                              <span className="font-medium text-gray-500">
                                {transaction.performed_by_name}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              href={HISTORY_HREF}
              className="mt-2 w-full rounded-lg border border-gray-200 py-2 text-center text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              {hasMoreRecent
                ? "Xem toàn bộ lịch sử đã có →"
                : "Xem toàn bộ lịch sử →"}
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
