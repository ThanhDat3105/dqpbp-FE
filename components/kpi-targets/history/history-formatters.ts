import type { KpiTargetHistoryAction } from "@/types/kpi-target-history";

export const ACTION_PRESENTATION: Record<
  KpiTargetHistoryAction,
  { label: string; className: string }
> = {
  UPDATE_TARGET: { label: "Sửa số", className: "bg-slate-100 text-slate-700" },
  UPDATE_ALLOCATION: {
    label: "Phân bổ",
    className: "bg-slate-100 text-slate-700",
  },
  ADD_LINE: {
    label: "Thêm dòng",
    className: "bg-emerald-100 text-emerald-700",
  },
  DELETE_LINE: { label: "Xóa dòng", className: "bg-red-100 text-red-700" },
};

export function getActionPresentation(action: string) {
  return (
    ACTION_PRESENTATION[action as KpiTargetHistoryAction] ?? {
      label: action,
      className: "bg-slate-100 text-slate-700",
    }
  );
}

export function formatChangedAt(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const parts = new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((result, part) => {
      result[part.type] = part.value;
      return result;
    }, {});
  return `${parts.day}/${parts.month}/${parts.year} ${parts.hour}:${parts.minute}`;
}

export function formatHistoryValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") return value.toLocaleString("vi-VN");
  if (typeof value === "string" || typeof value === "boolean")
    return String(value);
  if (Array.isArray(value)) return value.map(formatHistoryValue).join(", ");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, item]) => `${key}: ${formatHistoryValue(item)}`)
      .join("; ");
  }
  return String(value);
}
