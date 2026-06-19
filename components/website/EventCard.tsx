import { MapPin, Clock } from "lucide-react";
import type { WebsiteEvent } from "@/lib/mock/website";

interface Props {
  event: WebsiteEvent;
}

const statusConfig = {
  upcoming: { label: "Sắp diễn ra", className: "bg-green-100 text-green-700" },
  past: { label: "Đã diễn ra", className: "bg-gray-100 text-gray-600" },
  important: { label: "Quan trọng", className: "bg-red-100 text-red-600" },
};

export default function EventCard({ event }: Props) {
  const [day, month, year] = event.date.split("/");
  const status = statusConfig[event.status];

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex">
      {/* Date block */}
      <div className="bg-[#546a2f] text-white flex flex-col items-center justify-center px-4 py-4 min-w-18">
        <span className="text-2xl font-bold leading-none">{day}</span>
        <span className="text-xs uppercase mt-1 text-yellow-300">
          Th{month}/{year.slice(2)}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col justify-between flex-1">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2">
              {event.title}
            </h3>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 ${status.className}`}
            >
              {status.label}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-2">
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3 text-[#546a2f]" /> {event.time}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="w-3 h-3 text-[#546a2f]" /> {event.location}
          </span>
        </div>
      </div>
    </div>
  );
}
