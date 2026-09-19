"use client";

import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import PaginationCustom from "@/components/ui/AppPagination";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useWarehouseItems } from "@/hooks/useWarehouseItems";
import type { WarehouseItem } from "@/services/api/warehouse";
import {
  canManageWarehouse,
  canWriteWarehouse,
  formatNumber,
} from "./constants";
import { DialogDeleteItem } from "./DialogDeleteItem";
import { DialogItemForm } from "./DialogItemForm";
import { DialogItemHistory } from "./DialogItemHistory";
import {
  DialogStockMovement,
  type StockMovementMode,
} from "./DialogStockMovement";
import { WarehouseFilters } from "./WarehouseFilters";
import { type WarehouseRowAction, WarehouseTable } from "./WarehouseTable";

type ActiveDialog = "form" | "delete" | "history" | StockMovementMode | null;

export function WarehouseListPage() {
  const { user } = useAuth();
  const canWrite = canWriteWarehouse(user?.role);
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
    sortBy,
    sortOrder,
    setPage,
    handleFilterChange,
    resetFilters,
    toggleSort,
    refetch,
  } = useWarehouseItems(10);

  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [selectedItem, setSelectedItem] = useState<WarehouseItem | null>(null);
  // Giữ lại mode cuối cùng để tiêu đề dialog không đổi giữa lúc đóng
  const [movementMode, setMovementMode] = useState<StockMovementMode>("import");

  const openDialog = (dialog: ActiveDialog, item: WarehouseItem | null) => {
    setSelectedItem(item);
    setActiveDialog(dialog);
  };

  const closeDialog = () => setActiveDialog(null);

  const handleRowAction = (action: WarehouseRowAction, item: WarehouseItem) => {
    if (action === "import" || action === "export" || action === "adjust") {
      setMovementMode(action);
      openDialog(action, item);
      return;
    }
    openDialog(action === "edit" ? "form" : action, item);
  };

  const isMovementDialog =
    activeDialog === "import" ||
    activeDialog === "export" ||
    activeDialog === "adjust";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách kho</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {loading
              ? "Đang tải..."
              : `${formatNumber(total)} vật phẩm${
                  hasActiveFilters ? " khớp bộ lọc" : ""
                }`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={loading ? "animate-spin" : undefined} />
            Làm mới
          </Button>

          {canWrite && (
            <Button
              size="lg"
              className="bg-[#556B2F] font-semibold text-white hover:bg-[#465e17]"
              onClick={() => openDialog("form", null)}
            >
              <Plus />
              Thêm vật phẩm
            </Button>
          )}
        </div>
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

      <WarehouseTable
        items={items}
        loading={loading}
        sortBy={sortBy}
        sortOrder={sortOrder}
        canWrite={canWrite}
        canManage={canManage}
        onSort={toggleSort}
        onAction={handleRowAction}
      />

      <PaginationCustom
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
      />

      <DialogItemForm
        open={activeDialog === "form"}
        item={selectedItem}
        onClose={closeDialog}
        onSuccess={refetch}
      />

      <DialogStockMovement
        open={isMovementDialog}
        mode={movementMode}
        item={selectedItem}
        onClose={closeDialog}
        onSuccess={refetch}
      />

      <DialogItemHistory
        open={activeDialog === "history"}
        item={selectedItem}
        onClose={closeDialog}
      />

      <DialogDeleteItem
        open={activeDialog === "delete"}
        item={selectedItem}
        onClose={closeDialog}
        onSuccess={refetch}
      />
    </div>
  );
}
