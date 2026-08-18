"use client";

import type { Map as LeafletMap } from "leaflet";
import { useEffect } from "react";
import type {
  NeighborhoodCode,
  NeighborhoodFeature,
  NeighborhoodFeatureCollection,
} from "./neighborhood-types";

interface NeighborhoodPolygonLayerProps {
  map: LeafletMap | null;
  data: NeighborhoodFeatureCollection | null;
  visibleCodes: readonly NeighborhoodCode[];
}

const PANE_NAME = "neighborhood-polygons";
const POLYGON_PANE_Z_INDEX = "350";

export default function NeighborhoodPolygonLayer({
  map,
  data,
  visibleCodes,
}: NeighborhoodPolygonLayerProps) {
  useEffect(() => {
    if (!map || !data) return;

    let disposed = false;
    let layer: import("leaflet").GeoJSON | null = null;

    import("leaflet").then((L) => {
      if (disposed) return;

      const pane = map.getPane(PANE_NAME) ?? map.createPane(PANE_NAME);
      pane.style.zIndex = POLYGON_PANE_Z_INDEX;
      pane.style.pointerEvents = "none";

      const visibleCodeSet = new Set(visibleCodes);
      const visibleData: NeighborhoodFeatureCollection = {
        type: "FeatureCollection",
        features: data.features.filter(
          (feature) =>
            feature.properties.kind === "ward" ||
            visibleCodeSet.has(feature.properties.code as NeighborhoodCode),
        ),
      };

      layer = L.geoJSON(visibleData, {
        pane: PANE_NAME,
        interactive: false,
        style: (rawFeature) => {
          const feature = rawFeature as NeighborhoodFeature;
          const isWard = feature.properties.kind === "ward";

          return {
            color: feature.properties.borderColor,
            fillColor: feature.properties.fillColor,
            fillOpacity: isWard ? 0 : 0.28,
            opacity: 0.9,
            weight: isWard ? 3 : 2,
          };
        },
      }).addTo(map);
    });

    return () => {
      disposed = true;
      if (layer) map.removeLayer(layer);
    };
  }, [data, map, visibleCodes]);

  return null;
}
