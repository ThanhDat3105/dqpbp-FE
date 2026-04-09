import { TimeSlot, STATUS_CONFIG } from "./availability-data";
import { cn } from "@/lib/utils";

interface AvailabilityCellProps {
  slot: TimeSlot;
}

export default function AvailabilityCell({ slot }: AvailabilityCellProps) {
  const cfg = STATUS_CONFIG[slot.status];

  return (
    <td
      className={cn(
        "border border-gray-300 p-2 text-center align-middle",
        "transition-all duration-150",
        cfg.bg,
        cfg.border,
      )}
      title={`${slot.time} – ${cfg.label}`}
    >
      <span className={cn("text-xs font-medium leading-tight", cfg.text)}>
        {slot.time}
      </span>
    </td>
  );
}
