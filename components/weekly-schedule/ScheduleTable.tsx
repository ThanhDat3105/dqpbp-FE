import React from "react";
import { ShiftType, SlotData, WeeklyResponse } from "@/services/api/schedule";

interface ScheduleTableProps {
  data: WeeklyResponse | null;
  loading: boolean;
  search: string;
}

const SLOT_COLORS: Record<ShiftType, { bg: string; text: string }> = {
  SANG: { bg: "#DBEAFE", text: "#1E40AF" },
  CHIEU: { bg: "#FEF3C7", text: "#92400E" },
  DEM: { bg: "#EDE9FE", text: "#5B21B6" },
};

const DAYS = [
  { id: 1, label: "Thứ 2" },
  { id: 2, label: "Thứ 3" },
  { id: 3, label: "Thứ 4" },
  { id: 4, label: "Thứ 5" },
  { id: 5, label: "Thứ 6" },
  { id: 6, label: "Thứ 7", isWeekend: true },
  { id: 7, label: "CHỦ NHẬT", isWeekend: true },
];

function isDemOverride(slot: SlotData | null | undefined): boolean {
  if (!slot) return false;
  // if end time >= "21:00" -> use DEM colors
  return slot.end.localeCompare("21:00") >= 0;
}

const getSlotColor = (slot: SlotData | null | undefined, shift: ShiftType) => {
  if (!slot) return { bg: "transparent", text: "#9CA3AF" };
  let s = shift;
  if (isDemOverride(slot)) s = "DEM";
  if (s === "SANG") return { bg: "#E0F2FE", text: "#0369A1" };
  if (s === "CHIEU") return { bg: "#FFEDD5", text: "#C2410C" };
  return { bg: "#F3E8FF", text: "#7E22CE" }; // DEM
};

