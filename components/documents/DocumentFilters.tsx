"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface DocumentFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export function DocumentFilters({
  selectedCategory,
  onCategoryChange,
}: DocumentFiltersProps) {
  return (
    <div className="flex items-center space-x-4">
      <div className="w-[200px]">
        <Select value={selectedCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Tất cả">Tất cả</SelectItem>
            <SelectItem value="Huấn luyện">Huấn luyện</SelectItem>
            <SelectItem value="Hành chính">Hành chính</SelectItem>
            <SelectItem value="Báo cáo hoạt động">Báo cáo hoạt động</SelectItem>
            <SelectItem value="Văn bản hành chính">
              Văn bản hành chính
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="rounded-full px-6 bg-white">
        Loại tài liệu
      </Button>
    </div>
  );
}
