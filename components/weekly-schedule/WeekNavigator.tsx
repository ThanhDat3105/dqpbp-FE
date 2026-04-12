import React from "react";
import { WeekInfo } from "@/services/api/schedule";
import { format, subWeeks, addWeeks, parseISO } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface WeekNavigatorProps {
  week: WeekInfo | null;
  weekStart: string;
  onPrev: () => void;
  onNext: () => void;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  week,
  weekStart,
  onPrev,
  onNext,
}) => {
  let displayString = "";
  if (week) {
    displayString = `Tuần ${week.week_number}: ${format(parseISO(week.start), "dd/MM/yyyy")} – ${format(parseISO(week.end), "dd/MM/yyyy")}`;
  } else {
    try {
      const start = parseISO(weekStart);
      displayString = `Loading... ${format(start, "dd/MM/yyyy")}`;
    } catch {
      displayString = "Loading...";
    }
  }

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={onPrev}
        className="p-1 rounded hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft className="w-5 h-5 text-gray-600" />
      </button>
      <span className="font-semibold text-gray-700 min-w-[250px] text-center">
        {displayString}
      </span>
      <button
        onClick={onNext}
        className="p-1 rounded hover:bg-gray-100 transition-colors"
      >
        <ChevronRight className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
};
