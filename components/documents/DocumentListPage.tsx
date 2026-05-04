"use client";

import { useState, useMemo } from "react";
import { History, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { DocumentFilters } from "./DocumentFilters";
import { DocumentTable } from "./DocumentTable";
import { mockDocuments } from "./mockData";
import { Document } from "./types";

export function DocumentListPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("Tất cả");
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const filteredDocs = useMemo(() => {
    if (selectedCategory === "Tất cả") {
      return mockDocuments;
    }
    return mockDocuments.filter((doc) => doc.category === selectedCategory);
  }, [selectedCategory]);

  const handleDevFeatureClick = () => {
    toast("Tính năng đang phát triển");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">
          Danh Sách Tài Liệu
        </h1>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={handleDevFeatureClick}
            className="cursor-pointer"
          >
            <History className="w-4 h-4 mr-2" />
            Lịch sử xóa
          </Button>
          <Button
            className="bg-[#556B2F] hover:bg-[#465e17] text-white cursor-pointer"
            onClick={handleDevFeatureClick}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* Main Content Card Wrap */}
      <div className="bg-white rounded-lg border border-gray-200 flex flex-col">
        {/* Filters Top Bar */}
        <div className="p-4 border-b border-gray-100">
          <DocumentFilters
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* List Table */}
        <div className="flex-1">
          <DocumentTable documents={filteredDocs} />
        </div>
      </div>
    </div>
  );
}
