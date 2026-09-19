"use client";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ClipboardCheck,
  FileX,
  History,
  MoreHorizontal,
  PackageMinus,
  PackagePlus,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type {
  WarehouseItem,
  WarehouseListParams,
} from "@/services/api/warehouse";
import { formatNumber } from "./constants";
import { TableSkeletonRows } from "./TableSkeletonRows";
import { WarehouseStatusBadge } from "./WarehouseStatusBadge";

type SortBy = NonNullable<WarehouseListParams["sort_by"]>;

export type WarehouseRowAction =
  | "import"
  | "export"
  | "adjust"
  | "edit"
  | "delete"
  | "history";

interface RowActionConfig {
  key: WarehouseRowAction;
  label: string;
  icon: typeof PackagePlus;
  visible: boolean;
  className?: string;
  disabled?: boolean;
  /** Nhãn phụ giải thích vì sao thao tác bị khoá */
  hint?: string;
}

interface WarehouseTableProps {
  items: WarehouseItem[];
  loading: boolean;
  sortBy: SortBy;
  sortOrder: "ASC" | "DESC";
  canWrite: boolean;
  canManage: boolean;
  onSort: (column: SortBy) => void;
  onAction: (action: WarehouseRowAction, item: WarehouseItem) => void;
}

const COLUMNS: { key: SortBy | null; label: string; className?: string }[] = [
  { key: "name", label: "Tên vật phẩm" },
  { key: "category", label: "Danh mục" },
  { key: "quantity", label: "Số lượng", className: "text-right" },
  { key: "status", label: "Trạng thái" },
  { key: null, label: "Cập nhật bởi" },
  { key: "updated_at", label: "Cập nhật lúc" },
];

export function WarehouseTable({
  items,
  loading,
  sortBy,
  sortOrder,
  canWrite,
  canManage,
  onSort,
  onAction,
}: WarehouseTableProps) {
  // +1 cho cột thao tác — luôn hiện vì user chỉ-đọc vẫn xem được lịch sử
  const columnCount = COLUMNS.length + 1;

  const renderSortIcon = (column: SortBy | null) => {
    if (!column) return null;
    if (sortBy !== column) {
      return <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />;
    }
    return sortOrder === "ASC" ? (
      <ArrowUp className="h-3.5 w-3.5 text-gray-600" />
    ) : (
      <ArrowDown className="h-3.5 w-3.5 text-gray-600" />
    );
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
            {COLUMNS.map((column) => (
              <TableHead key={column.label} className={column.className}>
                {column.key ? (
                  <button
                    type="button"
                    onClick={() => onSort(column.key as SortBy)}
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1.5 uppercase transition-colors hover:text-gray-900",
                      column.className === "text-right" && "flex-row-reverse",
                    )}
                  >
                    {column.label}
                    {renderSortIcon(column.key)}
                  </button>
                ) : (
                  column.label
                )}
              </TableHead>
            ))}
            <TableHead className="w-16 text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading && <TableSkeletonRows rows={5} columns={columnCount} />}

          {!loading && items.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columnCount} className="py-16">
                <div className="flex flex-col items-center justify-center gap-3">
                  <FileX className="h-12 w-12 text-gray-300" />
                  <p className="font-medium text-gray-500">
                    Không tìm thấy vật phẩm nào
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!loading &&
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <p className="font-semibold text-gray-900">{item.name}</p>
                  {item.note && (
                    <p className="mt-0.5 line-clamp-1 text-xs text-gray-400">
                      {item.note}
                    </p>
                  )}
                </TableCell>

                <TableCell className="text-gray-600">{item.category}</TableCell>

                <TableCell className="text-right">
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      item.is_low_stock ? "text-red-600" : "text-gray-900",
                    )}
                  >
                    {formatNumber(item.quantity)}
                  </span>
                  <span className="ml-1 text-xs text-gray-400">
                    {item.unit}
                  </span>
                  <p className="mt-0.5 text-xs text-gray-400">
                    Ngưỡng: {formatNumber(item.low_stock_threshold)}
                  </p>
                </TableCell>

                <TableCell>
                  <WarehouseStatusBadge
                    status={item.status}
                    label={item.status_label}
                  />
                </TableCell>

                <TableCell className="text-gray-600">
                  {item.updated_by_name || item.created_by_name || "—"}
                </TableCell>

                <TableCell className="text-sm whitespace-nowrap text-gray-500">
                  {new Date(item.updated_at).toLocaleDateString("vi-VN")}
                </TableCell>

                <TableCell className="text-right">
                  <RowActions
                    item={item}
                    canWrite={canWrite}
                    canManage={canManage}
                    onAction={onAction}
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}

function RowActions({
  item,
  canWrite,
  canManage,
  onAction,
}: {
  item: WarehouseItem;
  canWrite: boolean;
  canManage: boolean;
  onAction: (action: WarehouseRowAction, item: WarehouseItem) => void;
}) {
  const allActions: RowActionConfig[] = [
    {
      key: "history",
      label: "Xem lịch sử",
      icon: History,
      // Mọi user đã đăng nhập đều đọc được lịch sử
      visible: true,
      className: "text-gray-700",
    },
    {
      key: "import",
      label: "Nhập thêm",
      icon: PackagePlus,
      visible: canWrite,
      className: "text-green-700",
    },
    {
      key: "export",
      label: "Xuất kho",
      icon: PackageMinus,
      visible: canWrite,
      className: "text-orange-700",
      disabled: item.quantity <= 0,
      hint: "Hết hàng",
    },
    {
      key: "adjust",
      label: "Kiểm kê",
      icon: ClipboardCheck,
      visible: canManage,
      className: "text-violet-700",
    },
    {
      key: "edit",
      label: "Sửa thông tin",
      icon: Pencil,
      visible: canWrite,
      className: "text-gray-700",
    },
    {
      key: "delete",
      label: "Xoá vật phẩm",
      icon: Trash2,
      visible: canManage,
      className: "text-red-600",
    },
  ];

  const actions = allActions.filter((action) => action.visible);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="Mở thao tác">
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-48 p-1">
        {actions.map((action) => (
          <button
            key={action.key}
            type="button"
            disabled={action.disabled}
            onClick={() => onAction(action.key, item)}
            className={cn(
              "flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40",
              action.className,
            )}
          >
            <action.icon className="h-4 w-4" />
            {action.label}
            {action.disabled && action.hint && (
              <span className="ml-auto text-xs text-gray-400">
                {action.hint}
              </span>
            )}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
