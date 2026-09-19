"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getWarehouseErrorMessage,
  type WarehouseAction,
  type WarehouseTransaction,
  warehouseApi,
} from "@/services/api/warehouse";
import useDebounce from "./useDebounce";

export interface WarehouseTransactionFilters {
  search: string;
  action: WarehouseAction | "";
  from_date: string;
  to_date: string;
}

const EMPTY_FILTERS: WarehouseTransactionFilters = {
  search: "",
  action: "",
  from_date: "",
  to_date: "",
};

export function useWarehouseTransactions(limit = 20) {
  const [transactions, setTransactions] = useState<WarehouseTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] =
    useState<WarehouseTransactionFilters>(EMPTY_FILTERS);

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await warehouseApi.getTransactions({
        page,
        limit,
        search: debouncedSearch.trim(),
        action: filters.action,
        // to_date là ngày trần: cộng hết ngày để không cắt mất giao dịch trong ngày
        from_date: filters.from_date || undefined,
        to_date: filters.to_date ? `${filters.to_date}T23:59:59` : undefined,
      });
      setTransactions(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(getWarehouseErrorMessage(err, "Không tải được lịch sử kho"));
      setTransactions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    debouncedSearch,
    filters.action,
    filters.from_date,
    filters.to_date,
  ]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleFilterChange = useCallback(
    <K extends keyof WarehouseTransactionFilters>(
      key: K,
      value: WarehouseTransactionFilters[K],
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    [],
  );

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return {
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
    refetch: fetchTransactions,
  };
}