const SlotCell: React.FC<{
  slot: SlotData | null | undefined;
}> = ({ slot }) => {
  if (!slot) {
    return <span>—</span>;
  }
  // Remove spaces around "h" for formatting like image: "7h - 10h"
  const startStr = slot.start.replace(":00", "h").replace(":", "h");
  const endStr = slot.end.replace(":00", "h").replace(":", "h");
  return (
    <span className="font-medium text-[13px]">
      {startStr} - {endStr}
    </span>
  );
};

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  data,
  loading,
  search,
}) => {
  const filteredMembers =
    data?.members.filter((m) =>
      m.name.toLowerCase().includes(search.toLowerCase()),
    ) ?? [];

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
        <div className="overflow-x-auto p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-full"></div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] border-b border-gray-200">
              <th className="px-2 py-2 text-left text-[11px] font-bold text-[#6B7280] uppercase tracking-wide min-w-[150px] sticky left-0 z-20 bg-[#F9FAFB] border-r border-gray-200 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.05)]">
                Họ và tên
              </th>
              <th className="px-2 py-2 text-center text-[11px] font-bold text-[#6B7280] uppercase tracking-wide min-w-[60px] bg-[#F9FAFB] border-r border-gray-200">
                Ca
              </th>
              {DAYS.map((d) => (
                <th
                  key={d.id}
                  className={`px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide min-w-[90px] border-r border-gray-200 bg-[#F9FAFB] ${
                    d.id === 7
                      ? "text-[#DC2626] bg-[#FEF2F2]"
                      : d.id === 6
                        ? "text-[#DC2626]"
                        : "text-[#6B7280]"
                  }`}
                >
                  {d.label}
                </th>
              ))}
              <th className="px-2 py-2 text-center text-[11px] font-bold text-[#6B7280] uppercase tracking-wide min-w-[80px] bg-[#F9FAFB]">
                Số lần huy động
              </th>
            </tr>
          </thead>
          {filteredMembers.length === 0 ? (
            <tbody>
              <tr>
                <td
                  colSpan={10}
                  className="py-10 text-center text-sm text-gray-500"
                >
                  Không tìm thấy thành viên nào
                </td>
              </tr>
            </tbody>
          ) : (
            filteredMembers.map((member) => (
              <tbody key={member.user_id} className="group/member">
                {/* SANG row */}
                <tr className="border-b border-gray-200 bg-white group/row hover:bg-gray-50 transition-colors">
                  <td
                    rowSpan={3}
                    className="px-2 py-1 align-middle border-r border-[#E5E7EB] sticky left-0 z-10 bg-white group-hover/member:bg-gray-50 transition-colors shadow-[2px_0_4px_-1px_rgba(0,0,0,0.05)]"
                  >
                    <div className="font-bold text-[13px] text-gray-900 leading-tight">
                      {member.name}
                    </div>
                  </td>
                  <td className="px-2 py-1 text-center border-r border-[#E5E7EB] align-middle">
                    <span className="text-[12px] font-bold text-[#0284c7]">
                      SÁNG
                    </span>
                  </td>
                  {DAYS.map((d) => {
                    const slot = member.schedule[d.id]?.["SANG"];
                    const style = getSlotColor(slot, "SANG");
                    return (
                      <td
                        key={d.id}
                        className="px-2 py-1 text-center border-r border-[#E5E7EB] align-middle group-hover/row:brightness-95 transition-all"
                        style={{ backgroundColor: style.bg, color: style.text }}
                      >
                        <SlotCell slot={slot} />
                      </td>
                    );
                  })}
                  <td
                    rowSpan={3}
                    className="px-2 py-1 text-center align-middle group-hover/member:bg-gray-50 bg-white transition-colors border-b-2 border-gray-300"
                  >
                    <div className="font-bold text-[14px] text-[#556B2F]">
                      {member.mobilize_count}
                    </div>
                    <div className="text-[10px] text-gray-400">lần</div>
                  </td>
                </tr>
                {/* CHIEU row */}
                <tr className="border-b border-gray-200 bg-white group/row hover:bg-gray-50 transition-colors">
                  <td className="px-2 py-1 text-center border-r border-[#E5E7EB] align-middle">
                    <span className="text-[12px] font-bold text-[#ea580c]">
                      CHIỀU
                    </span>
                  </td>
                  {DAYS.map((d) => {
                    const slot = member.schedule[d.id]?.["CHIEU"];
                    const style = getSlotColor(slot, "CHIEU");
                    return (
                      <td
                        key={d.id}
                        className="px-2 py-1 text-center border-r border-[#E5E7EB] align-middle group-hover/row:brightness-95 transition-all"
                        style={{ backgroundColor: style.bg, color: style.text }}
                      >
                        <SlotCell slot={slot} />
                      </td>
                    );
                  })}
                </tr>
                {/* DEM row */}
                <tr className="border-b border-gray-300 bg-white group/row hover:bg-gray-50 transition-colors">
                  <td className="px-2 py-1 text-center border-r border-[#E5E7EB] align-middle">
                    <span className="text-[12px] font-bold text-[#9333ea]">
                      TỐI
                    </span>
                  </td>
                  {DAYS.map((d) => {
                    const slot = member.schedule[d.id]?.["DEM"];
                    const style = getSlotColor(slot, "DEM");
                    return (
                      <td
                        key={d.id}
                        className="px-2 py-1 text-center border-r border-[#E5E7EB] align-middle group-hover/row:brightness-95 transition-all"
                        style={{ backgroundColor: style.bg, color: style.text }}
                      >
                        <SlotCell slot={slot} />
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            ))
          )}
        </table>
      </div>

      {data && (
        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between text-xs text-gray-500 border-t border-gray-200">
          <div>
            {filteredMembers.length} / {data.total} thành viên
          </div>
          <div>
            Cập nhật:{" "}
            {data.last_updated
              ? new Date(data.last_updated).toLocaleString("en-GB")
              : "N/A"}
          </div>
        </div>
      )}
    </div>
  );
};
