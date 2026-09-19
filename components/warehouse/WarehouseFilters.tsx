"use client";

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWarehouseCategories } from "@/hooks/useWarehouseCategories";
import type { WarehouseItemFilters } from "@/hooks/useWarehouseItems";
import type {
  WarehouseCategory,
  WarehouseStatus,
} from "@/services/api/warehouse";
import { STATUS_OPTIONS } from "./constants";

// Select của Radix không nhận value="" nên dùng sentinel cho lựa chọn "tất cả"
const ALL = "__all__";

interface WarehouseFiltersProps {
  filters: WarehouseItemFilters;
  hasActiveFilters: boolean;
  onFilterChange: <K extends keyof WarehouseItemFilters>(
    key: K,
    value: WarehouseItemFilters[K],
  ) => void;
  onReset: () => void;
}

export function WarehouseFilters({
  filters,
  hasActiveFilters,
  onFilterChange,
  onReset,
}: WarehouseFiltersProps) {
  const { categories } = useWarehouseCategories();

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="relative w-full flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Tìm kiếm theo tên vật phẩm..."
          className="w-full pl-10"
          value={filters.search}
          onChange={(e) => onFilterChange("search", e.target.value)}
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          value={filters.category || ALL}
          onValueChange={(value) =>
            onFilterChange(
              "category",
              value === ALL ? "" : (value as WarehouseCategory),
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tất cả danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tất cả danh mục</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="w-full sm:w-44">
        <Select
          value={filters.status || ALL}
          onValueChange={(value) =>
            onFilterChange(
              "status",
              value === ALL ? "" : (value as WarehouseStatus),
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Tất cả trạng thái</SelectItem>
            {STATUS_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="shrink-0 text-gray-500"
        >
          <X className="h-4 w-4" />
          Xoá lọc
        </Button>
      )}
    </div>
  );
}
