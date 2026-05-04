"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { PersonType } from "@/components/map/types";
import { MOCK_PERSONS } from "@/components/map/mockData";
import FilterSidebar from "@/components/map/FilterSidebar";

// Dynamic import to avoid SSR issues with Leaflet
const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-gray-600 text-sm font-medium">
          Đang tải bản đồ...
        </span>
      </div>
    </div>
  ),
});

export default function BanDoPage() {
  const [visibleTypes, setVisibleTypes] = useState<Record<PersonType, boolean>>(
    {
      TUOI_17: false,
      QUAN_NHAN_DU_BI: false,
      DQCD: false,
      HQ: true,
    },
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleToggle(type: PersonType) {
    setVisibleTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  }

  return (
    /*
     * The (root) layout sets `main` to have `p-6` and `overflow-y-auto`.
     * We use -m-6 to bleed all the way to the main edges, then set explicit
     * height so the map fills the available viewport height.
     */
    <div className="-m-6 flex flex-col" style={{ height: "calc(100vh - 0px)" }}>
      {/* Top Banner */}
      {/* <div
        className="flex items-center gap-3 px-4 py-2.5 shrink-0 shadow-md z-10"
        style={{ background: "#2D3B2D" }}
      >
        <div className="w-8 h-8 shrink-0">
          <svg viewBox="0 0 32 32" width="32" height="32">
            <circle
              cx="16"
              cy="16"
              r="15"
              fill="#D69E2E"
              stroke="#fff"
              strokeWidth="1"
            />
            <polygon
              points="16,5 18.47,12.6 26.51,12.6 20.02,17.4 22.49,25 16,20.2 9.51,25 11.98,17.4 5.49,12.6 13.53,12.6"
              fill="#2D3B2D"
            />
          </svg>
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="text-white font-bold text-sm leading-tight tracking-wide">
            BẢN ĐỒ ĐỊNH VỊ LỰC LƯỢNG
          </span>
          <span className="text-green-300 text-xs leading-tight">
            Dân quân Phường Bình Phú — Quận 6, TP. Hồ Chí Minh
          </span>
        </div>

        <button
          className="md:hidden bg-white/10 hover:bg-white/20 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors shrink-0"
          onClick={() => setSidebarOpen((v) => !v)}
        >
          {sidebarOpen ? "✕ Đóng" : "☰ Lọc"}
        </button>
      </div> */}

      <div className="flex-1 flex relative overflow-hidden">
        <div className="flex-1 relative">
          <MapView persons={MOCK_PERSONS} visibleTypes={visibleTypes} />
        </div>

        <div className="hidden md:block absolute right-3 top-3 z-1000 pointer-events-auto">
          <FilterSidebar
            visibleTypes={visibleTypes}
            onToggle={handleToggle}
            persons={MOCK_PERSONS}
          />
        </div>

        {/* Mobile bottom sheet */}
        {sidebarOpen && (
          <div className="md:hidden absolute bottom-0 left-0 right-0 z-2000 p-3">
            <FilterSidebar
              visibleTypes={visibleTypes}
              onToggle={handleToggle}
              persons={MOCK_PERSONS}
            />
          </div>
        )}
      </div>
    </div>
  );
}
