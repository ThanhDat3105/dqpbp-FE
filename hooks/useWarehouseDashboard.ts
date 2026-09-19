"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getWarehouseErrorMessage,
  type WarehouseItem,
  type WarehouseStats,
  warehouseApi,
} from "@/services/api/warehouse";

const ALERT_LIMIT = 5;
const DAY_MS = 24 * 60 * 60 * 1000;

interface WarehouseDashboardData {
  stats: WarehouseStats | null;
  /** Hết hàng trước, rồi tới sắp hết — cả hai đều xếp theo tồn kho tăng dần */
  alertItems: WarehouseItem[];
  outOfStockItems: WarehouseItem[];
  transactions24h: number;
}

const EMPTY: WarehouseDashboardData = {
  stats: null,
  alertItems: [],
  outOfStockItems: [],
  transactions24h: 0,
};

/**
 * Gom toàn bộ số liệu cho dashboard kho trong một lần fetch song song.
 * Chỉ đọc — dashboard không có thao tác ghi.
 */
export function useWarehouseDashboard() {
  const [data, setData] = useState<WarehouseDashboardData>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const since = new Date(Date.now() - DAY_MS).toISOString();

      const [stats, outOfStock, lowStock, recent] = await Promise.all([
        warehouseApi.getStats(),
        warehouseApi.getList({
          status: "OUT_OF_STOCK",
          limit: ALERT_LIMIT,
          sort_by: "quantity",
          sort_order: "ASC",
        }),
        warehouseApi.getList({
          status: "LOW_STOCK",
          limit: ALERT_LIMIT,
          sort_by: "quantity",
          sort_order: "ASC",
        }),
        // limit 1 vì chỉ cần con số total của 24h gần nhất
        warehouseApi.getTransactions({ from_date: since, limit: 1 }),
      ]);

      setData({
        stats,
        alertItems: [...outOfStock.data, ...lowStock.data].slice(
          0,
          ALERT_LIMIT,
        ),
        outOfStockItems: outOfStock.data,
        transactions24h: recent.total,
      });
    } catch (err) {
      setError(getWarehouseErrorMessage(err, "Không tải được số liệu kho"));
      setData(EMPTY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { ...data, loading, error, refetch: fetchDashboard };
}
