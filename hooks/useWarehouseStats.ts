"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getWarehouseErrorMessage,
  type WarehouseStats,
  warehouseApi,
} from "@/services/api/warehouse";

export function useWarehouseStats() {
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await warehouseApi.getStats());
    } catch (err) {
      setError(getWarehouseErrorMessage(err, "Không tải được thống kê kho"));
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
