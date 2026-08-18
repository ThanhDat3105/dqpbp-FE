"use client";

import { useEffect, useMemo, useRef } from "react";
import type {
  NeighborhoodCode,
  NeighborhoodFeature,
  NeighborhoodFeatureCollection,
} from "./neighborhood-types";

interface NeighborhoodFilterPanelProps {
  data: NeighborhoodFeatureCollection;
  visibleCodes: readonly NeighborhoodCode[];
  onVisibleCodesChange: (codes: NeighborhoodCode[]) => void;
}

export default function NeighborhoodFilterPanel({
  data,
  visibleCodes,
  onVisibleCodesChange,
}: NeighborhoodFilterPanelProps) {
  const selectAllRef = useRef<HTMLInputElement>(null);
  const neighborhoods = useMemo(
    () =>
      data.features
        .filter(
          (feature): feature is NeighborhoodFeature =>
            feature.properties.kind === "neighborhood",
        )
        .sort((left, right) =>
          left.properties.code.localeCompare(right.properties.code),
        ),
    [data],
  );
  const visibleCodeSet = useMemo(() => new Set(visibleCodes), [visibleCodes]);
  const { allCodes, toggleableCodes, lockedCodes } = useMemo(() => {
    const all: NeighborhoodCode[] = [];
    const toggleable: NeighborhoodCode[] = [];
    const locked: NeighborhoodCode[] = [];

    for (const feature of neighborhoods) {
      const code = feature.properties.code as NeighborhoodCode;
      all.push(code);
      (feature.properties.canToggle ? toggleable : locked).push(code);
    }

    return { allCodes: all, toggleableCodes: toggleable, lockedCodes: locked };
  }, [neighborhoods]);
  const checkedCount = allCodes.filter((code) =>
    visibleCodeSet.has(code),
  ).length;
  const allChecked = allCodes.length > 0 && checkedCount === allCodes.length;
  const allToggleableChecked = toggleableCodes.every((code) =>
    visibleCodeSet.has(code),
  );

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        checkedCount > 0 && checkedCount < allCodes.length;
    }
  }, [allCodes.length, checkedCount]);

  const handleSelectAll = () => {
    onVisibleCodesChange(allToggleableChecked ? lockedCodes : allCodes);
  };

  const handleToggle = (code: NeighborhoodCode) => {
    if (!toggleableCodes.includes(code)) return;

    const nextCodes = visibleCodeSet.has(code)
      ? visibleCodes.filter((item) => item !== code)
      : [...visibleCodes, code];
    onVisibleCodesChange([...nextCodes].sort());
  };

  return (
    <section
      className="flex h-[320px] max-h-[48vh] min-h-[220px] w-[260px] min-w-[220px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      aria-label="Lọc ranh giới Khu phố"
    >
      <div className="shrink-0 bg-[#6B8E23] px-4 py-3 text-sm font-semibold tracking-wide text-white">
        Ranh giới Khu phố
      </div>

      <label className="flex shrink-0 cursor-pointer items-center gap-3 border-b border-gray-100 px-4 py-3 hover:bg-gray-50">
        <input
          ref={selectAllRef}
          type="checkbox"
          checked={allChecked}
          disabled={toggleableCodes.length === 0}
          onChange={handleSelectAll}
          className="size-4 accent-green-600 disabled:cursor-not-allowed"
        />
        <span className="text-sm font-medium text-gray-700">Chọn tất cả</span>
      </label>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {neighborhoods.map((feature) => {
          const code = feature.properties.code as NeighborhoodCode;
          const canToggle = feature.properties.canToggle;
          return (
            <label
              key={code}
              className={`flex items-center gap-3 border-b border-gray-100 px-4 py-2.5 ${
                canToggle
                  ? "cursor-pointer hover:bg-gray-50"
                  : "cursor-not-allowed bg-gray-50/70"
              }`}
            >
              <input
                type="checkbox"
                checked={visibleCodeSet.has(code)}
                disabled={!canToggle}
                onChange={() => handleToggle(code)}
                className="size-4 disabled:cursor-not-allowed"
                style={{ accentColor: feature.properties.fillColor }}
              />
              <span
                className="size-3 shrink-0 rounded-sm border"
                style={{
                  backgroundColor: feature.properties.fillColor,
                  borderColor: feature.properties.borderColor,
                }}
              />
              <span className="text-sm font-semibold text-gray-800">
                Khu phố {code.slice(2)}
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
