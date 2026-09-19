"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  getWarehouseErrorMessage,
  type WarehouseItem,
  type WarehouseTransaction,
  warehouseApi,
} from "@/services/api/warehouse";
import { formatDateTime, formatNumber, getActionOption } from "./constants";
import { TableSkeletonRows } from "./TableSkeletonRows";

const LIMIT = 10;
const COLUMN_COUNT = 5;

interface DialogItemHistoryProps {
  open: boolean;
  item: WarehouseItem | null;
  onClose: () => void;
}

export function DialogItemHistory({
  open,
  item,
  onClose,
}: DialogItemHistoryProps) {
  const [transactions, setTransactions] = useState<WarehouseTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const itemId = item?.id;

  const fetchHistory = useCallback(async () => {
    if (!itemId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await warehouseApi.getItemTransactions(itemId, {
        page,
        limit: LIMIT,
      });
      setTransactions(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(
        getWarehouseErrorMessage(err, "Không tải được lịch sử vật phẩm"),
      );
      setTransactions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [itemId, page]);

  // Mở lại dialog cho vật phẩm khác thì quay về trang 1
  useEffect(() => {
    if (open) setPage(1);
  }, [open]);

  useEffect(() => {
    if (open) fetchHistory();
  }, [open, fetchHistory]);

  if (!item) return null;

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Lịch sử &quot;{item.name}&quot;</DialogTitle>
          <DialogDescription>
            {loading
              ? "Đang tải..."
              : `${formatNumber(total)} thao tác — tồn kho hiện tại ${formatNumber(
                  item.quantity,
                )} ${item.unit}`}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-gray-100">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                <TableHead>Thời gian</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead className="text-right">Thay đổi</TableHead>
                <TableHead className="text-right">Tồn kho</TableHead>
                <TableHead>Người thực hiện</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && <TableSkeletonRows rows={4} columns={COLUMN_COUNT} />}

              {!loading && transactions.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="py-10 text-center text-gray-400"
                  >
                    Chưa có thao tác nào
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
                        <Badge
                          variant="outline"
                          className={cn(option?.className, "font-semibold")}
                        >
                          {transaction.action_label || option?.label}
                        </Badge>
                        {transaction.note && (
                          <p className="mt-1 line-clamp-1 text-xs text-gray-400">
                            {transaction.note}
                          </p>
                        )}
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

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-gray-500">
              Trang {page}/{totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Sau
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
