"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Person, PersonType } from "@/components/map/types";
import FilterSidebar from "@/components/map/FilterSidebar";
import { MOCK_PERSONS } from "@/components/map/mockData";
import NeighborhoodFilterPanel from "@/components/map/NeighborhoodFilterPanel";
import type {
  NeighborhoodCode,
  NeighborhoodFeatureCollection,
} from "@/components/map/neighborhood-types";
// import type { PersonType } from "@/components/map/types";

import { useAuth } from "@/context/AuthContext";
import { mapNeighborhoodApi } from "@/services/api/map-neighborhood";
import { getMapPersons } from "@/services/api/map";

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

const DQTT_VISIBLE_TYPES: PersonType[] = ["DQCD"];
const ALL_VISIBLE_TYPES: PersonType[] = ["TUOI_17", "QUAN_NHAN_DU_BI", "DQCD"];

function buildInitialVisibility(
  allowedTypes: PersonType[],
): Record<PersonType, boolean> {
  return {
    TUOI_17: allowedTypes.includes("TUOI_17"),
    QUAN_NHAN_DU_BI: allowedTypes.includes("QUAN_NHAN_DU_BI"),
    DQCD: allowedTypes.includes("DQCD"),
    HQ: true,
  };
}

export default function BanDoPage() {
  const { user } = useAuth();

  const isDQTT = user?.role === "DQTT";
  const allowedTypes = isDQTT ? DQTT_VISIBLE_TYPES : ALL_VISIBLE_TYPES;

  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [visibleTypes, setVisibleTypes] = useState<Record<PersonType, boolean>>(
    () => buildInitialVisibility(allowedTypes),
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [neighborhoodData, setNeighborhoodData] =
    useState<NeighborhoodFeatureCollection | null>(null);
  const [visibleNeighborhoodCodes, setVisibleNeighborhoodCodes] = useState<
    NeighborhoodCode[]
  >([]);
  const [neighborhoodError, setNeighborhoodError] = useState(false);
  useEffect(() => {
    let cancelled = false;

    mapNeighborhoodApi
      .getNeighborhoods()
      .then((data) => {
        if (cancelled) return;
        const codes = data.features
          .filter((feature) => feature.properties.kind === "neighborhood")
          .map((feature) => feature.properties.code as NeighborhoodCode);

        setNeighborhoodData(data);
        setVisibleNeighborhoodCodes(codes);
        setNeighborhoodError(false);
      })
      .catch(() => {
        if (cancelled) return;
        setNeighborhoodData(null);
        setNeighborhoodError(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    setVisibleTypes(buildInitialVisibility(allowedTypes));
  }, [user?.role]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError("");

        const data = await getMapPersons();
        setPersons(data);
      } catch (err) {
        console.error(err);
        setError("Không thể tải dữ liệu bản đồ");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function handleToggle(type: PersonType) {
    if (!allowedTypes.includes(type)) return;
    setVisibleTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  }

  return (
    <div className="-m-6 flex flex-col" style={{ height: "calc(100vh - 0px)" }}>
      <div className="flex-1 flex relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-white/70">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600 text-sm font-medium">
                Đang tải dữ liệu...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[9999] bg-red-600 text-white px-4 py-2 rounded-lg shadow">
            {error}
          </div>
        )}

        <div className="flex-1 relative">
          <MapView
            persons={MOCK_PERSONS}
            visibleTypes={visibleTypes}
            neighborhoodData={neighborhoodData}
            visibleNeighborhoodCodes={visibleNeighborhoodCodes}
          />
        </div>

        <div className="pointer-events-auto absolute right-3 top-3 z-1000 hidden flex-col items-stretch gap-3 md:flex">
          <FilterSidebar
            visibleTypes={visibleTypes}
            onToggle={handleToggle}
            persons={persons}
            allowedTypes={allowedTypes}
          />
          {neighborhoodData && (
            <NeighborhoodFilterPanel
              data={neighborhoodData}
              visibleCodes={visibleNeighborhoodCodes}
              onVisibleCodesChange={setVisibleNeighborhoodCodes}
            />
          )}
        </div>
        {neighborhoodError && (
          <div className="pointer-events-none absolute left-14 top-3 z-1000 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 shadow">
            Không thể tải ranh giới Khu phố
          </div>
        )}
        <button
          type="button"
          className="absolute right-3 top-3 z-1000 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow md:hidden"
          onClick={() => setSidebarOpen((open) => !open)}
        >
          {sidebarOpen ? "Đóng bộ lọc" : "Mở bộ lọc"}
        </button>
        {/* Mobile bottom sheet */}

        {sidebarOpen && (
          <div className="md:hidden absolute bottom-0 left-0 right-0 z-2000 p-3">
            <FilterSidebar
              visibleTypes={visibleTypes}
              onToggle={handleToggle}
              persons={persons}
              allowedTypes={allowedTypes}
            />
          </div>
        )}
      </div>
    </div>
  );
}