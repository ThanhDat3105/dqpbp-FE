"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { OverviewPage } from "./OverviewPage";
import { WarehouseListPage } from "./WarehouseListPage";
import { HistoryPage } from "./HistoryPage";
import { InventoryPage } from "./InventoryPage";

type TabId = "overview" | "list" | "history" | "inventory";

interface Tab {
  id: TabId;
  label: string;
}

const TABS: Tab[] = [
  { id: "overview", label: "Tổng quan" },
  { id: "list", label: "Danh sách kho" },
  { id: "history", label: "Lịch sử xuất nhập kho" },
  { id: "inventory", label: "Kiểm kê" },
];

export function WarehouseLayout() {
  const [activeTab, setActiveTab] = useState<TabId>("list");

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewPage />;
      case "list":
        return <WarehouseListPage />;
      case "history":
        return <HistoryPage />;
      case "inventory":
        return <InventoryPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-[#556B2F] px-6 py-2 flex items-center space-x-1 rounded-xl">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium transition-all rounded-xl whitespace-nowrap text-white cursor-pointer",
              activeTab === tab.id ? "bg-white/20 shadow-sm" : "",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {renderContent()}
      </div>
    </div>
  );
}
