"use client";

import { Archive, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { WarehouseItem } from "./types";
import { cn } from "@/lib/utils";

interface WarehouseItemCardProps {
  item: WarehouseItem;
}

export function WarehouseItemCard({ item }: WarehouseItemCardProps) {
  const isLowStock = item.stock <= item.lowStockThreshold;

  const handleAction = () => {
    toast("Tính năng đang phát triển");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group transition-all hover:shadow-md">
      {/* Image / Icon Area */}
      <div className="h-[130px] bg-gray-100 relative flex items-center justify-center">
        <Archive className="w-12 h-12 text-gray-300" />

        {isLowStock && (
          <span className="absolute top-3 right-3 bg-red-100 text-red-600 text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
            Sắp hết
          </span>
        )}
      </div>

      {/* Content Area */}
      <div className="px-3 pt-3 pb-0 flex-1">
        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
          {item.name}
        </h3>
        <p className="text-gray-500 text-sm mb-3">{item.category}</p>

        <div className="flex justify-between items-center text-sm pb-3 border-b border-gray-100">
          <span className="text-gray-500">Tồn kho</span>
          <span
            className={cn(
              "font-medium",
              isLowStock ? "text-red-600" : "text-gray-900",
            )}
          >
            {item.stock} {item.unit}
          </span>
        </div>
      </div>

      {/* Action Area */}
      <div className="p-3 flex gap-2">
        <Button
          variant="ghost"
          className="bg-green-100 hover:bg-green-200 text-green-700 flex-1 font-semibold rounded-lg h-8 py-0"
          onClick={handleAction}
        >
          Chi tiết
        </Button>
        <Button
          variant="outline"
          className="aspect-square p-2 rounded-lg border-gray-200 hover:bg-gray-50 h-8 w-8 flex items-center justify-center"
          onClick={handleAction}
        >
          <Pencil className="w-3.5 h-3.5 text-gray-600" />
        </Button>
      </div>
    </div>
  );
}
