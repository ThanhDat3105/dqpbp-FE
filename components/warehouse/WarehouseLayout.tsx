"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { HistoryPage } from "./HistoryPage";
import { InventoryPage } from "./InventoryPage";
import { OverviewPage } from "./OverviewPage";
import { WarehouseListPage } from "./WarehouseListPage";

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

const DEFAULT_TAB: TabId = "list";

const isTabId = (value: string | null): value is TabId =>
  TABS.some((tab) => tab.id === value);

export function WarehouseLayout() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // URL là nguồn duy nhất cho tab đang mở, nhờ vậy link dạng
  // /warehouse?tab=history từ dashboard mở thẳng đúng tab, và nút back cũng chạy
  const tabParam = searchParams.get("tab");
  const activeTab: TabId = isTabId(tabParam) ? tabParam : DEFAULT_TAB;

  const handleTabChange = (tab: TabId) => {
    router.replace(`${pathname}?tab=${tab}`, { scroll: false });
  };

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
    <div className="flex min-h-screen flex-col bg-gray-50">
      <div className="flex items-center space-x-1 rounded-xl bg-[#556B2F] px-6 py-2">
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={cn(
              "cursor-pointer rounded-xl px-5 py-2.5 text-sm font-medium whitespace-nowrap text-white transition-all",
              activeTab === tab.id ? "bg-white/20 shadow-sm" : "",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 p-6">
        {renderContent()}
      </div>
    </div>
  );
}
