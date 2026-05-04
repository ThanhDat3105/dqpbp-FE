"use client";

import { useState, useMemo } from "react";
import { Plus, FileX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WarehouseFilters } from "./WarehouseFilters";
import { WarehouseItemCard } from "./WarehouseItemCard";
import { mockItems } from "./mockData";

export function WarehouseListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const filteredItems = useMemo(() => {
    return mockItems.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === "Tất cả" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const handleAddItem = () => {
    toast("Tính năng đang phát triển");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Danh Sách Kho Hàng</h1>
        <Button
          className="bg-[#556B2F] hover:bg-[#465e17] cursor-pointer text-white font-semibold py-2 px-4 rounded-lg shadow-sm"
          onClick={handleAddItem}
        >
          <Plus className="w-5 h-5 mr-1" />
          Thêm thiết bị
        </Button>
      </div>

      <WarehouseFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredItems.map((item) => (
            <WarehouseItemCard key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
          <FileX className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 font-medium">
            Không tìm thấy thiết bị nào
          </p>
        </div>
      )}
    </div>
  );
}
