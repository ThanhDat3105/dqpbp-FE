import { UserSchedule, DAY_KEYS } from "./availability-data";
import AvailabilityCell from "./availability-cell";
import { cn } from "@/lib/utils";

interface AvailabilityRowProps {
  user: UserSchedule;
  isEven: boolean;
}

export default function AvailabilityRow({ user, isEven }: AvailabilityRowProps) {
  return (
    <>
      {/* ── Morning row ── */}
      <tr
        className={cn(
          "group border-b border-gray-200 transition-colors",
          isEven ? "bg-white" : "bg-gray-50/60",
          "hover:brightness-95",
        )}
      >
        {/* Name cell – rowspan 2 */}
        <td
          rowSpan={2}
          className="border border-gray-300 px-3 py-2 align-middle bg-white min-w-[140px] sticky left-0 z-10 shadow-[2px_0_4px_-1px_rgba(0,0,0,0.06)]"
        >
          <div className="font-semibold text-sm text-gray-900 leading-tight">
            {user.name}
          </div>
          {user.role && (
            <div className="text-[10px] text-gray-400 mt-0.5">{user.role}</div>
          )}
        </td>

        {/* Shift label */}
        <td className="border border-gray-300 px-2 py-1.5 text-center align-middle bg-blue-50 min-w-[58px]">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wide">
            Sáng
          </span>
        </td>

        {/* Day cells – morning */}
        {DAY_KEYS.map((day) => (
          <AvailabilityCell key={day} slot={user.shifts[day].morning} />
        ))}

        {/* Total – only first row, rowspan 2 */}
        <td
          rowSpan={2}
          className="border border-gray-300 px-2 py-2 text-center align-middle bg-white font-bold text-gray-800 text-sm min-w-[80px]"
        >
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-lg font-extrabold text-[#6B8E23]">
              {user.total_assignments}
            </span>
            <span className="text-[10px] text-gray-400 font-normal">lần</span>
          </div>
        </td>
      </tr>

      {/* ── Afternoon row ── */}
      <tr
        className={cn(
          "group border-b border-gray-200 transition-colors",
          isEven ? "bg-white" : "bg-gray-50/60",
          "hover:brightness-95",
        )}
      >
        {/* Shift label */}
        <td className="border border-gray-300 px-2 py-1.5 text-center align-middle bg-orange-50 min-w-[58px]">
          <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wide">
            Chiều
          </span>
        </td>

        {/* Day cells – afternoon */}
        {DAY_KEYS.map((day) => (
          <AvailabilityCell key={day} slot={user.shifts[day].afternoon} />
        ))}
      </tr>
    </>
  );
}
