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

/* ---------- SVG pin helpers ---------- */

// Kích thước marker khi render (px)
const PIN_SIZE = { width: 22, height: 35 };
const HQ_PIN_SIZE = { width: 27, height: 43 };

/**
 * Hệ toạ độ gốc của pin — mọi hằng số hình học bên dưới nằm trong viewBox này.
 * Dáng "quả bóng": đầu tròn to r=11 tâm (12,12), thân thóp ngắn xuống
 * mũi (12, 29.4), kèm một chấm tròn rời bên dưới đánh dấu vị trí thật.
 */
const PIN_VIEWBOX = { width: 24, height: 38 };

// Hai cạnh thân là tiếp tuyến từ mũi tới đầu tròn (cos a = r/d, d = 17.4)
const PIN_PATH = "M12 29.4 L3.477 18.954 A11 11 0 1 1 20.523 18.954 Z";

// Chấm rời dưới mũi — tâm chấm chính là điểm neo của marker
const PIN_DOT = { cx: 12, cy: 34.2, r: 2.5 };

const PIN_HOLE = { cx: 12, cy: 12, r: 4.6 };

// Sao 5 cánh tâm (12,12), R=6.2 / r=2.7 — dùng cho trụ sở
const HQ_STAR_POINTS =
  "12,5.8 13.59,9.82 17.9,10.08 14.57,12.83 15.64,17.02 12,14.7 8.36,17.02 9.43,12.83 6.1,10.08 10.41,9.82";

/** Tỉ lệ vị trí điểm neo theo chiều cao icon */
const PIN_ANCHOR_RATIO = PIN_DOT.cy / PIN_VIEWBOX.height;

/**
 * Chỉ những person có toạ độ thật mới dựng được marker.
 * Number.isFinite loại luôn null / undefined / NaN / chuỗi mà không ép kiểu,
 * nên bắt được cả trường hợp API trả về null dù type khai báo là number.
 */
function hasValidCoords(person: Person) {
  return (
    Number.isFinite(person.lat) &&
    Number.isFinite(person.lng) &&
    Math.abs(person.lat) <= 90 &&
    Math.abs(person.lng) <= 180
  );
}

function makePinIcon(
  color: string,
  variant: "dot" | "star" = "dot",
  size = PIN_SIZE,
) {
  const inner =
    variant === "star"
      ? `<polygon points="${HQ_STAR_POINTS}" fill="#fff"/>`
      : `<circle cx="${PIN_HOLE.cx}" cy="${PIN_HOLE.cy}" r="${PIN_HOLE.r}" fill="#fff"/>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${PIN_VIEWBOX.width} ${PIN_VIEWBOX.height}">
    <path d="${PIN_PATH}" fill="${color}" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/>
    <circle cx="${PIN_DOT.cx}" cy="${PIN_DOT.cy}" r="${PIN_DOT.r}" fill="${color}" stroke="#fff" stroke-width="1.4"/>
    ${inner}
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

        console.log(
          hasValidCoords(person),
          person.name,
          person.lat,
          person.lng,
        );

        // Chưa có lat/lng thì không render marker
        if (!hasValidCoords(person)) return;

        const isHQ = person.type === "HQ";
        const size = isHQ ? HQ_PIN_SIZE : PIN_SIZE;
        const iconUrl = makePinIcon(
          PIN_CONFIG[person.type].color,
          isHQ ? "star" : "dot",
          size,
        );

        const icon = L.icon({
          iconUrl,
          iconSize: [size.width, size.height],
          // Chấm tròn dưới cùng trùng đúng toạ độ thật
          iconAnchor: [size.width / 2, size.height * PIN_ANCHOR_RATIO],
          popupAnchor: [0, -size.height * PIN_ANCHOR_RATIO],
          className: "dq-map-pin",
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

      {/* Popup animation + pin style */}
      <style>{`
        @keyframes popupIn {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        /* Không đụng transform: Leaflet dùng transform để định vị marker */
        .dq-map-pin {
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
          transition: filter 0.15s ease;
        }
        .dq-map-pin:hover {
          filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.4)) brightness(1.08);
        }
      `}</style>
    </div>
  );
}
