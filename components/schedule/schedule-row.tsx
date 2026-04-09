import { ScheduleRow as ScheduleRowData, VN_DAYS, parseLocalDate, formatDayMonth } from "./schedule-data";
import { cn } from "@/lib/utils";

interface ScheduleRowProps {
  row: ScheduleRowData;
  isEven: boolean;
  isToday: boolean;
}

export default function ScheduleRow({ row, isEven, isToday }: ScheduleRowProps) {
  const date   = parseLocalDate(row.date);
  const dayIdx = date.getDay(); // 0=Sun…6=Sat
  const dayLabel = VN_DAYS[dayIdx];

  // DQCD codes split into badges
  const patrolCodes = row.dqcd_patrol
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const cellBase = "px-3 py-4 text-center text-sm align-top";
  const nameCell = cn(cellBase, "text-gray-700 leading-snug");

  return (
    <tr
      className={cn(
        "border-b border-gray-100 transition-colors duration-150",
        isToday
          ? "bg-olive-50 ring-1 ring-inset ring-[#6B8E23]/30"
          : isEven
          ? "bg-gray-50/70 hover:bg-gray-100/80"
          : "bg-white hover:bg-gray-50",
      )}
    >
      {/* ── Thứ / Ngày ── */}
      <td
        className={cn(
          "px-4 py-4 text-center align-top sticky left-0 z-10 border-r border-gray-200 min-w-[90px]",
          isToday
            ? "bg-[#6B8E23]/10"
            : isEven
            ? "bg-gray-100"
            : "bg-gray-50",
        )}
      >
        <div className={cn("font-semibold text-sm", isToday ? "text-[#6B8E23]" : "text-gray-800")}>
          {dayLabel}
        </div>
        <div className={cn("text-xs mt-0.5", isToday ? "text-[#6B8E23]" : "text-gray-400")}>
          {formatDayMonth(date)}
        </div>
        {isToday && (
          <span className="mt-1 inline-block text-[10px] font-bold bg-[#6B8E23] text-white rounded px-1.5 py-0.5">
            Hôm nay
          </span>
        )}
      </td>

      {/* ── Trực chỉ huy ── */}
      <td className={nameCell}>{row.commander}</td>

      {/* ── Trực ban ── */}
      <td className={nameCell}>{row.duty_officer}</td>

      {/* ── Trực công văn ── */}
      <td className={nameCell}>{row.document_officer}</td>

      {/* ── Trực nội vụ ── */}
      <td className={nameCell}>{row.internal_affairs}</td>

      {/* ── Trực cơm ── */}
      <td className={nameCell}>{row.meal_duty}</td>

      {/* ── Trực trụ sở ── */}
      <td className={cn(nameCell, "max-w-[140px] leading-snug")}>
        {row.office_duty}
      </td>

      {/* ── DQTT phụ trách A ── */}
      <td className={nameCell}>{row.dqtt_leader}</td>

      {/* ── DQCD trực – Tuần tra ── */}
      <td className={cn(cellBase, "align-top")}>
        <div className="flex flex-wrap gap-1 justify-center">
          {patrolCodes.map((code) => (
            <span
              key={code}
              className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#6B8E23]/10 text-[#4a6318] border border-[#6B8E23]/20"
            >
              {code}
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
}
