"use client";

import { useEffect, useRef, useState } from "react";
import NeighborhoodPolygonLayer from "./NeighborhoodPolygonLayer";
import type {
  NeighborhoodCode,
  NeighborhoodFeatureCollection,
} from "./neighborhood-types";
import PersonPopup from "./PersonPopup";
import type { Person, PersonType } from "./types";
import { PIN_CONFIG } from "./types";

interface MapViewProps {
  persons: Person[];
  visibleTypes: Record<PersonType, boolean>;
  neighborhoodData?: NeighborhoodFeatureCollection | null;
  visibleNeighborhoodCodes?: readonly NeighborhoodCode[];
}

const MAP_CENTER: [number, number] = [10.74, 106.628];
const MAP_ZOOM = 15;

/* ---------- SVG icon helpers ---------- */
function makeCircleIcon(color: string, size = 32) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 3}" fill="${color}" stroke="white" stroke-width="3"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

function makeStarIcon(color = "#D69E2E", size = 36) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
      fill="${color}" stroke="white" stroke-width="1.5"/>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export default function MapView({
  persons,
  visibleTypes,
  neighborhoodData = null,
  visibleNeighborhoodCodes = [],
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);
  const markersRef = useRef<Map<string, import("leaflet").Marker>>(new Map());
  const [leafletMap, setLeafletMap] = useState<import("leaflet").Map | null>(
    null,
  );
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [mapType, setMapType] = useState<"street" | "satellite" | "hybrid">(
    "street",
  );

  // Tile layers
  const TILE_LAYERS = {
    street: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    hybrid:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  };

  const tileLayerRef = useRef<import("leaflet").TileLayer | null>(null);
  const labelLayerRef = useRef<import("leaflet").TileLayer | null>(null);

  // Init map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;
    if (leafletMapRef.current) return;

    let cancelled = false;
    let createdMap: import("leaflet").Map | null = null;
    const container = mapRef.current;

    void import("leaflet").then((L) => {
      if (cancelled || !container.isConnected || leafletMapRef.current) return;

      // Fix default icon paths
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)
        ._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "",
        iconUrl: "",
        shadowUrl: "",
      });

      const map = L.map(container, {
        center: MAP_CENTER,
        zoom: MAP_ZOOM,
        zoomControl: true,
      });
      createdMap = map;

      // Default tile layer
      tileLayerRef.current = L.tileLayer(TILE_LAYERS.street, {
        attribution: "© OpenStreetMap",
        maxZoom: 20,
      }).addTo(map);

      leafletMapRef.current = map;
      setLeafletMap(map);
      // Close popup when clicking map background
      map.on("click", () => setSelectedPerson(null));
    });

    return () => {
      cancelled = true;
      if (!createdMap) return;

      markersRef.current.clear();
      createdMap.remove();

      if (leafletMapRef.current === createdMap) {
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update tile layer when mapType changes
  useEffect(() => {
    if (!leafletMap) return;
    void import("leaflet").then((L) => {
      tileLayerRef.current?.remove();
      labelLayerRef.current?.remove();

      if (mapType === "street") {
        tileLayerRef.current = L.tileLayer(TILE_LAYERS.street, {
          attribution: "© OpenStreetMap",
          maxZoom: 20,
        }).addTo(leafletMap);
        labelLayerRef.current = null;
      } else {
        tileLayerRef.current = L.tileLayer(TILE_LAYERS.satellite, {
          attribution: "© Esri",
          maxZoom: 20,
        }).addTo(leafletMap);
        if (mapType === "hybrid") {
          labelLayerRef.current = L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            { attribution: "© OpenStreetMap", opacity: 0.5, maxZoom: 20 },
          ).addTo(leafletMap);
        } else {
          labelLayerRef.current = null;
        }
      }
    });
  }, [leafletMap, mapType]);

  // Sync markers
  useEffect(() => {
    if (!leafletMap) return;

    void import("leaflet").then((L) => {
      // Remove all existing markers
      markersRef.current.forEach((marker) => {
        marker.remove();
      });
      markersRef.current.clear();

      persons.forEach((person) => {
        if (!visibleTypes[person.type]) return;

        const isHQ = person.type === "HQ";
        const iconUrl = isHQ
          ? makeStarIcon("#D69E2E", 36)
          : makeCircleIcon(PIN_CONFIG[person.type].color, 28);

        const icon = L.icon({
          iconUrl,
          iconSize: isHQ ? [36, 36] : [28, 28],
          iconAnchor: isHQ ? [18, 18] : [14, 14],
          popupAnchor: [0, -20],
        });

        const marker = L.marker([person.lat, person.lng], { icon })
          .addTo(leafletMap)
          .on("click", (e) => {
            e.originalEvent.stopPropagation();
            setSelectedPerson(person);
            leafletMap.panTo([person.lat, person.lng]);
          });

        markersRef.current.set(person.id, marker);
      });
    });
  }, [leafletMap, persons, visibleTypes]);

  const btnBase =
    "px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer";
  const btnActive = "bg-[#6B8E23] text-white shadow";
  const btnInactive = "bg-white text-gray-700 hover:bg-gray-100 shadow-sm";

  return (
    <div className="relative w-full h-full">
      {/* Map container */}
      <div ref={mapRef} className="w-full h-full" />
      <NeighborhoodPolygonLayer
        map={leafletMap}
        data={neighborhoodData}
        visibleCodes={visibleNeighborhoodCodes}
      />
      {/* Map type controls — top left */}
      <div className="absolute bottom-3 left-3 z-1000 flex gap-1 bg-white/90 backdrop-blur rounded-xl p-1 shadow-lg">
        {(
          [
            { key: "street", label: "Bản đồ" },
            { key: "satellite", label: "Vệ tinh" },
            { key: "hybrid", label: "Kết hợp" },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMapType(key)}
            className={`${btnBase} ${mapType === key ? btnActive : btnInactive}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Popup overlay */}
      {selectedPerson && (
        <PersonPopup
          person={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}

      {/* Popup animation style */}
      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
