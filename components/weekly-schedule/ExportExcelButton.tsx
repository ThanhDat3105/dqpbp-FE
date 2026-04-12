import React from "react";
import * as XLSX from "xlsx";
import { MemberSchedule, ShiftType } from "@/services/api/schedule";
import { Download } from "lucide-react";

interface ExportExcelButtonProps {
  members: MemberSchedule[];
  weekLabel: string;
}

export const ExportExcelButton: React.FC<ExportExcelButtonProps> = ({
  members,
  weekLabel,
}) => {
  const exportToExcel = () => {
    const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const rows: Record<string, string | number>[] = [];

    for (const m of members) {
      for (const shift of ["SANG", "CHIEU"] as ShiftType[]) {
        const row: Record<string, string | number> = {
          Name: shift === "SANG" ? m.name : "",
          Shift: shift,
        };
        for (let d = 1; d <= 7; d++) {
          const dayData = m.schedule[d];
          const slot = dayData?.[shift];
          row[DAY_LABELS[d - 1]] = slot ? `${slot.start}–${slot.end}` : "—";
        }
        row["Mobilize Count"] = shift === "SANG" ? m.mobilize_count : "";
        rows.push(row);
      }
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, weekLabel);
    XLSX.writeFile(wb, `schedule_${weekLabel}.xlsx`);
  };

  return (
    <button
      onClick={exportToExcel}
      className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-[#556B2F] text-white rounded-md text-sm font-medium hover:bg-[#556b2fc1] transition-colors"
    >
      <Download className="w-4 h-4" />
      Xuất Excel
    </button>
  );
};
