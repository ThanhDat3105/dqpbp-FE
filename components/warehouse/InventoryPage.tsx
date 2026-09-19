"use client";

import {
  AlertCircle,
  ClipboardCheck,
  FileX,
  Lock,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import PaginationCustom from "@/components/ui/AppPagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthContext";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import type { WarehouseItem } from "@/services/api/warehouse";
import { canManageWarehouse, formatDateTime, formatNumber } from "./constants";
import { DialogStockMovement } from "./DialogStockMovement";
import { TableSkeletonRows } from "./TableSkeletonRows";
import { WarehouseFilters } from "./WarehouseFilters";
import { WarehouseStatusBadge } from "./WarehouseStatusBadge";

const COLUMN_COUNT = 6;

export function InventoryPage() {
  const { user } = useAuth();
  const canManage = canManageWarehouse(user?.role);

  const {
    items,
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
  } = useWarehouseItems(10);

  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);

  // Kiểm kê ghi đè số lượng nên BE chỉ cho CHI_HUY / ADMIN
  if (!canManage) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white py-20">
        <Lock className="h-12 w-12 text-gray-300" />
        <p className="font-medium text-gray-500">
          Chỉ Chỉ huy hoặc Quản trị viên mới thực hiện kiểm kê
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kiểm kê kho</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Đối chiếu số lượng thực tế với sổ sách — chênh lệch sẽ được ghi vào
            lịch sử
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

      <WarehouseFilters
        filters={filters}
        hasActiveFilters={hasActiveFilters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
      />

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
              <TableHead>Tên vật phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead className="text-right">Tồn theo sổ sách</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Cập nhật lần cuối</TableHead>
              <TableHead className="text-right">Kiểm kê</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && <TableSkeletonRows rows={5} columns={COLUMN_COUNT} />}

            {!loading && items.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={COLUMN_COUNT} className="py-16">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <FileX className="h-12 w-12 text-gray-300" />
                    <p className="font-medium text-gray-500">
                      Không có vật phẩm nào để kiểm kê
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!loading &&
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-gray-900">
                    {item.name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {item.category}
                  </TableCell>
                  <TableCell className="text-right font-semibold text-gray-900 tabular-nums">
                    {formatNumber(item.quantity)}
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      {item.unit}
                    </span>
                  </TableCell>
                  <TableCell>
                    <WarehouseStatusBadge
                      status={item.status}
                      label={item.status_label}
                    />
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap text-gray-500">
                    {formatDateTime(item.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-violet-700"
                      onClick={() => setSelectedItem(item)}
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      Kiểm kê
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <PaginationCustom
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
      />

      <DialogStockMovement
        open={Boolean(selectedItem)}
        mode="adjust"
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onSuccess={refetch}
      />
    </div>
  );
}
