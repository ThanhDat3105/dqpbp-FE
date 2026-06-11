"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DepartmentInterface } from "@/services/api/department";

interface Props {
  search: string;
  departmentId: string;
  departments: DepartmentInterface[];
  onSearchChange: (v: string) => void;
  onDepartmentChange: (v: string) => void;
  onClear: () => void;
}

export function DocumentFilters({
  search,
  departmentId,
  departments,
  onSearchChange,
  onDepartmentChange,
  onClear,
}: Props) {
  const hasFilters = search !== "" || departmentId !== "all";

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-50 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <Input
          placeholder="Tìm tên tài liệu, mô tả..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Select value={departmentId} onValueChange={onDepartmentChange}>
        <SelectTrigger className="w-50 bg-white">
          <SelectValue placeholder="Tất cả tổ" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tất cả tổ</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d.id} value={String(d.id)}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
          Xóa lọc
        </button>
      )}
    </div>
  );
}
