import { cn } from "@/lib/utils";
import type {
  OfficeColumn,
  ScheduleRow as ScheduleRowData,
} from "./schedule-data";

interface ScheduleRowProps {
  row: ScheduleRowData;
  dayLabel: string;
  officeColumns: OfficeColumn[];
  canEdit?: boolean;
  onEdit: (row: ScheduleRowData) => void;
}

export default function ScheduleRow({
  row,
  dayLabel,
  officeColumns,
  canEdit = true,
  onEdit,
}: ScheduleRowProps) {
  const patrolCodes = Array.isArray(row.dqcd_patrol) ? row.dqcd_patrol : [];

  const cellBase =
    "px-3 py-4 text-center text-sm align-top transition-colors";
  const nameCell = cn(cellBase, "text-gray-700 leading-snug");

  const renderValue = (val: string | undefined | null) => {
    if (!val || val.trim() === "") {
      return <span className="text-gray-300 italic text-xs">Phân công +</span>;
    }
    return val;
  };

  return (
    <tr
      onClick={() => {
        if (canEdit) onEdit(row);
      }}
      className={cn(
        "border-b border-gray-100 bg-white transition-colors duration-150 group",
        canEdit && "hover:bg-gray-50 cursor-pointer",
      )}
    >
      {/* ── Thứ/Ngày ── */}
      <td className="px-4 py-4 text-center align-top sticky left-0 z-10 border-r border-gray-200 bg-gray-50 min-w-25">
        <div className="font-semibold text-sm text-gray-800">{dayLabel}</div>
      </td>

      {/* ── Trực chỉ huy ── */}
      <td className={nameCell}>{renderValue(row.commander)}</td>

      {/* ── Trực ban ── */}
      <td className={nameCell}>{renderValue(row.duty_officer)}</td>

      {/* ── Trực công văn ── */}
      <td className={nameCell}>{renderValue(row.document_officer)}</td>

      {/* ── Trực nội vụ ── */}
      <td className={nameCell}>{renderValue(row.internal_affairs)}</td>

      {/* ── Trực cơm ── */}
      <td className={nameCell}>{renderValue(row.meal_duty)}</td>

      {/* ── Trực trụ sở (Dynamic) ── */}
      {officeColumns.map((col) => (
        <td
          key={col.code}
          className={cn(nameCell, "max-w-35 leading-snug")}
        >
          {renderValue(row.office_duties?.[col.code])}
        </td>
      ))}

      {/* ── DQTT phụ trách ── */}
      <td className={nameCell}>{renderValue(row.dqtt_leader)}</td>

      {/* ── DQCD trực – Tuần tra ── */}
      <td className={cn(cellBase, "align-top")}>
        {patrolCodes.length > 0 ? (
          <div className="flex flex-wrap gap-1 justify-center">
            {patrolCodes.map((code) => (
              <span
                key={code}
                className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#556B2F]/10 text-[#4a6318] border border-[#6B8E23]/20"
              >
                {code}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-300 italic text-xs">Phân công +</span>
        )}
      </td>
    </tr>
  );
}
