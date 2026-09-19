"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getWarehouseErrorMessage,
  type WarehouseCategory,
  type WarehouseItem,
  type WarehouseListParams,
  type WarehouseStatus,
  warehouseApi,
} from "@/services/api/warehouse";
import useDebounce from "./useDebounce";

export interface WarehouseItemFilters {
  search: string;
  category: WarehouseCategory | "";
  status: WarehouseStatus | "";
}

type SortBy = NonNullable<WarehouseListParams["sort_by"]>;
type SortOrder = NonNullable<WarehouseListParams["sort_order"]>;

const EMPTY_FILTERS: WarehouseItemFilters = {
  search: "",
  category: "",
  status: "",
};

export function useWarehouseItems(limit = 10) {
  const [items, setItems] = useState<WarehouseItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<WarehouseItemFilters>(EMPTY_FILTERS);
  const [sortBy, setSortBy] = useState<SortBy>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("DESC");

  // Chỉ debounce ô tìm kiếm; select danh mục / trạng thái áp dụng ngay
  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await warehouseApi.getList({
        page,
        limit,
        search: debouncedSearch.trim(),
        category: filters.category,
        status: filters.status,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setItems(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(getWarehouseErrorMessage(err, "Không tải được danh sách kho"));
      setItems([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    debouncedSearch,
    filters.category,
    filters.status,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Đổi bộ lọc thì luôn quay về trang 1, tránh rơi vào trang trống
  const handleFilterChange = useCallback(
    <K extends keyof WarehouseItemFilters>(
      key: K,
      value: WarehouseItemFilters[K],
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

  const toggleSort = useCallback(
    (column: SortBy) => {
      if (sortBy === column) {
        setSortOrder((prev) => (prev === "ASC" ? "DESC" : "ASC"));
      } else {
        setSortBy(column);
        setSortOrder("ASC");
      }
      setPage(1);
    },
    [sortBy],
  );

  const hasActiveFilters =
    Boolean(filters.search) ||
    Boolean(filters.category) ||
    Boolean(filters.status);

  return {
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
    refetch: fetchItems,
  };
}
