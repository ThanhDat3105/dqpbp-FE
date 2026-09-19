"use client";

import { AlertCircle, FileX, RefreshCw, Search, X } from "lucide-react";
import PaginationCustom from "@/components/ui/AppPagination";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useWarehouseTransactions } from "@/hooks/useWarehouseTransactions";
import { cn } from "@/lib/utils";
import type { WarehouseAction } from "@/services/api/warehouse";
import {
  ACTION_OPTIONS,
  formatDateTime,
  formatNumber,
  getActionOption,
} from "./constants";
import { TableSkeletonRows } from "./TableSkeletonRows";

const ALL = "__all__";
const COLUMN_COUNT = 6;

export function HistoryPage() {
  const {
    transactions,
    total,
    page,
    limit,
    loading,
    error,
    filters,
    hasActiveFilters,
    setPage,
    handleFilterChange,
    resetFilters,
    refetch,
  } = useWarehouseTransactions(20);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Lịch sử xuất nhập kho
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {loading
              ? "Đang tải..."
              : `${formatNumber(total)} lượt thao tác được ghi nhận`}
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

      <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="relative w-full flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm theo tên vật phẩm..."
            className="w-full pl-10"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        <div className="w-full lg:w-52">
          <Select
            value={filters.action || ALL}
            onValueChange={(value) =>
              handleFilterChange(
                "action",
                value === ALL ? "" : (value as WarehouseAction),
              )
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Tất cả hành động" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Tất cả hành động</SelectItem>
              {ACTION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="date"
            aria-label="Từ ngày"
            className="w-full lg:w-40"
            value={filters.from_date}
            onChange={(e) => handleFilterChange("from_date", e.target.value)}
          />
          <span className="text-sm text-gray-400">—</span>
          <Input
            type="date"
            aria-label="Đến ngày"
            className="w-full lg:w-40"
            value={filters.to_date}
            onChange={(e) => handleFilterChange("to_date", e.target.value)}
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="shrink-0 text-gray-500"
          >
            <X className="h-4 w-4" />
            Xoá lọc
          </Button>
        )}
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

      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
              <TableHead>Thời gian</TableHead>
              <TableHead>Vật phẩm</TableHead>
              <TableHead>Hành động</TableHead>
              <TableHead className="text-right">Thay đổi</TableHead>
              <TableHead className="text-right">Tồn kho</TableHead>
              <TableHead>Người thực hiện</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && <TableSkeletonRows rows={6} columns={COLUMN_COUNT} />}

            {!loading && transactions.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={COLUMN_COUNT} className="py-16">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FileX className="h-12 w-12 text-gray-300" />
                    <p className="font-medium text-gray-500">
                      Chưa có thao tác nào được ghi nhận
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              transactions.map((transaction) => {
                const option = getActionOption(transaction.action);
                const change = transaction.quantity_change;

                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="text-sm whitespace-nowrap text-gray-500">
                      {formatDateTime(transaction.created_at)}
                    </TableCell>

                    <TableCell>
                      <p className="font-semibold text-gray-900">
                        {transaction.item_name}
                      </p>
                      {transaction.note && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                          {transaction.note}
                        </p>
                      )}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(option?.className, "font-semibold")}
                      >
                        {transaction.action_label || option?.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-semibold tabular-nums",
                          change > 0 && "text-green-700",
                          change < 0 && "text-red-600",
                          change === 0 && "text-gray-400",
                        )}
                      >
                        {change > 0 ? "+" : ""}
                        {change === 0 ? "—" : formatNumber(change)}
                      </span>
                    </TableCell>

                    <TableCell className="text-right text-sm whitespace-nowrap text-gray-600 tabular-nums">
                      {formatNumber(transaction.quantity_before)} →{" "}
                      <strong className="text-gray-900">
                        {formatNumber(transaction.quantity_after)}
                      </strong>
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

      <PaginationCustom
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
      />
    </div>
  );
}
