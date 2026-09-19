"use client";

import { PIN_CONFIG } from "./types";
import type { Person } from "./types";

interface PersonPopupProps {
  person: Person;
  onClose: () => void;
}

export default function PersonPopup({ person, onClose }: PersonPopupProps) {
  const cfg = PIN_CONFIG[person.type];

  return (
    <div
      className="absolute z-9999 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      style={{
        width: 320,
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        border: "2px solid rgba(0,0,0,0.08)",
        animation: "popupIn 0.2s ease-out",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Name bar */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{ background: cfg.color }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="white"
          className="shrink-0"
        >
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
        <span className="text-white font-bold text-sm flex-1 truncate">
          {person.name}
        </span>
        {/* Role badge */}
        <span
          className="text-white text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.25)",
            border: "1px solid rgba(255,255,255,0.5)",
          }}
        >
          {cfg.label}
        </span>
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="flex-shrink-0 bg-white/20 hover:bg-white/40 text-white rounded-full w-6 h-6 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Đóng"
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Details */}
      <div className="px-3 py-2 space-y-1.5">
        <div className="flex items-start gap-2">
          <span className="text-base leading-5 flex-shrink-0">🏠</span>
          <span className="text-xs text-gray-700 leading-5">
            {person.address}
          </span>
        </div>
      </div>
    </div>
  );
}
