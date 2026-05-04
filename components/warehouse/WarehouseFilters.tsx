"use client";

import { Search } from "lucide-react";
import { Input as ShadcnInput } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WarehouseFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function WarehouseFilters({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
}: WarehouseFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <ShadcnInput
          placeholder="Tìm kiếm thiết bị..."
          className="pl-10 w-full"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-[200px]">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Tất cả danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tất cả">Tất cả danh mục</SelectItem>
            <SelectItem value="Quân trang">Quân trang</SelectItem>
            <SelectItem value="Liên lạc">Liên lạc</SelectItem>
            <SelectItem value="Cứu hộ">Cứu hộ</SelectItem>
            <SelectItem value="Vũ khí">Vũ khí</SelectItem>
            <SelectItem value="Y tế">Y tế</SelectItem>
            <SelectItem value="Khác">Khác</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
