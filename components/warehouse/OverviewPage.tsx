"use client";

import {
  AlertCircle,
  AlertTriangle,
  Archive,
  Layers,
  PackageX,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWarehouseStats } from "@/hooks/useWarehouseStats";
import { cn } from "@/lib/utils";
import { formatDateTime, formatNumber, getActionOption } from "./constants";
import { TableSkeletonRows } from "./TableSkeletonRows";

export function OverviewPage() {
  const { stats, loading, error, refetch } = useWarehouseStats();

  const cards = [
    {
      key: "total_items",
      label: "Tổng vật phẩm",
      value: stats?.summary.total_items ?? 0,
      hint: `${formatNumber(stats?.summary.total_quantity ?? 0)} đơn vị tồn kho`,
      icon: Archive,
      iconClass: "bg-slate-100 text-slate-600",
    },
    {
      key: "in_stock",
      label: "Còn hàng",
      value: stats?.summary.in_stock ?? 0,
      hint: "Trên ngưỡng cảnh báo",
      icon: Layers,
      iconClass: "bg-green-50 text-green-600",
    },
    {
      key: "low_stock",
      label: "Sắp hết",
      value: stats?.summary.low_stock ?? 0,
      hint: "Cần lên kế hoạch nhập thêm",
      icon: AlertTriangle,
      iconClass: "bg-amber-50 text-amber-600",
      highlight: (stats?.summary.low_stock ?? 0) > 0,
    },
    {
      key: "out_of_stock",
      label: "Hết hàng",
      value: stats?.summary.out_of_stock ?? 0,
      hint: "Tồn kho bằng 0",
      icon: PackageX,
      iconClass: "bg-red-50 text-red-600",
      highlight: (stats?.summary.out_of_stock ?? 0) > 0,
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan kho</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Tình trạng tồn kho và các thao tác gần đây
          </p>
        </div>

        <Button
          variant="outline"
          size="lg"
          onClick={refetch}
          disabled={loading}
        >
          <RefreshCw className={loading ? "animate-spin" : undefined} />
          Làm mới
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <Button variant="ghost" size="sm" onClick={refetch}>
            Thử lại
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.key}
            className={cn(
              "rounded-xl border bg-white p-4 shadow-sm",
              card.highlight ? "border-amber-200" : "border-gray-100",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  {card.label}
                </p>
                {loading ? (
                  <Skeleton className="mt-2 h-8 w-16" />
                ) : (
                  <p className="mt-1 text-3xl font-bold text-gray-900 tabular-nums">
                    {formatNumber(card.value)}
                  </p>
                )}
                <p className="mt-1 line-clamp-1 text-xs text-gray-400">
                  {card.hint}
                </p>
              </div>
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                  card.iconClass,
                )}
              >
                <card.icon className="h-5 w-5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm lg:col-span-2">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="font-semibold text-gray-900">Theo danh mục</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                <TableHead>Danh mục</TableHead>
                <TableHead className="text-right">Vật phẩm</TableHead>
                <TableHead className="text-right">Số lượng</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableSkeletonRows rows={4} columns={3} />}

              {!loading && (stats?.by_category.length ?? 0) === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={3}
                    className="py-10 text-center text-gray-400"
                  >
                    Kho chưa có vật phẩm nào
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                stats?.by_category.map((row) => (
                  <TableRow key={row.category}>
                    <TableCell className="font-medium text-gray-800">
                      {row.category}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(row.item_count)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900 tabular-nums">
                      {formatNumber(row.total_quantity)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm lg:col-span-3">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="font-semibold text-gray-900">Thao tác gần đây</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                <TableHead>Thời gian</TableHead>
                <TableHead>Vật phẩm</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead className="text-right">Thay đổi</TableHead>
                <TableHead>Người thực hiện</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableSkeletonRows rows={5} columns={5} />}

              {!loading && (stats?.recent_transactions.length ?? 0) === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-gray-400"
                  >
                    Chưa có thao tác nào
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                stats?.recent_transactions.map((transaction) => {
                  const option = getActionOption(transaction.action);
                  const change = transaction.quantity_change;

                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm whitespace-nowrap text-gray-500">
                        {formatDateTime(transaction.created_at)}
                      </TableCell>
                      <TableCell className="font-medium text-gray-800">
                        {transaction.item_name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(option?.className, "font-semibold")}
                        >
                          {transaction.action_label || option?.label}
                        </Badge>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right font-semibold tabular-nums",
                          change > 0 && "text-green-700",
                          change < 0 && "text-red-600",
                          change === 0 && "text-gray-400",
                        )}
                      >
                        {change > 0 ? "+" : ""}
                        {change === 0 ? "—" : formatNumber(change)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {transaction.performed_by_name || "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
