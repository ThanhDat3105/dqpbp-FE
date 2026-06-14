import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DueDatePickerProps {
  disabled?: boolean;
  value: string;
  /** Restrict hours/minutes to be strictly after this HH:MM value */
  minTime?: string;
  onChange: (value: string) => void;
}

export default function DueDatePicker({
  disabled,
  value,
  minTime,
  onChange,
}: DueDatePickerProps) {
  const [hour, setHour] = useState(() => value?.slice(0, 2) ?? "");
  const [minute, setMinute] = useState(() => value?.slice(3, 5) ?? "");

  const [minH, minM] = minTime ? minTime.split(":").map(Number) : [-1, -1];

  const handleHourChange = (h: string) => {
    setHour(h);
    setMinute("");
    onChange("");
  };

  const handleMinuteChange = (m: string) => {
    setMinute(m);
    onChange(`${hour}:${m}`);
  };

  const hourOptions = Array.from({ length: 24 }, (_, i) =>
    String(i).padStart(2, "0"),
  ).filter((h) => !minTime || Number(h) >= minH);

  const minuteOptions = ["00", "15", "30", "45"].filter((m) => {
    if (!minTime || !hour) return true;
    const h = Number(hour);
    if (h > minH) return true;
    return Number(m) > minM;
  });

  return (
    <div className="flex gap-1 items-center">
      <Select value={hour} onValueChange={handleHourChange} disabled={disabled}>
        <SelectTrigger className="flex-1 text-sm h-9">
          <SelectValue placeholder="Giờ" />
        </SelectTrigger>
        <SelectContent>
          {hourOptions.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-gray-400 text-sm shrink-0">:</span>
      <Select
        value={minute}
        onValueChange={handleMinuteChange}
        disabled={disabled || !hour}
      >
        <SelectTrigger className="flex-1 text-sm h-9">
          <SelectValue placeholder="Phút" />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
